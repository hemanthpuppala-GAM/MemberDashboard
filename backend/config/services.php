<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    | Passwordless member sign-in (Design.md §8).
    | Set client_id + client_secret per provider. When unset and
    | OAUTH_DEV_BYPASS=true, clicking a provider mints a local demo member.
    */
    'oauth' => [
        // Signs people in WITHOUT Google when no keys are set. Local development only:
        // off by default, and ignored outside APP_ENV=local (see OAuthController).
        'dev_bypass' => (bool) env('OAUTH_DEV_BYPASS', false),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],

    'microsoft' => [
        'client_id' => env('MICROSOFT_CLIENT_ID'),
        'client_secret' => env('MICROSOFT_CLIENT_SECRET'),
        'redirect' => env('MICROSOFT_REDIRECT_URI'),
    ],

    'facebook' => [
        'client_id' => env('FACEBOOK_CLIENT_ID'),
        'client_secret' => env('FACEBOOK_CLIENT_SECRET'),
        'redirect' => env('FACEBOOK_REDIRECT_URI'),
    ],

    // Ask-a-question routing. primary = published call/message line; web = receives every
    // website/QR WhatsApp send. Digits only (E.164 without '+').
    // Members sign in with Google only. The demo account and email/password sign-up/sign-in are
    // switched off unless explicitly enabled (local testing).
    'member_auth' => [
        'password_and_demo' => (bool) env('MEMBER_PASSWORD_LOGIN', false),
    ],

    'support' => [
        'primary' => env('SUPPORT_PRIMARY', '917396112111'),
        'web' => env('SUPPORT_WEB', '917396119111'),
        'cc_email' => env('SUPPORT_CC_EMAIL', 'goldenageguruteachings@gmail.com'),
    ],

    'apple' => [
        'client_id' => env('APPLE_CLIENT_ID'),
        'client_secret' => env('APPLE_CLIENT_SECRET'),
        'redirect' => env('APPLE_REDIRECT_URI'),
    ],

    // Claude reads photos / PDFs of sign-up sheets (SheetReader). Without a key, CSV upload still works.
    'anthropic' => [
        'key' => env('ANTHROPIC_API_KEY'),
        'model' => env('ANTHROPIC_MODEL', 'claude-opus-5-5'),
        'base_url' => env('ANTHROPIC_BASE_URL'),
    ],

    // The YouTube channel whose Shorts can be picked as video testimonials (Admin → Testimonials →
    // Import from YouTube). Public RSS feeds only — no API key. Set the id to skip looking it up.
    'youtube' => [
        'channel' => env('YOUTUBE_CHANNEL', '@GoldenAgeGurus'),
        'channel_id' => env('YOUTUBE_CHANNEL_ID'),
    ],

    // Google Drive folder the team drops video testimonials into. `testimonials:drive-import` copies
    // new videos onto this server as draft testimonials. The folder must be shared "anyone with
    // the link"; the key is a plain API key restricted to the Drive API (no billing needed).
    'google_drive' => [
        'api_key' => env('GOOGLE_DRIVE_API_KEY'),
        'testimonials_folder' => env('GOOGLE_DRIVE_TESTIMONIALS_FOLDER'),
        'max_mb' => (int) env('GOOGLE_DRIVE_MAX_MB', 200),
    ],

    // Live site's Supabase project — read-only source for `php artisan supabase:sync` and
    // Admin → People → Data sync. The service key bypasses row security: keep it in .env only.
    'supabase' => [
        'url' => env('SUPABASE_URL'),
        'service_key' => env('SUPABASE_SERVICE_KEY'),
        // Daily 03:00 IST pull (routes/console.php). Set false at go-live.
        'auto_sync' => (bool) env('SUPABASE_AUTO_SYNC', true),
    ],

];
