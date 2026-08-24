<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\People\ContactSubmission;
use App\Models\Cms\Event;
use App\Models\Cms\PageContent;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json(Cache::remember('admin.dashboard.stats', 60, fn () => [
            'content_blocks' => PageContent::count(),
            'events_upcoming' => Event::where('is_published', true)
                ->where('starts_at', '>=', now())
                ->count(),
            'contact_new' => ContactSubmission::where('status', 'new')->count(),
            'contact_total' => ContactSubmission::count(),
        ]));
    }
}
