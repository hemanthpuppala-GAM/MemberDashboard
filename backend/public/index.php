<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Served from a subfolder via the backend-root .htaccess (cPanel: the URL is
// /staging/backend/api/..., the script is /staging/backend/public/index.php).
// Symfony can't derive the base URL from that pair and would route the full
// path, so every request 404s. Present the script as living beside artisan.
$script = $_SERVER['SCRIPT_NAME'] ?? '';
if (str_ends_with($script, '/public/index.php')
    && ! str_starts_with($_SERVER['REQUEST_URI'] ?? '', dirname($script).'/')) {
    $_SERVER['SCRIPT_NAME'] = $_SERVER['PHP_SELF'] = dirname($script, 2).'/index.php';
}

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
