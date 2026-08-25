<?php

namespace App\Http\Controllers\Api\Public\Auth;

use App\Http\Controllers\Controller;
use App\Models\Auth\User;
use App\Services\Auth\OAuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class OAuthController extends Controller
{
    public function __construct(private OAuthService $oauth) {}

    /** Start OAuth — redirects the browser to the identity provider. */
    public function redirect(string $provider)
    {
        abort_unless(in_array($provider, OAuthService::PROVIDERS, true), 404);

        // Local/dev without provider keys: mint a member session immediately.
        if (! $this->oauth->isConfigured($provider) && config('services.oauth.dev_bypass')) {
            $user = $this->oauth->upsertUser($provider, [
                'id' => "dev-{$provider}",
                'email' => "{$provider}.dev@goldenagewisdom.org",
                'name' => ucfirst($provider).' Member',
                'avatar' => null,
            ]);

            return $this->finishAndRedirect($user);
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
            $user = $this->oauth->upsertUser($provider, $identity);
        } catch (\Throwable $e) {
            report($e);

            return $this->errorRedirect('Could not complete sign-in. Please try again.');
        }

        return $this->finishAndRedirect($user);
    }

    /** Passwordless demo account (Design.md §8.2) — nothing persisted server-side beyond a short-lived token. */
    public function demo()
    {
        $user = User::updateOrCreate(
            ['email' => 'demo@goldenagewisdom.org'],
            [
                'name' => 'Demo Seeker',
                'password' => Str::password(64),
                'status' => 'active',
                'oauth_provider' => 'demo',
                'oauth_provider_id' => 'demo',
                'email_verified_at' => now(),
                'last_login_at' => now(),
            ],
        );

        $token = $user->createToken('member-demo')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->present($user),
            'demo' => true,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $this->present($request->user()),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    private function finishAndRedirect(User $user)
    {
        $token = $user->createToken('member-dashboard')->plainTextToken;
        $frontend = rtrim((string) env('FRONTEND_URL', 'http://localhost:5173'), '/');

        return redirect()->away($frontend.'/auth/callback?token='.urlencode($token));
    }

    private function errorRedirect(string $message)
    {
        $frontend = rtrim((string) env('FRONTEND_URL', 'http://localhost:5173'), '/');

        return redirect()->away($frontend.'/join?error='.urlencode($message));
    }

    private function stateKey(string $state): string
    {
        return 'oauth_state:'.$state;
    }

    private function present(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar_url' => $user->avatar_url,
            'oauth_provider' => $user->oauth_provider,
            'role' => $user->primaryRole?->name ?? ($user->roles()->exists() ? $user->roles()->first()?->name : 'member'),
            'is_admin' => $user->roles()->exists(),
        ];
    }
}
