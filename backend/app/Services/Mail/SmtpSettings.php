<?php

namespace App\Services\Mail;

use App\Models\Settings\Setting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Schema;

/**
 * Applies admin-panel SMTP credentials (Settings → Email) over .env defaults
 * so welcome mail and the test-email button use the same transport.
 */
class SmtpSettings
{
    public static function apply(): void
    {
        try {
            if (! Schema::hasTable('settings')) {
                return;
            }
        } catch (\Throwable) {
            return;
        }

        $keys = Setting::query()
            ->whereIn('key', [
                'email.smtp_host',
                'email.smtp_port',
                'email.smtp_user',
                'email.smtp_password',
                'general.admin_email',
                'general.site_name',
            ])
            ->pluck('value', 'key');

        $host = $keys['email.smtp_host'] ?? '';
        if (! filled($host)) {
            return;
        }

        $port = (int) ($keys['email.smtp_port'] ?? 587);

        Config::set('mail.default', 'smtp');
        Config::set('mail.mailers.smtp.host', $host);
        Config::set('mail.mailers.smtp.port', $port);
        Config::set('mail.mailers.smtp.username', $keys['email.smtp_user'] ?? null);
        Config::set('mail.mailers.smtp.password', $keys['email.smtp_password'] ?? null);
        Config::set('mail.mailers.smtp.scheme', $port === 465 ? 'smtps' : null);

        // Send as the mailbox we log in with (support@goldenagewisdom.org): Microsoft 365 and most hosts
        // refuse mail "from" any other address. The admin email is where alerts go, not the sender.
        $user = trim((string) ($keys['email.smtp_user'] ?? ''));
        if (filter_var($user, FILTER_VALIDATE_EMAIL)) {
            Config::set('mail.from.address', $user);
        }
        Config::set('mail.from.name', $keys['general.site_name'] ?? config('mail.from.name'));
    }
}
