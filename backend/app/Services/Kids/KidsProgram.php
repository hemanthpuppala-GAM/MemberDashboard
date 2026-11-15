<?php

namespace App\Services\Kids;

use App\Models\Kids\Kid;
use App\Models\Kids\KidRegistration;
use Carbon\CarbonImmutable;

/** Program facts shared by the public page, the register form, the parent's dashboard and emails. */
class KidsProgram
{
    /** US zones shown beside Central time (the program's own zone). */
    private const ZONES = ['ET' => 'America/New_York', 'CT' => 'America/Chicago', 'MT' => 'America/Denver', 'PT' => 'America/Los_Angeles'];

    public const STATES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

    public static function groups(): array
    {
        $tz = config('kids.timezone');
        $today = CarbonImmutable::now($tz)->startOfDay();
        $out = [];
        foreach (config('kids.groups') as $key => $g) {
            $start = $today->setTimeFromTimeString($g['start']);
            $end = $today->setTimeFromTimeString($g['end']);
            $zones = [];
            foreach (self::ZONES as $label => $zone) {
                $zones[] = ['zone' => $label, 'time' => $start->setTimezone($zone)->format('g:i').' – '.$end->setTimezone($zone)->format('g:i A')];
            }
            $out[] = [
                'key' => $key,
                'label' => $g['label'],
                'ages' => $g['ages'],
                'start' => $g['start'],
                'end' => $g['end'],
                'start_utc' => $start->utc()->toIso8601String(), // the page shows it in the visitor's own zone
                'end_utc' => $end->utc()->toIso8601String(),
                'zones' => $zones,
            ];
        }

        return $out;
    }

    public static function info(): array
    {
        $doc = KidsConsent::document();

        return [
            'organization' => config('kids.organization'),
            'day' => config('kids.day'),
            'timezone' => config('kids.timezone'),
            'groups' => self::groups(),
            'min_age' => config('kids.min_age'),
            'max_age' => config('kids.max_age'),
            'max_children' => config('kids.max_children'),
            'relationships' => KidRegistration::RELATIONSHIPS,
            'heard_about' => KidRegistration::HEARD_ABOUT,
            'experience' => Kid::EXPERIENCE,
            'states' => self::STATES,
            'phone' => config('kids.phone'),
            'email' => config('kids.email'),
            'consent' => $doc + ['hash' => KidsConsent::hash($doc)],
        ];
    }

    /** Only for a parent with an active, signed registration. */
    public static function joinDetails(): array
    {
        return [
            'zoom_id' => config('kids.zoom_id'),
            'zoom_passcode' => config('kids.zoom_passcode'),
            'zoom_link' => config('kids.zoom_link'),
            'whatsapp_link' => config('kids.whatsapp_link'),
        ];
    }
}
