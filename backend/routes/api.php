<?php

use App\Http\Controllers\Api\Admin\ContactSubmissionController;
use App\Http\Controllers\Api\Admin\ContentController as AdminContentController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\EventController as AdminEventController;
use App\Http\Controllers\Api\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\SettingController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public, read-only
    Route::get('/content', [ContentController::class, 'index']);
    Route::get('/content/{slug}', [ContentController::class, 'show']);
    Route::get('/events', [EventController::class, 'index']);
    Route::get('/settings', [SettingController::class, 'index']);
    Route::post('/contact', [ContactController::class, 'store']);

    // Admin auth
    Route::post('/admin/login', [AuthController::class, 'login']);

    Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        Route::get('/dashboard', [DashboardController::class, 'index']);

        Route::get('/content', [AdminContentController::class, 'index']);
        Route::put('/content/{slug}', [AdminContentController::class, 'update']);

        Route::get('/events', [AdminEventController::class, 'index']);
        Route::post('/events', [AdminEventController::class, 'store']);
        Route::put('/events/{event}', [AdminEventController::class, 'update']);
        Route::delete('/events/{event}', [AdminEventController::class, 'destroy']);

        Route::get('/settings', [AdminSettingController::class, 'index']);
        Route::put('/settings', [AdminSettingController::class, 'update']);

        Route::get('/contact-submissions', [ContactSubmissionController::class, 'index']);
        Route::patch('/contact-submissions/{contactSubmission}', [ContactSubmissionController::class, 'update']);
    });
});
