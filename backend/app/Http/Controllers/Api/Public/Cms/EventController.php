<?php

namespace App\Http\Controllers\Api\Public\Cms;

use App\Http\Controllers\Controller;
use App\Models\Cms\Event;
use App\Models\Settings\Setting;

/**
 * Admin "Live Sessions" for the public site. Daily sessions are the recurring sits
 * ("Sits around the world"); one-off sessions are listed as upcoming / past events.
 * Every session carries its next sitting and a join link (its own, else the Zoom room in Settings).
 */
class EventController extends Controller
{
    public function index()
    {
        $zoom = Setting::zoomUrl();
        $now = now();

        $events = Event::where('is_published', true)
            ->orderBy('starts_at')
            ->get()
            ->map(function (Event $e) use ($zoom, $now) {
                $row = $e->toSchedule($zoom);
                $row['is_past'] = ! $e->isDaily() && ($e->ends_at ?? $e->starts_at->copy()->addHour())->lt($now);

                return $row;
            });

        return response()->json($events->values());
    }
}
