<?php

namespace App\Services\Site;

use App\Http\Controllers\Api\Admin\People\DataSyncController;
use App\Models\Settings\Setting;
use App\Services\People\SupabaseSync;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use RuntimeException;

/**
 * The go-live switch. The production build sits ready in <site>/app/ while the old site keeps
 * running; going live swaps the site's .htaccess for resources/go-live/htaccess-live, which sends
 * every address into app/ (instant, one file). Rolling back puts the old .htaccess back.
 *
 * State lives in settings rows under "golive." (hidden from Admin → Settings).
 */
class GoLive
{
    public const PREFIX = 'golive.';

    /** First line of the live routing file — tells an already-live .htaccess apart from the old site's. */
    public const MARKER = '# GAW-LIVE-ROUTING';

    private const HEARTBEAT = 'golive.heartbeat';

    public static function siteRoot(): string
    {
        return rtrim(config('golive.site_root') ?: dirname(base_path(), 2), '/');
    }

    public static function liveUrl(): string
    {
        return rtrim((string) config('golive.live_url'), '/');
    }

    /** Where members land after sign-in and where email links point: the main site once live. */
    public static function frontendUrl(): string
    {
        return self::isLive() ? self::liveUrl() : rtrim((string) config('app.frontend_url'), '/');
    }

    public static function isLive(): bool
    {
        try {
            return self::get('status') === 'live';
        } catch (\Throwable) {
            return false; // no database yet (fresh install, artisan before migrate)
        }
    }

    /** @return array{status: string, scheduled_at: ?string, scheduled_by: ?string, live_at: ?string, live_by: ?string, error: ?string, log: list<array{at: string, by: string, message: string}>} */
    public static function state(): array
    {
        return [
            'status' => self::get('status') ?? 'staging',
            'scheduled_at' => self::get('scheduled_at'),
            'scheduled_by' => self::get('scheduled_by'),
            'live_at' => self::get('live_at'),
            'live_by' => self::get('live_by'),
            'error' => self::get('error'),
            'log' => json_decode(self::get('log') ?? '[]', true) ?: [],
        ];
    }

    /**
     * What must be true before the switch. Blocking checks stop it; the rest are reminders.
     *
     * @return list<array{key: string, label: string, ok: bool, blocking: bool, detail: string}>
     */
    public static function checks(): array
    {
        $root = self::siteRoot();
        $index = $root.'/app/index.html';
        $html = is_file($index) ? (string) file_get_contents($index) : '';
        $built = $html !== '' && str_contains($html, '"/assets/');
        $prod = self::version($root.'/app/version.json');
        $staging = self::version($root.'/staging/preview/version.json');
        $htaccess = $root.'/.htaccess';
        $writable = is_dir($root) && is_writable($root) && (! is_file($htaccess) || is_writable($htaccess));
        $beat = Cache::get(self::HEARTBEAT);
        $sync = Cache::get(DataSyncController::CACHE_KEY);

        return [
            [
                'key' => 'build', 'label' => 'Production build uploaded to app/', 'ok' => $built, 'blocking' => true,
                'detail' => $built
                    ? 'Built '.(isset($prod['built_at']) ? Carbon::parse($prod['built_at'])->timezone(Setting::siteTimezone())->format('j M Y, g:i A') : 'at an unknown time').(isset($prod['sha']) ? ' from version '.substr($prod['sha'], 0, 7) : '').'.'
                    : ($html === '' ? 'Not found. In GitHub → Actions → Build deploy zips → Run workflow, choose "production".' : 'app/ holds a build for another address — run the production build again.'),
            ],
            [
                'key' => 'same_as_staging', 'label' => 'Production build matches staging', 'blocking' => false,
                'ok' => $prod && $staging && ($prod['sha'] ?? null) === ($staging['sha'] ?? null),
                'detail' => $prod && $staging
                    ? (($prod['sha'] ?? null) === ($staging['sha'] ?? null) ? 'Same version as the staging preview.' : 'Staging has newer changes — run the production build again so the live site gets them.')
                    : 'Version unknown (older build).',
            ],
            [
                'key' => 'writable', 'label' => 'Server can switch the site', 'ok' => $writable, 'blocking' => true,
                'detail' => $writable ? 'The site folder and its .htaccess can be updated.' : "Can't write to {$root} — check the folder permissions in cPanel.",
            ],
            [
                'key' => 'cron', 'label' => 'Scheduler running (needed for a scheduled time)', 'blocking' => false,
                'ok' => $beat && Carbon::parse($beat)->gt(now()->subMinutes(3)),
                'detail' => $beat ? 'Last ran '.Carbon::parse($beat)->diffForHumans().'.' : 'Not seen yet — fix the cPanel cron (/usr/local/bin/php … schedule:run). "Go live now" still works.',
            ],
            [
                'key' => 'sync', 'label' => 'Recent copy of the old site\'s data', 'blocking' => false,
                'ok' => ! SupabaseSync::configured() || ($sync && Carbon::parse($sync['ran_at'])->gt(now()->subDay())),
                'detail' => $sync ? 'Last Supabase sync '.Carbon::parse($sync['ran_at'])->diffForHumans().'. A final sync runs at the switch.' : 'A final sync runs at the switch.',
            ],
            [
                'key' => 'mail', 'label' => 'Emails are really sent', 'blocking' => false,
                'ok' => ! in_array(config('mail.default'), ['log', 'array'], true),
                'detail' => in_array(config('mail.default'), ['log', 'array'], true) ? 'MAIL_MAILER is "'.config('mail.default').'" — welcome and ticket emails are not delivered.' : 'Mail is set up.',
            ],
        ];
    }

