<?php

namespace App\Http\Controllers\Api\Practitioner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MemberJourneyRequest;
use App\Models\Announcement;
use App\Models\AnnouncementRead;
use App\Models\Member;
use Illuminate\Http\Request;

class PractitionerController extends Controller
{
    public function dashboardStats(Request $request)
    {
        $members = $request->user()->assignedMembers();

        return response()->json([
            'total_members' => $members->count(),
            'open_queries' => $request->user()->assignedMembers()->whereNotIn('status', ['resolved', 'archived'])->count(),
            'resolved_this_month' => $members->clone()->where('status', 'resolved')->whereMonth('updated_at', now()->month)->count(),
            'members_by_status' => $members->clone()->selectRaw('status, count(*) as count')->groupBy('status')->pluck('count', 'status'),
        ]);
    }

    public function members(Request $request)
    {
        return response()->json(
            $request->user()->assignedMembers()->latest()->get(),
        );
    }

    public function member(Request $request, Member $member)
    {
        $this->authorizeOwnership($request, $member);

        return response()->json($member);
    }

    public function journey(Request $request, Member $member)
    {
        $this->authorizeOwnership($request, $member);

        return response()->json($member->journeys()->with('author:id,name')->get());
    }

    public function addJourneyEntry(MemberJourneyRequest $request, Member $member)
    {
        $this->authorizeOwnership($request, $member);

        $entry = $member->journeys()->create([
            ...$request->validated(),
            'added_by' => $request->user()->id,
        ]);

        $member->update(['last_contact_date' => now()->toDateString()]);

        return response()->json($entry->load('author:id,name'), 201);
    }

    public function updateSummary(Request $request, Member $member)
    {
        $this->authorizeOwnership($request, $member);

        $request->validate(['summary' => ['nullable', 'string', 'max:5000']]);
        $member->update(['summary' => $request->input('summary')]);

        return response()->json($member);
    }

    public function announcements(Request $request)
    {
        $announcements = Announcement::whereNotNull('sent_at')
            ->get()
            ->filter(fn ($a) => $a->targetsUser($request->user()))
            ->values();

        $readIds = AnnouncementRead::where('user_id', $request->user()->id)->pluck('announcement_id');

        return response()->json($announcements->map(fn ($a) => [
            ...$a->toArray(),
            'read' => $readIds->contains($a->id),
        ]));
    }

    public function markAnnouncementRead(Request $request, Announcement $announcement)
    {
        AnnouncementRead::firstOrCreate(
            ['announcement_id' => $announcement->id, 'user_id' => $request->user()->id],
            ['read_at' => now()],
        );

        return response()->json(['read' => true]);
    }

    private function authorizeOwnership(Request $request, Member $member): void
    {
        abort_unless($member->assigned_practitioner_id === $request->user()->id, 403, 'This member is not assigned to you.');
    }
}
