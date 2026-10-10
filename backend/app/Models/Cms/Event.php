<?php

namespace App\Models\Cms;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use App\Models\Auth\User;

#[Fillable([
    'title',
    'description',
    'starts_at',
    'ends_at',
    'recurrence',
    'timezone',
    'location',
    'join_url',
    'is_published',
    'updated_by',
    'host_practitioner_id',
])]
class Event extends Model
{
    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_published' => 'boolean',
        ];
    }

    public function editor()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function host()
    {
        return $this->belongsTo(User::class, 'host_practitioner_id');
    }

    public const RECURRENCES = ['none', 'daily'];

    public function isDaily(): bool
    {
        return $this->recurrence === 'daily';
    }

    /** IANA zone the session's clock time belongs to (falls back to the site timezone). */
    public function zone(): string
    {
        return $this->timezone ?: \App\Models\Settings\Setting::siteTimezone();
    }

    /**
     * The next (or current) sitting as [start, end] Carbon instants. A one-off session is just
     * its own times; a daily one repeats at the same local clock time every day.
     */
    public function nextOccurrence(?\Carbon\CarbonInterface $now = null): array
    {
        $now = \Illuminate\Support\Carbon::instance($now ?? now());
        $minutes = $this->ends_at ? max(1, (int) $this->starts_at->diffInMinutes($this->ends_at)) : 60;

        if (! $this->isDaily()) {
            return [$this->starts_at, $this->ends_at ?? $this->starts_at->copy()->addMinutes($minutes)];
        }

        $zone = $this->zone();
        $local = $this->starts_at->copy()->setTimezone($zone);
        $start = $now->copy()->setTimezone($zone)->setTime($local->hour, $local->minute, 0);
        if ($start->copy()->addMinutes($minutes)->lt($now)) {
            $start->addDay();
        }
        if ($start->lt($this->starts_at)) { // a daily series that has not begun yet
            $start = $this->starts_at->copy()->setTimezone($zone);
        }

        return [$start->utc(), $start->copy()->utc()->addMinutes($minutes)];
    }

    /** Shape shared by the public site and the member dashboard. */
    public function toSchedule(?string $fallbackJoinUrl = null): array
    {
        [$start, $end] = $this->nextOccurrence();
        $local = $this->starts_at->copy()->setTimezone($this->zone());

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'location' => $this->location,
            'recurrence' => $this->recurrence ?: 'none',
            'timezone' => $this->zone(),
            'local_time' => $local->format('H:i'),
            'starts_at' => $this->starts_at,
            'ends_at' => $this->ends_at,
            'next_starts_at' => $start->toIso8601String(),
            'next_ends_at' => $end->toIso8601String(),
            'join_url' => $this->join_url ?: $fallbackJoinUrl,
        ];
    }
}
