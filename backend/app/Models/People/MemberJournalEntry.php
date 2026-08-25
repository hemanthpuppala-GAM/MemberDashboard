<?php

namespace App\Models\People;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['member_id', 'content'])]
class MemberJournalEntry extends Model
{
    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
