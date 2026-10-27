<?php

namespace App\Http\Controllers\Api\Public\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\Member\PracticeSessionStoreRequest;
use App\Models\People\Member;
use App\Models\People\PracticeSession;
use App\Support\MemberPracticeStats;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class PracticeSessionController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->practiceSessions()->with('sitPreset')->orderByDesc('completed_at')->take(50)->get(),
        );
    }

    public function store(PracticeSessionStoreRequest $request)
    {
        /** @var Member $member */
        $member = $request->user();

        $session = $member->practiceSessions()->make([
            'duration_minutes' => $request->validated('duration_minutes'),
            'sit_preset_id' => $request->validated('sit_preset_id'),
            'completed_at' => self::completedAt($request->validated('completed_on'), $zone = MemberPracticeStats::zone($request)),
        ]);
        $session->forceFill(['via' => $request->validated('via')])->save();
        $session->load('sitPreset');

        return response()->json([
            'session' => $session,
            ...MemberPracticeStats::forMember($member, $zone),
        ], 201);
    }

    /**
     * A missed sit added for an earlier day is stamped at noon on that date in the member's time zone, so it
     * counts on that day for the streak and challenge. Today's sits: the actual time.
     */
    private static function completedAt(?string $day, string $zone): Carbon
    {
        if (! $day || $day >= Carbon::today($zone)->toDateString()) {
            return now();
        }

        return Carbon::parse($day.' 12:00:00', $zone)->utc();
    }
}
