<?php

namespace App\Models\Engage;

use App\Models\People\Member;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['form_id', 'data', 'status', 'member_id'])]
class RegistrationFormSubmission extends Model
{
    public const STATUSES = ['new', 'contacted'];

    protected function casts(): array
    {
        return [
            'data' => 'array',
        ];
    }

    /** Who filled it, on a members-only form. */
    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function form(): BelongsTo
    {
        return $this->belongsTo(RegistrationForm::class, 'form_id');
    }
}
