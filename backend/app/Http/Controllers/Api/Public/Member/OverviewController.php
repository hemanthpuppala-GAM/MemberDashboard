<?php

namespace App\Http\Controllers\Api\Public\Member;

use App\Http\Controllers\Controller;
use App\Models\Cms\Event;
use App\Models\People\Member;
use App\Support\MemberPracticeStats;
use Illuminate\Http\Request;

class OverviewController extends Controller
{
    public function index(Request $request)
    {
        /** @var Member $member */
        $member = $request->user();

        $now = now();
        $upcoming = Event::where('is_published', true)
            ->where(function ($query) use ($now) {
                $query->where('ends_at', '>=', $now)->orWhereNull('ends_at');
            })
            ->where('starts_at', '>=', $now->copy()->subHours(3))
            ->orderBy('starts_at')
            ->with('host')
            ->first();

        $recentJournal = $member->journalEntries()->first();

        return response()->json([
            ...MemberPracticeStats::forMember($member),
            'upcoming_session' => $upcoming ? [
                'id' => $upcoming->id,
                'title' => $upcoming->title,
                'starts_at' => $upcoming->starts_at,
                'teacher' => $upcoming->host?->name,
            ] : null,
            'recent_journal' => $recentJournal ? [
                'id' => $recentJournal->id,
                'content' => $recentJournal->content,
                'created_at' => $recentJournal->created_at,
            ] : null,
        ]);
    }
}
