<?php

namespace App\Models\Kids;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['kid_registration_id', 'first_name', 'last_name', 'age', 'group', 'experience', 'media_consent', 'notes', 'status', 'withdrawn_at'])]
#[Hidden(['notes'])]
class Kid extends Model
{
    public const EXPERIENCE = ['Not yet', 'A little', 'Yes, regularly'];

    protected function casts(): array
    {
        return [
            'age' => 'integer',
            'notes' => 'encrypted', // may hold health details; coordinators only
            'withdrawn_at' => 'datetime',
        ];
    }

    public function registration(): BelongsTo
    {
        return $this->belongsTo(KidRegistration::class, 'kid_registration_id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(KidAttendance::class);
    }

    /** "Aarav S." — what teachers see on the roster. */
    public function shortName(): string
    {
        return trim($this->first_name.' '.mb_substr((string) $this->last_name, 0, 1).'.');
    }

    public static function groups(): array
    {
        return config('kids.groups');
    }
}
