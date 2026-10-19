<?php

// Go live: the switch that makes this app the main goldenagewisdom.org site (Admin → Go live,
// `php artisan site:go-live`). See App\Services\Site\GoLive.
return [
    // The website folder on the server (holds the old site's .htaccess and, after a production
    // build, app/). Empty = two levels above this backend, i.e. public_html/goldenagewisdom.org.
    'site_root' => env('GOLIVE_SITE_ROOT'),

    // Where members land after Google sign-in, and links in emails, once the site is live.
    'live_url' => env('LIVE_URL', 'https://goldenagewisdom.org'),
];
