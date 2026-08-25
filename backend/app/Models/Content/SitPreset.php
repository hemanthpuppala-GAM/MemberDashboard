<?php

namespace App\Models\Content;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Auth\User;

#[Fillable(['title', 'duration_minutes', 'music_track_id', 'status', 'sort_order', 'created_by'])]
class SitPreset extends Model
{
    public const STATUSES = ['draft', 'published'];

    public function track(): BelongsTo
    {
        return $this->belongsTo(MusicTrack::class, 'music_track_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
