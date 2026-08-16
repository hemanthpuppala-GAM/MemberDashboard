<?php

namespace App\Http\Controllers\Api\Public\Cms;

use App\Http\Controllers\Controller;
use App\Models\Cms\Event;

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
