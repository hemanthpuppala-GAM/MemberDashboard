<?php

namespace App\Http\Controllers\Api\Public\Settings;

use App\Http\Controllers\Controller;
use App\Models\Settings\Setting;
use Illuminate\Http\Request;

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

    public function index(Request $request)
    {
        $flat = array_merge(Setting::DEFAULTS, Setting::pluck('value', 'key')->toArray());

        $data = collect($flat)->only(self::PUBLIC_KEYS)->toArray();

        // Computed, not the raw list — the allowlist itself stays admin-only.
        $data['maintenance.bypass'] = $this->ipBypassesMaintenance($request, $flat['maintenance.allowed_ips'] ?? '');

        return response()->json($data);
    }

    private function ipBypassesMaintenance(Request $request, string $allowedIps): bool
    {
        $ips = array_filter(array_map('trim', explode(',', $allowedIps)));

        return in_array($request->ip(), $ips, true);
    }
}
