<?php

namespace App\Support;

use App\Models\People\Member;
use App\Models\People\PracticeSession;
use Carbon\Carbon;

class MemberPracticeStats
{
    public static function forMember(Member $member): array
    {
        $days = PracticeSession::where('member_id', $member->id)
            ->selectRaw('DATE(completed_at) as day')
            ->distinct()
            ->pluck('day')
            ->flip();

        $streak = 0;
        $cursor = Carbon::today();
        if (! $days->has($cursor->toDateString())) {
            $cursor->subDay();
        }
        while ($days->has($cursor->toDateString())) {
            $streak++;
            $cursor->subDay();
        }

        $totalMinutes = (int) PracticeSession::where('member_id', $member->id)->sum('duration_minutes');

        // Counts distinct days actually practiced, not days elapsed since joining —
        // skipping days shouldn't silently advance the 41-day challenge.
        $challengeDay = min(41, $days->count());

        $dailyLog = [];
        for ($i = 40; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dailyLog[] = ['date' => $date->toDateString(), 'completed' => $days->has($date->toDateString())];
        }

        return [
            'streak_days' => $streak,
            'stage' => self::stageForStreak($streak),
            'total_minutes' => $totalMinutes,
            'challenge' => ['day' => $challengeDay, 'total' => 41],
            'daily_log' => $dailyLog,
        ];
    }

    private static function stageForStreak(int $streak): string
    {
        return match (true) {
            $streak >= 41 => 'Stage 4 · Awakened',
            $streak >= 21 => 'Stage 3 · Deepening',
            $streak >= 7 => 'Stage 2 · Stilling',
            default => 'Stage 1 · Beginning',
        };
    }
}
