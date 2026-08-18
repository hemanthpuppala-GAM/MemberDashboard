<?php

namespace App\Models\People;

use App\Models\Content\VolunteerCategory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['name', 'email', 'phone', 'category_id', 'notes', 'status'])]
class VolunteerApplication extends Model
{
    public const STATUSES = ['new', 'reviewing', 'contacted', 'approved', 'archived'];

    public function category(): BelongsTo
    {
        return $this->belongsTo(VolunteerCategory::class, 'category_id');
    }
}
