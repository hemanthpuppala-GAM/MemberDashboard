<?php

namespace App\Models\People;

use App\Models\Content\VolunteerCategory;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Appends(['member_id'])]
#[Fillable(['name', 'email', 'phone', 'occupation', 'city', 'lang', 'category_id', 'teams', 'availability', 'member_num', 'notes', 'status'])]
class VolunteerApplication extends Model
{
    public const STATUSES = ['new', 'reviewing', 'contacted', 'approved', 'archived'];

    /** Same choices as the live site's volunteer form. */
    public const AVAILABILITY = ['An hour or two a week', 'A few hours a week', 'Events only', 'Whenever I am needed'];

    protected function casts(): array
    {
        return [
            'teams' => 'array',
            'member_num' => 'integer',
        ];
    }

    /** "GAW-100023", or null when no member number is linked yet. */
    public function getMemberIdAttribute(): ?string
    {
        return $this->member_num ? 'GAW-'.$this->member_num : null;
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(VolunteerCategory::class, 'category_id');
    }
}
