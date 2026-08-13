<?php

return [

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
    ],

    // Vite picks the next free port if 5173 is taken, so allow any localhost
    // port in local dev rather than hardcoding one.
    'allowed_origins_patterns' => env('APP_ENV') === 'local'
        ? ['#^http://(localhost|127\.0\.0\.1):\d+$#']
        : [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
