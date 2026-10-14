<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Runs via the cPanel cron `php artisan schedule:run` (see DEPLOY.md).
Schedule::command('db:backup')->dailyAt('03:30');

// Store every page's full copy (defaults + any admin edits) in the database, so the DB alone
// holds the site's content. Never overwrites an admin edit; only fills keys the DB lacks.
Artisan::command('site-content:sync', function () {
    foreach (\App\Models\Site\SiteContent::PAGES as $page) {
        $row = \App\Models\Site\SiteContent::firstOrNew(['page' => $page]);
        $before = $row->data ?? [];
        $merged = \App\Models\Site\SiteContent::merged($page, $row->exists ? $row : null);
        if ($row->exists && $merged == $before) {
            $this->line("{$page}: up to date");
            continue;
        }
        $row->data = $merged;
        $row->save();
        $added = count(array_diff_key($merged, $before));
        $this->info("{$page}: stored ({$added} default keys added)");
    }
})->purpose('Copy all site page copy into the database (fills missing keys, keeps admin edits)');
