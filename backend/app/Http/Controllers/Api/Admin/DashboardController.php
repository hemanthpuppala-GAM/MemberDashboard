<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\People\ContactSubmission;
use App\Models\Cms\Event;
use App\Models\Cms\PageContent;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'content_blocks' => PageContent::count(),
            'events_upcoming' => Event::where('is_published', true)
                ->where('starts_at', '>=', now())
                ->count(),
            'contact_new' => ContactSubmission::where('status', 'new')->count(),
            'contact_total' => ContactSubmission::count(),
        ]);
    }
}