    public static function schedule(Carbon $at, string $by): void
    {
        if (self::isLive()) {
            throw new RuntimeException('The site is already live.');
        }
        if ($at->lte(now())) {
            throw new RuntimeException('Pick a time in the future.');
        }
        self::put(['status' => 'scheduled', 'scheduled_at' => $at->utc()->toIso8601String(), 'scheduled_by' => $by, 'error' => null]);
        self::log($by, 'Scheduled for '.$at->copy()->timezone(Setting::siteTimezone())->format('j M Y, g:i A T').'.');
    }

    public static function cancel(string $by): void
    {
        if (self::get('status') === 'scheduled' || self::get('status') === 'failed') {
            self::put(['status' => 'staging', 'scheduled_at' => null, 'scheduled_by' => null, 'error' => null]);
            self::log($by, 'Schedule cancelled.');
        }
    }

    /** Make the new site live now. @return list<string> what happened, step by step */
    public static function goLive(string $by): array
    {
        if (self::isLive()) {
            throw new RuntimeException('The site is already live.');
        }
        $failed = array_filter(self::checks(), fn ($c) => $c['blocking'] && ! $c['ok']);
        if ($failed) {
            throw new RuntimeException('Not ready: '.implode('; ', array_map(fn ($c) => $c['label'].' — '.$c['detail'], $failed)));
        }

        $steps = [];
        // 1. Last copy of sign-ups made on the old site, so none are lost.
        if (SupabaseSync::configured()) {
            try {
                $report = (new SupabaseSync)->run(false);
                $made = array_sum(array_map(fn ($c) => $c['created'] + $c['updated'], $report['counts']));
                Cache::forever(DataSyncController::CACHE_KEY, $report + ['by' => 'go live']);
                $steps[] = "Final Supabase sync: {$made} new or updated rows.";
            } catch (\Throwable $e) {
                report($e);
                $steps[] = 'Final Supabase sync failed ('.strtok($e->getMessage(), "\n").') — run it again from Admin → Data sync.';
            }
        }
        // 2. Backup of this database.
        try {
            $steps[] = Artisan::call('db:backup') === 0 ? 'Database backed up.' : 'Database backup skipped: '.trim(Artisan::output());
        } catch (\Throwable $e) {
            $steps[] = 'Database backup skipped: '.$e->getMessage();
        }
        // 3. The switch itself.
        $root = self::siteRoot();
        $current = $root.'/.htaccess';
        $backup = $root.'/.htaccess.before-live';
        if (is_file($current) && ! str_starts_with((string) file_get_contents($current), self::MARKER)) {
            copy($current, $backup) || throw new RuntimeException("Couldn't back up {$current}.");
        }
        self::write($current, (string) file_get_contents(resource_path('go-live/htaccess-live')));
        $steps[] = 'Routing switched — goldenagewisdom.org now opens the new site.';

        self::put(['status' => 'live', 'live_at' => now()->toIso8601String(), 'live_by' => $by, 'scheduled_at' => null, 'error' => null]);
        foreach ($steps as $s) {
            self::log($by, $s);
        }

        return $steps;
    }

    /** Put the old site back. */
    public static function rollback(string $by): void
    {
        $root = self::siteRoot();
        $backup = $root.'/.htaccess.before-live';
        if (! is_file($backup)) {
            throw new RuntimeException('No saved copy of the old site\'s .htaccess ('.$backup.').');
        }
        self::write($root.'/.htaccess', (string) file_get_contents($backup));
        self::put(['status' => 'staging', 'live_at' => null, 'live_by' => null, 'scheduled_at' => null, 'error' => null]);
        self::log($by, 'Rolled back — the old site is live again.');
    }

    /** Called every minute by the scheduler: goes live when the scheduled time has come. */
    public static function runIfDue(): ?array
    {
        Cache::forever(self::HEARTBEAT, now()->toIso8601String());
        $at = self::get('scheduled_at');
        if (self::get('status') !== 'scheduled' || ! $at || Carbon::parse($at)->isFuture()) {
            return null;
        }
        $by = (self::get('scheduled_by') ?: 'schedule').' (scheduled)';
        try {
            return self::goLive($by);
        } catch (\Throwable $e) {
            report($e);
            self::put(['status' => 'failed', 'error' => $e->getMessage()]);
            self::log($by, 'Could not go live: '.$e->getMessage());

            return null;
        }
    }

    // ---- helpers ----

    private static function version(string $file): ?array
    {
        return is_file($file) ? (json_decode((string) file_get_contents($file), true) ?: null) : null;
    }

    /** Write via a temp file + rename, so Apache never reads a half-written .htaccess. */
    private static function write(string $path, string $contents): void
    {
        $tmp = $path.'.tmp-'.getmypid();
        if (file_put_contents($tmp, $contents) === false || ! rename($tmp, $path)) {
            @unlink($tmp);
            throw new RuntimeException("Couldn't write {$path}.");
        }
    }

    private static function get(string $key): ?string
    {
        return Setting::where('key', self::PREFIX.$key)->value('value');
    }

    private static function put(array $values): void
    {
        foreach ($values as $key => $value) {
            $value === null
                ? Setting::where('key', self::PREFIX.$key)->delete()
                : Setting::updateOrCreate(['key' => self::PREFIX.$key], ['value' => (string) $value]);
        }
    }

    private static function log(string $by, string $message): void
    {
        $log = json_decode(self::get('log') ?? '[]', true) ?: [];
        array_unshift($log, ['at' => now()->toIso8601String(), 'by' => $by, 'message' => $message]);
        self::put(['log' => json_encode(array_slice($log, 0, 30))]);
    }
}
