<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Runs via the cPanel cron `php artisan schedule:run` (see DEPLOY.md).
Schedule::command('db:backup')->dailyAt('03:30');
