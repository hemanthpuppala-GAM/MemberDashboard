<?php

namespace App\Models\People;

use App\Models\Content\SitPreset;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['member_id', 'sit_preset_id', 'duration_minutes', 'completed_at'])]
class PracticeSession extends Model
{
    protected function casts(): array
    {
        return [
            'completed_at' => 'datetime',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function sitPreset(): BelongsTo
    {
        return $this->belongsTo(SitPreset::class);
    }
}
