<?php

namespace App\Http\Controllers\Api\Public\Settings;

use App\Http\Controllers\Controller;
use App\Models\Settings\Setting;

/** Public, read-only view of settings safe to expose (contact info, socials, banner copy). */
class SettingController extends Controller
{
    private const PUBLIC_KEYS = [
        'general.site_name',
        'general.tagline',
        'social.youtube',
        'social.instagram',
        'social.facebook',
        'social.whatsapp',
        'social.phone',
        'social.address',
        'banner.enabled',
        'banner.text',
        'banner.cta_label',
        'banner.cta_url',
        'maintenance.enabled',
        'maintenance.message',
    ];

    public function index()
    {
        $flat = array_merge(Setting::DEFAULTS, Setting::pluck('value', 'key')->toArray());

        return response()->json(collect($flat)->only(self::PUBLIC_KEYS));
    }
}
