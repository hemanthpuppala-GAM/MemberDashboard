<?php

return [

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    // FRONTEND_URL must be an origin only (scheme://host[:port]) — no path.
    // CORS_ALLOWED_ORIGINS can add more, comma-separated (e.g. a staging
    // frontend URL alongside the production one).
    'allowed_origins' => array_values(array_filter(array_map(
        'trim',
        explode(',', env('CORS_ALLOWED_ORIGINS', env('FRONTEND_URL', 'http://localhost:5173')))
    ))),

    // Local dev frontends call this backend directly (see frontend/.env.development),
    // including against the deployed staging server, so always allow any localhost
    // port regardless of APP_ENV. Vite picks the next free port if 5173 is taken.
    'allowed_origins_patterns' => ['#^http://(localhost|127\.0\.0\.1):\d+$#'],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
