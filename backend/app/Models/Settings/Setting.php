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
}
