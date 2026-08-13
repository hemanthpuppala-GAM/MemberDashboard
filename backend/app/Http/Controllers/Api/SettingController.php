<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;

/** Public, read-only view of settings safe to expose (contact info, socials, banner copy). */
class SettingController extends Controller
{
    private const PUBLIC_KEYS = [
        'contact_email',
        'social_youtube',
        'social_instagram',
        'social_facebook',
        'banner_text',
    ];

    public function index()
    {
        $settings = Setting::whereIn('key', self::PUBLIC_KEYS)
            ->pluck('value', 'key');

        return response()->json($settings);
    }
}
