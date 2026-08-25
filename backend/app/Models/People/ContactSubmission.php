<?php

namespace App\Models\People;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Auth\User;

#[Fillable(['name', 'email', 'phone', 'category', 'message', 'status', 'assigned_to', 'converted_to_member_id', 'member_id', 'source'])]
class ContactSubmission extends Model
{
    public const STATUSES = ['new', 'assigned', 'in_progress', 'resolved', 'archived'];

    public const CATEGORIES = ['meditation', 'kundalini', 'health', 'general'];

    public const SOURCES = ['website', 'member_portal'];

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function convertedMember(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'converted_to_member_id');
    }
}
