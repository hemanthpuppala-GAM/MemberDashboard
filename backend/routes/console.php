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
