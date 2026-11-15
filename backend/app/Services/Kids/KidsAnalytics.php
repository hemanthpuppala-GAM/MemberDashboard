<?php

namespace App\Services\Kids;

use App\Models\Kids\Kid;
use App\Models\Kids\KidAttendance;
use App\Models\Kids\KidRegistration;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

/** Numbers for Admin → Kids Circle: who registered, from where, and who keeps coming. */
class KidsAnalytics
{
    public static function summary(): array
    {
        $tz = config('kids.timezone');
        $now = CarbonImmutable::now($tz);
        $regs = KidRegistration::with('latestConsent:id,version')->get();
        $kids = Kid::get(['id', 'kid_registration_id', 'age', 'group', 'experience', 'media_consent', 'status', 'created_at']);
        $active = $kids->where('status', 'active');
        $activeRegs = $regs->where('status', 'active');
        $att = KidAttendance::get(['kid_id', 'session_date']);
        $groupOf = $kids->pluck('group', 'id');

        // Sessions held = distinct (group, date) pairs with anyone marked present.
        $sessions = $att->groupBy(fn ($a) => ($groupOf[$a->kid_id] ?? '?').'|'.$a->session_date->toDateString());
        $recentCut = $now->subDays(28)->toDateString();
        $recentKids = $att->filter(fn ($a) => $a->session_date->toDateString() >= $recentCut)->pluck('kid_id')->unique();

        $weeks = [];
        for ($i = 11; $i >= 0; $i--) {
            $start = $now->startOfWeek()->subWeeks($i);
            $end = $start->addWeek();
            $weeks[] = [
                'week' => $start->format('M j'),
                'registered' => $kids->filter(fn ($k) => $k->created_at >= $start && $k->created_at < $end)->count(),
                'attended' => $att->filter(fn ($a) => $a->session_date >= $start->startOfDay() && $a->session_date < $end->startOfDay())->count(),
            ];
        }

        $groupLabels = collect(config('kids.groups'))->map(fn ($g) => $g['label']);

        return [
            'totals' => [
                'families' => $activeRegs->count(),
                'children' => $active->count(),
                'withdrawn' => $kids->where('status', 'withdrawn')->count(),
                'sibling_families' => $active->groupBy('kid_registration_id')->filter(fn ($g) => $g->count() > 1)->count(),
                'photo_opt_out' => $active->where('media_consent', 'no')->count(),
                'needs_resign' => $activeRegs->filter(fn ($r) => (int) $r->latestConsent?->version < KidsConsent::VERSION)->count(),
                'new_this_week' => $active->filter(fn ($k) => $k->created_at >= $now->startOfWeek())->count(),
                'sessions_held' => $sessions->count(),
                'avg_attendance' => $sessions->count() ? round($att->count() / $sessions->count(), 1) : 0,
                'attended_last_4_weeks' => $recentKids->intersect($active->pluck('id'))->count(),
                'never_attended' => $active->pluck('id')->diff($att->pluck('kid_id')->unique())->count(),
            ],
            'by_group' => self::count($active, 'group', $groupLabels->all()),
            'by_age' => self::count($active->sortBy('age'), 'age'),
            'by_experience' => self::count($active, 'experience'),
            'by_state' => self::count($activeRegs, 'state'),
            'by_heard_about' => self::count($activeRegs, fn ($r) => $r->heard_about ?: 'Not said'),
            'by_relationship' => self::count($activeRegs, 'relationship'),
            'weekly' => $weeks,
            'recent_sessions' => $sessions->map(function ($rows, $key) use ($groupLabels) {
                [$group, $date] = explode('|', $key);

                return ['group' => $groupLabels[$group] ?? $group, 'date' => $date, 'present' => $rows->count()];
            })->sortByDesc('date')->take(12)->values(),
        ];
    }

    private static function count(Collection $rows, string|callable $by, array $labels = []): array
    {
        return $rows->groupBy($by)->map(fn ($g, $k) => ['option' => (string) ($labels[$k] ?? $k), 'count' => $g->count()])
            ->sortByDesc('count')->values()->all();
    }
}
