<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Runs via the cPanel cron `php artisan schedule:run` every minute (see DEPLOY.md).
// Back up first, then pull the live site's Supabase data (until go-live; SUPABASE_AUTO_SYNC=false stops it).
Schedule::command('db:backup')->dailyAt('02:45')->timezone('Asia/Kolkata');
Schedule::command('supabase:sync --write --scheduled')
    ->dailyAt('03:00')->timezone('Asia/Kolkata')
    ->withoutOverlapping()
    ->when(fn () => config('services.supabase.auto_sync') && \App\Services\People\SupabaseSync::configured());

// The Meditation page's "Short clips": read the YouTube channel once a day.
Schedule::command('youtube:refresh')->dailyAt('06:10')->timezone('Asia/Kolkata');

Artisan::command('youtube:refresh', function () {
    $feed = \App\Services\Content\YouTubeFeed::refresh();
    $this->info(count($feed['items']).' Shorts saved'.(isset($feed['fetched_at']) ? ' (read '.$feed['fetched_at'].')' : '').'.');
})->purpose('Read the latest Shorts from the YouTube channel (runs daily)');

// Video testimonials the team drops into the Google Drive folder → draft testimonials, once a day.
Schedule::command('testimonials:drive-import')->dailyAt('06:20')->timezone('Asia/Kolkata')
    ->withoutOverlapping()
    ->when(fn () => \App\Services\Content\DriveTestimonials::configured() && \App\Services\Content\DriveTestimonials::ready());

Artisan::command('testimonials:drive-import', function () {
    $report = \App\Services\Content\DriveTestimonials::import();
    foreach ($report['imported'] as $name) {
        $this->line('  + '.$name);
    }
    foreach ($report['skipped'] as $why) {
        $this->warn('  · skipped '.$why);
    }
    $this->info(count($report['imported']).' new video(s) added as draft testimonials.');
})->purpose('Copy new videos from the Google Drive testimonials folder (runs daily)');

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

// Remove what the previous public site left in the database: CMS sections seeded for it on the
// built-in pages (shown in admin as "Old site only") and the unused `page_contents` table.
// Dry run by default; pass --force to delete. Cannot be undone — take a backup first (db:backup).
Artisan::command('cms:delete-old-site {--force : Actually delete}', function () {
    $old = \App\Models\Cms\PageSection::query()
        ->whereHas('page', fn ($q) => $q->where('is_builtin', true))
        ->where('created_at', '<', \App\Models\Cms\Page::SITE_SECTIONS_SINCE);
    $sections = (clone $old)->count();
    $legacyRows = \Illuminate\Support\Facades\Schema::hasTable('page_contents')
        ? \Illuminate\Support\Facades\DB::table('page_contents')->count() : null;

    $this->line("Old-site CMS sections on built-in pages: {$sections}");
    $this->line('Legacy page_contents table: '.($legacyRows === null ? 'already gone' : "{$legacyRows} rows"));

    if (! $this->option('force')) {
        $this->warn('Dry run — nothing deleted. Run again with --force to delete (take a backup first: php artisan db:backup).');

        return;
    }

    $old->get()->each->delete(); // section content goes with it (cascade)
    \Illuminate\Support\Facades\Schema::dropIfExists('page_contents');
    $this->info("Deleted {$sections} old-site sections and the page_contents table.");
})->purpose('Delete the previous site\'s CMS sections and legacy content table (dry run unless --force)');

Artisan::command('supabase:sync {--write : Save the changes (default is a dry run)} {--from= : Folder of exported members.json/.csv, volunteers…, instead of the Supabase API} {--only=* : Only these tables} {--scheduled : Run by the daily schedule}', function () {
    $from = $this->option('from');
    if (! $from && ! \App\Services\People\SupabaseSync::configured()) {
        $this->error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env, or pass --from=<folder of exports>.');

        return 1;
    }
    $cache = \Illuminate\Support\Facades\Cache::store();
    try {
        $report = (new \App\Services\People\SupabaseSync($from ?: null))->run(! $this->option('write'), $this->option('only') ?: null);
    } catch (\Throwable $e) {
        report($e);
        // Shown on Admin → People → Data sync so a failed nightly run doesn't go unnoticed.
        $cache->forever(\App\Http\Controllers\Api\Admin\People\DataSyncController::ERROR_KEY, [
            'at' => now()->toIso8601String(),
            'message' => \Illuminate\Support\Str::limit(strtok($e->getMessage(), "\n"), 240),
        ]);
        $this->error('Sync failed — nothing was saved. '.$e->getMessage());

        return 1;
    }

    $this->table(['Table', 'Rows', 'Created', 'Updated', 'Unchanged', 'Skipped'], collect($report['counts'])
        ->map(fn ($c, $t) => [$t, $c['rows'], $c['created'], $c['updated'], $c['unchanged'], $c['skipped']])->values()->all());
    foreach ($report['notes'] as $note) {
        $this->line('  · '.$note);
    }
    if ($report['dry_run']) {
        $this->warn('Dry run — nothing saved. Run again with --write to apply.');
    } else {
        $cache->forever(\App\Http\Controllers\Api\Admin\People\DataSyncController::CACHE_KEY, $report + ['by' => $this->option('scheduled') ? 'daily schedule' : 'artisan']);
        $cache->forget(\App\Http\Controllers\Api\Admin\People\DataSyncController::ERROR_KEY);
        $this->info('Saved. Safe to run again any time — nothing is duplicated.');
    }

    return 0;
})->purpose('Copy members, volunteers, practice, journal and support-desk data from the live Supabase');
