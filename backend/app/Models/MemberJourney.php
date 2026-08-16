<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['member_id', 'added_by', 'entry_type', 'content', 'question', 'answer', 'meta'])]
class MemberJourney extends Model
{
    public const ENTRY_TYPES = ['note', 'status_change', 'session_completed', 'message_sent', 'qa'];

    protected function casts(): array
    {
        return [
            'meta' => 'array',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'added_by');
    }
}
