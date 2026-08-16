<?php

namespace App\Models\Content;

use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Auth\User;

#[Fillable(['title', 'artist', 'category', 'description', 'cover_path', 'file_path', 'duration_seconds', 'status', 'sort_order', 'created_by'])]
class MusicTrack extends Model
{
    use LogsActivity;

    public const CATEGORIES = ['meditation', 'chanting', 'nature', 'sleep', 'instrumental'];

    public const STATUSES = ['draft', 'published'];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
