<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Auth\Role;
use App\Models\Auth\User;
use App\Models\Cms\Media;
use App\Models\Cms\Page;
use App\Models\Cms\Event;
use App\Models\Cms\PageContent;
use App\Models\Content\DonationMethod;
use App\Models\Content\MusicTrack;
use App\Models\Content\Testimonial;
use App\Models\Engage\Announcement;
use App\Models\Engage\Broadcast;
use App\Models\Languages\Language;
use App\Models\People\ContactSubmission;
use App\Models\People\Member;
use App\Models\People\VolunteerApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    /** Maps every available dashboard widget's stat key to the permission that gates it. */
    public const WIDGET_PERMISSIONS = [
        'pages_total' => 'cms.view',
        'media_total' => 'cms.view',
        'events_upcoming' => 'cms.view',
        'content_blocks' => 'cms.view',
        'queries_new' => 'members.view',
        'queries_total' => 'members.view',
        'members_active' => 'members.view',
        'members_total' => 'members.view',
        'practitioners_total' => 'users.view',
        'users_total' => 'users.view',
        'volunteer_applications_new' => 'volunteers.view',
        'testimonials_total' => 'testimonials.view',
        'music_tracks_total' => 'music.view',
        'donation_methods_total' => 'donations.view',
        'announcements_total' => 'announcements.view',
        'broadcasts_active' => 'broadcast.view',
        'languages_enabled' => 'languages.view',
        'roles_total' => 'roles.view',
    ];

    public function index(Request $request)
    {
        $stats = Cache::remember('admin.dashboard.stats', 60, fn () => [
            'pages_total' => Page::count(),
            'media_total' => Media::count(),
            'events_upcoming' => Event::where('is_published', true)->where('starts_at', '>=', now())->count(),
            'content_blocks' => PageContent::count(),
            'queries_new' => ContactSubmission::where('status', 'new')->count(),
            'queries_total' => ContactSubmission::count(),
            'members_active' => Member::where('status', '!=', 'archived')->count(),
            'members_total' => Member::count(),
            'practitioners_total' => User::whereHas('roles', fn ($q) => $q->where('name', 'practitioner'))->count(),
            'users_total' => User::count(),
            'volunteer_applications_new' => VolunteerApplication::where('status', 'new')->count(),
            'testimonials_total' => Testimonial::count(),
            'music_tracks_total' => MusicTrack::count(),
            'donation_methods_total' => DonationMethod::count(),
            'announcements_total' => Announcement::count(),
            'broadcasts_active' => Broadcast::where('status', 'active')->count(),
            'languages_enabled' => Language::where('is_enabled', true)->count(),
            'roles_total' => Role::count(),
        ]);

        $user = $request->user();

        return response()->json(
            collect($stats)->filter(fn ($value, $key) => $user->hasPermission(self::WIDGET_PERMISSIONS[$key]))->all(),
        );
    }
}
