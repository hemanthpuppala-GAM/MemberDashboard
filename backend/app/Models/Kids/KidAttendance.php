<?php

namespace App\Models\Kids;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['kid_id', 'session_date', 'marked_by'])]
class KidAttendance extends Model
{
    protected function casts(): array
    {
        return ['session_date' => 'date'];
    }

    public function kid(): BelongsTo
    {
        return $this->belongsTo(Kid::class);
    }
}
