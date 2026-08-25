<?php

namespace App\Http\Controllers\Api\Public\Auth;

use App\Http\Controllers\Controller;
use App\Models\People\Member;
use App\Services\Auth\OAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * Passwordless sign-in for the member portal. Tokens issued here belong to a
 * Member, so /auth/me, /auth/logout and every /member endpoint are shared with
 * MemberAuthController's email+password flow.
 */
class OAuthController extends Controller
{
    public function __construct(private OAuthService $oauth) {}

    /** Start OAuth — redirects the browser to the identity provider. */
    public function redirect(string $provider)
    {
        abort_unless(in_array($provider, OAuthService::PROVIDERS, true), 404);

        // Local/dev without provider keys: mint a member session immediately.
        if (! $this->oauth->isConfigured($provider) && config('services.oauth.dev_bypass')) {
            $member = $this->oauth->upsertMember($provider, [
                'id' => "dev-{$provider}",
                'email' => "{$provider}.dev@goldenagewisdom.org",
                'name' => ucfirst($provider).' Member',
                'avatar' => null,
            ]);

            return $this->finishAndRedirect($member);
        }

        abort_unless($this->oauth->isConfigured($provider), 503, "OAuth provider [{$provider}] is not configured.");

        $state = Str::random(40);
        Cache::put($this->stateKey($state), $provider, now()->addMinutes(10));

        return redirect()->away($this->oauth->authorizationUrl($provider, $state));
    }

    /** OAuth callback — exchange code, issue Sanctum token, bounce to frontend. */
    public function callback(Request $request, string $provider)
    {
        abort_unless(in_array($provider, OAuthService::PROVIDERS, true), 404);

        if ($request->filled('error')) {
            return $this->errorRedirect($request->string('error_description')->toString() ?: 'Sign-in was cancelled.');
        }

        $state = $request->string('state')->toString();
        $cached = Cache::pull($this->stateKey($state));
        if (! $cached || $cached !== $provider) {
            return $this->errorRedirect('Sign-in session expired. Please try again.');
        }

        $code = $request->string('code')->toString();
        if ($code === '') {
            return $this->errorRedirect('Missing authorization code.');
        }

        try {
            $identity = $this->oauth->userFromCode($provider, $code);
            $member = $this->oauth->upsertMember($provider, $identity);
        } catch (\Throwable $e) {
            report($e);

            return $this->errorRedirect('Could not complete sign-in. Please try again.');
        }

        return $this->finishAndRedirect($member);
    }

    /** Passwordless demo account (Design.md §8.2) — a shared, throwaway member. */
    public function demo()
    {
        $member = Member::firstOrCreate(
            ['email' => 'demo@goldenagewisdom.org'],
            [
                'name' => 'Demo Seeker',
                'category' => 'general',
                'status' => 'active',
                'join_date' => now(),
                'oauth_provider' => 'demo',
                'oauth_provider_id' => 'demo',
            ],
        );

        return response()->json([
            'token' => $member->createToken('member-demo')->plainTextToken,
            'user' => $member->toPortalArray(),
            'demo' => true,
        ]);
    }

    private function finishAndRedirect(Member $member)
    {
        $token = $member->createToken('member-dashboard')->plainTextToken;

        return redirect()->away($this->frontendUrl().'/auth/callback?token='.urlencode($token));
    }

    private function errorRedirect(string $message)
    {
        return redirect()->away($this->frontendUrl().'/join?error='.urlencode($message));
    }

    private function frontendUrl(): string
    {
        return rtrim((string) config('app.frontend_url'), '/');
    }

    private function stateKey(string $state): string
    {
        return 'oauth_state:'.$state;
    }
}
