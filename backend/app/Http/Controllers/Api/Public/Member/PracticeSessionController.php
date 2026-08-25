<?php

namespace App\Http\Controllers\Api\Public\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\Member\PracticeSessionStoreRequest;
use App\Models\People\Member;
use App\Models\People\PracticeSession;
use App\Support\MemberPracticeStats;
use Illuminate\Http\Request;

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

        $session = $member->practiceSessions()->create([
            'duration_minutes' => $request->validated('duration_minutes'),
            'sit_preset_id' => $request->validated('sit_preset_id'),
            'completed_at' => now(),
        ]);
        $session->load('sitPreset');

        return response()->json([
            'session' => $session,
            ...MemberPracticeStats::forMember($member),
        ], 201);
    }
}
