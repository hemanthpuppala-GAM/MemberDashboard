<?php

namespace App\Models\People;

use App\Models\Auth\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** A sign-up drive (camp, satsang, event) where members are added in bulk by phone number. */
#[Fillable(['name', 'place', 'held_on', 'notes', 'created_by'])]
class MembershipDrive extends Model
{
    protected function casts(): array
    {
        return ['held_on' => 'date'];
    }

    public function members(): HasMany
    {
        return $this->hasMany(Member::class, 'drive_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
