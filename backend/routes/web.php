<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('welcome');
});

// Serves public disk files directly — some shared hosts don't honor
// FollowSymLinks even when set via .htaccess, which otherwise 404s every
// uploaded media URL that would normally be served straight by Apache via
// the public/storage symlink.
Route::get('/storage/{path}', function (string $path) {
    abort_if(str_contains($path, '..'), 404);
    abort_unless(Storage::disk('public')->exists($path), 404);

    return Storage::disk('public')->response($path);
})->where('path', '.*');
