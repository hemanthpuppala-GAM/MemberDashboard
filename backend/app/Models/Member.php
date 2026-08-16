<?php

namespace App\Models;

use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['name', 'email', 'phone', 'category', 'summary', 'assigned_practitioner_id', 'source_submission_id', 'status', 'join_date', 'last_contact_date'])]
class Member extends Model
{
    use LogsActivity, SoftDeletes;

    public const STATUSES = ['new', 'active', 'in_progress', 'resolved', 'archived'];

    public const CATEGORIES = ['meditation', 'kundalini', 'health', 'general'];

    protected function casts(): array
    {
        return [
            'join_date' => 'date',
            'last_contact_date' => 'date',
        ];
    }

    public function practitioner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_practitioner_id');
    }

    public function sourceSubmission(): BelongsTo
    {
        return $this->belongsTo(ContactSubmission::class, 'source_submission_id');
    }

    public function journeys(): HasMany
    {
        return $this->hasMany(MemberJourney::class)->latest();
    }
}
