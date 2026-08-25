<?php

namespace App\Http\Controllers\Api\Public\Member;

use App\Http\Controllers\Controller;
use App\Models\Cms\Event;

class LiveSessionController extends Controller
{
    /** How early the "Join now" button opens up before the scheduled start — mirrors how Zoom/Meet let people join a few minutes early. */
    private const JOIN_EARLY_MINUTES = 10;

    public function index()
    {
        $now = now();

        $events = Event::where('is_published', true)
            ->where(function ($query) use ($now) {
                $query->where('ends_at', '>=', $now)->orWhereNull('ends_at');
            })
            ->where('starts_at', '>=', $now->copy()->subHours(3))
            ->orderBy('starts_at')
            ->with('host')
            ->take(5)
            ->get()
            ->map(fn (Event $event) => [
                'id' => $event->id,
                'title' => $event->title,
                'starts_at' => $event->starts_at,
                'ends_at' => $event->ends_at,
                'teacher' => $event->host?->name,
                'join_url' => $event->join_url,
                'is_live' => $event->starts_at <= $now->copy()->addMinutes(self::JOIN_EARLY_MINUTES)
                    && ($event->ends_at === null || $event->ends_at >= $now),
            ]);

        return response()->json($events);
    }
}
