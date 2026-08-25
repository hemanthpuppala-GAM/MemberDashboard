<?php

namespace App\Services\Auth;

use App\Models\Auth\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * Passwordless OAuth for members (Design.md §8).
 * Uses raw OAuth 2.0 — no Socialite dependency — so local installs stay lean.
 */
class OAuthService
{
    public const PROVIDERS = ['google', 'microsoft', 'facebook', 'apple'];

    public function isConfigured(string $provider): bool
    {
        return filled(config("services.{$provider}.client_id"))
            && filled(config("services.{$provider}.client_secret"));
    }

    public function authorizationUrl(string $provider, string $state): string
    {
        return match ($provider) {
            'google' => $this->buildUrl('https://accounts.google.com/o/oauth2/v2/auth', [
                'client_id' => config('services.google.client_id'),
                'redirect_uri' => $this->callbackUrl($provider),
                'response_type' => 'code',
                'scope' => 'openid email profile',
                'state' => $state,
                'access_type' => 'online',
                'prompt' => 'select_account',
            ]),
            'microsoft' => $this->buildUrl('https://login.microsoftonline.com/common/oauth2/v2.0/authorize', [
                'client_id' => config('services.microsoft.client_id'),
                'redirect_uri' => $this->callbackUrl($provider),
                'response_type' => 'code',
                'scope' => 'openid email profile User.Read',
                'state' => $state,
                'response_mode' => 'query',
            ]),
            'facebook' => $this->buildUrl('https://www.facebook.com/v19.0/dialog/oauth', [
                'client_id' => config('services.facebook.client_id'),
                'redirect_uri' => $this->callbackUrl($provider),
                'state' => $state,
                'scope' => 'email,public_profile',
            ]),
            'apple' => $this->buildUrl('https://appleid.apple.com/auth/authorize', [
                'client_id' => config('services.apple.client_id'),
                'redirect_uri' => $this->callbackUrl($provider),
                'response_type' => 'code',
                'response_mode' => 'form_post',
                'scope' => 'name email',
                'state' => $state,
            ]),
            default => throw new \InvalidArgumentException("Unknown OAuth provider: {$provider}"),
        };
    }

    public function userFromCode(string $provider, string $code): array
    {
        return match ($provider) {
            'google' => $this->googleUser($code),
            'microsoft' => $this->microsoftUser($code),
            'facebook' => $this->facebookUser($code),
            'apple' => $this->appleUser($code),
            default => throw new \InvalidArgumentException("Unknown OAuth provider: {$provider}"),
        };
    }

    /** Find or create a member user from an OAuth identity. */
    public function upsertUser(string $provider, array $identity): User
    {
        $email = $identity['email'] ?? null;
        if (! $email) {
            throw new \RuntimeException('OAuth provider did not return an email address.');
        }

        $user = User::where('oauth_provider', $provider)
            ->where('oauth_provider_id', $identity['id'])
            ->first();

        if (! $user) {
            $user = User::where('email', $email)->first();
        }

        if (! $user) {
            $user = new User([
                'email' => $email,
                'password' => Str::password(64),
                'status' => 'active',
            ]);
        }

        $user->fill([
            'name' => $identity['name'] ?: ($user->name ?: Str::before($email, '@')),
            'email' => $email,
            'oauth_provider' => $provider,
            'oauth_provider_id' => (string) $identity['id'],
            'avatar_url' => $identity['avatar'] ?? $user->avatar_url,
            'email_verified_at' => $user->email_verified_at ?? now(),
            'status' => $user->status ?: 'active',
            'last_login_at' => now(),
        ]);
        $user->save();

        return $user;
    }

    public function callbackUrl(string $provider): string
    {
        return rtrim(config('app.url'), '/')."/api/v1/auth/{$provider}/callback";
    }

    private function googleUser(string $code): array
    {
        $token = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'code' => $code,
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'redirect_uri' => $this->callbackUrl('google'),
            'grant_type' => 'authorization_code',
        ])->throw()->json();

        $profile = Http::withToken($token['access_token'])
            ->get('https://www.googleapis.com/oauth2/v3/userinfo')
            ->throw()
            ->json();

        return [
            'id' => $profile['sub'],
            'email' => $profile['email'] ?? null,
            'name' => $profile['name'] ?? ($profile['given_name'] ?? null),
            'avatar' => $profile['picture'] ?? null,
        ];
    }

    private function microsoftUser(string $code): array
    {
        $token = Http::asForm()->post('https://login.microsoftonline.com/common/oauth2/v2.0/token', [
            'code' => $code,
            'client_id' => config('services.microsoft.client_id'),
            'client_secret' => config('services.microsoft.client_secret'),
            'redirect_uri' => $this->callbackUrl('microsoft'),
            'grant_type' => 'authorization_code',
        ])->throw()->json();

        $profile = Http::withToken($token['access_token'])
            ->get('https://graph.microsoft.com/v1.0/me')
            ->throw()
            ->json();

        return [
            'id' => $profile['id'],
            'email' => $profile['mail'] ?? $profile['userPrincipalName'] ?? null,
            'name' => $profile['displayName'] ?? null,
            'avatar' => null,
        ];
    }

    private function facebookUser(string $code): array
    {
        $token = Http::get('https://graph.facebook.com/v19.0/oauth/access_token', [
            'code' => $code,
            'client_id' => config('services.facebook.client_id'),
            'client_secret' => config('services.facebook.client_secret'),
            'redirect_uri' => $this->callbackUrl('facebook'),
        ])->throw()->json();

        $profile = Http::get('https://graph.facebook.com/me', [
            'fields' => 'id,name,email,picture.type(large)',
            'access_token' => $token['access_token'],
        ])->throw()->json();

        return [
            'id' => $profile['id'],
            'email' => $profile['email'] ?? null,
            'name' => $profile['name'] ?? null,
            'avatar' => $profile['picture']['data']['url'] ?? null,
        ];
    }

    private function appleUser(string $code): array
    {
        // Apple returns identity token; full JWT verification needs a client secret JWT.
        // When Apple is configured, exchange the code then decode the id_token payload.
        $token = Http::asForm()->post('https://appleid.apple.com/auth/token', [
            'code' => $code,
            'client_id' => config('services.apple.client_id'),
            'client_secret' => config('services.apple.client_secret'),
            'redirect_uri' => $this->callbackUrl('apple'),
            'grant_type' => 'authorization_code',
        ])->throw()->json();

        $parts = explode('.', $token['id_token'] ?? '');
        $payload = json_decode(base64_decode(strtr($parts[1] ?? '', '-_', '+/')) ?: '{}', true) ?: [];

        return [
            'id' => $payload['sub'] ?? null,
            'email' => $payload['email'] ?? null,
            'name' => null,
            'avatar' => null,
        ];
    }

    private function buildUrl(string $base, array $query): string
    {
        return $base.'?'.http_build_query($query);
    }
}
