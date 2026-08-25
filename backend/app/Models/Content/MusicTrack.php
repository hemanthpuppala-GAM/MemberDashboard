<?php

namespace App\Models\Content;

use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use App\Models\Auth\User;

#[Fillable(['title', 'artist', 'category', 'description', 'cover_path', 'file_path', 'duration_seconds', 'status', 'sort_order', 'created_by'])]
class MusicTrack extends Model
{
    use LogsActivity;

    public const CATEGORIES = ['meditation', 'chanting', 'nature', 'sleep', 'instrumental'];

    public const STATUSES = ['draft', 'published'];

    protected $appends = ['file_url', 'cover_url'];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    protected function fileUrl(): Attribute
    {
        return Attribute::get(fn () => $this->resolveUrl($this->file_path));
    }

    protected function coverUrl(): Attribute
    {
        return Attribute::get(fn () => $this->resolveUrl($this->cover_path));
    }

    /** `file_path`/`cover_path` are stored as full URLs (see Admin\Content\MusicController::store), but resolve defensively in case a value is ever a bare storage-relative path. */
    private function resolveUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return preg_match('#^https?://#i', $path) ? $path : Storage::url($path);
    }
}
