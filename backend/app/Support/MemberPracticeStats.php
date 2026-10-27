<?php

namespace App\Support;

use App\Models\People\Member;
use App\Models\People\PracticeSession;
use Carbon\Carbon;
use Illuminate\Http\Request;

class MemberPracticeStats
{
    /** Most members sit in India: their days are counted in IST unless the dashboard says otherwise. */
    public const DEFAULT_ZONE = 'Asia/Kolkata';

    /** The member's own time zone, sent by the dashboard as X-Timezone (e.g. "America/Chicago"). */
    public static function zone(?Request $request): string
    {
        $zone = trim((string) $request?->header('X-Timezone'));
        try {
            return $zone !== '' ? (new \DateTimeZone($zone))->getName() : self::DEFAULT_ZONE;
        } catch (\Throwable) {
            return self::DEFAULT_ZONE;
        }
    }

    /**
     * Streak, challenge day and the 41-day log. Days are the member's own calendar days: a 4:30 AM IST sit
     * (23:00 UTC the day before) counts for that morning, not for yesterday.
     */
    public static function forMember(Member $member, string $zone = self::DEFAULT_ZONE): array
    {
        $days = PracticeSession::where('member_id', $member->id)
            ->pluck('completed_at')
            ->map(fn (Carbon $at) => $at->copy()->setTimezone($zone)->toDateString())
            ->unique()
            ->flip();

        $streak = 0;
        $cursor = Carbon::today($zone);
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
            $date = Carbon::today($zone)->subDays($i);
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
