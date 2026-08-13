<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::where('is_published', true)
            ->orderBy('starts_at')
            ->get();

        return response()->json($events);
    }
}
