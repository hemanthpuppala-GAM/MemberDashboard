<?php

namespace App\Models\Settings;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['key', 'value'])]
class Setting extends Model
{
    /** Dot-notation key catalogue — see BACKEND_DB_API_PLAN.md §3.9. */
    public const DEFAULTS = [
        'general.site_name' => 'Golden Age Wisdom',
        'general.tagline' => 'World peace through meditation',
        'general.admin_email' => 'admin@goldenagewisdom.org',
        'general.default_language' => 'en',
        'general.timezone' => 'Asia/Kolkata',

        'social.youtube' => 'https://www.youtube.com/@GoldenAgeGurus',
        'social.instagram' => '',
        'social.facebook' => '',
        'social.whatsapp' => '',
        'social.phone' => '',
        'social.address' => '',

        // Support lines shown on the site and desk. Empty = use SUPPORT_PRIMARY / SUPPORT_WEB from .env.
        'support.primary' => '',
        'support.web' => '',

        // The one Zoom room the daily sits use. A Live Session without its own link joins here.
        'zoom.url' => '',
        'zoom.meeting_id' => '',
        'zoom.passcode' => '',

        'banner.enabled' => 'false',
        'banner.text' => 'Daily meditation is live now — join the circle.',
        'banner.cta_label' => 'Join now',
        'banner.cta_url' => '#meditate-now',

        'maintenance.enabled' => 'false',
        'maintenance.message' => "We'll be back shortly — thank you for your patience.",
        'maintenance.allowed_ips' => '',

        'appearance.logo_url' => '',
        'appearance.favicon_url' => '',

        'email.smtp_host' => '',
        'email.smtp_port' => '587',
        'email.smtp_user' => '',
        'email.smtp_password' => '',
        'email.notify_on_submission' => 'true',
    ];

    /** Never returned by GET /admin/settings — write-only. */
    public const WRITE_ONLY_KEYS = ['email.smtp_password'];

    private static function value(string $key): string
    {
        return static::where('key', $key)->value('value') ?? static::DEFAULTS[$key];
    }

    public static function siteTimezone(): string
    {
        $tz = static::value('general.timezone');

        return in_array($tz, timezone_identifiers_list(), true) ? $tz : 'Asia/Kolkata';
    }

    /** Support number (digits only): admin Settings first, then .env. */
    public static function supportNumber(string $which): string
    {
        $raw = static::value('support.'.$which);
        if (trim($raw) === '') {
            $raw = (string) config('services.support.'.$which);
        }

        return preg_replace('/\D/', '', $raw);
    }

    public static function zoomUrl(): ?string
    {
        return trim(static::value('zoom.url')) ?: null;
    }

    public static function adminEmail(): string
    {
        return static::value('general.admin_email');
    }

    public static function notifyOnSubmission(): bool
    {
        return static::value('email.notify_on_submission') === 'true';
    }
}
