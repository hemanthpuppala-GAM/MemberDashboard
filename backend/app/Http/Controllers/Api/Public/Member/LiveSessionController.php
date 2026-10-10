<?php

namespace App\Http\Controllers\Api\Public\Member;

use App\Http\Controllers\Controller;
use App\Models\Cms\Event;
use App\Models\Settings\Setting;

class LiveSessionController extends Controller
{
    /** How early the "Join now" button opens up before the scheduled start — mirrors how Zoom/Meet let people join a few minutes early. */
    private const JOIN_EARLY_MINUTES = 10;

    public function index()
    {
        $now = now();
        $zoom = Setting::zoomUrl();

        $events = Event::where('is_published', true)
            ->where(function ($query) use ($now) {
                // Daily sits always have a next sitting; one-offs only until they finish.
                $query->where('recurrence', 'daily')->orWhere(function ($q) use ($now) {
                    $q->where(fn ($q) => $q->where('ends_at', '>=', $now)->orWhereNull('ends_at'))
                        ->where('starts_at', '>=', $now->copy()->subHours(3));
                });
            })
            ->with('host')
            ->get()
            ->map(function (Event $event) use ($now, $zoom) {
                [$start, $end] = $event->nextOccurrence($now);

                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'starts_at' => $start,
                    'ends_at' => $event->ends_at || $event->isDaily() ? $end : null,
                    'recurrence' => $event->recurrence ?: 'none',
                    'teacher' => $event->host?->name,
                    'join_url' => $event->join_url ?: $zoom,
                    'is_live' => $start <= $now->copy()->addMinutes(self::JOIN_EARLY_MINUTES)
                        && ($event->ends_at === null && ! $event->isDaily() || $end >= $now),
                ];
            })
            ->sortBy('starts_at')
            ->take(5)
            ->values();

        return response()->json($events);
    }
}
