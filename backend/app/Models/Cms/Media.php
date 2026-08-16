<?php

namespace App\Models\Cms;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Auth\User;

#[Fillable(['filename', 'original_name', 'disk', 'path', 'url', 'mime_type', 'size_bytes', 'alt_text', 'folder', 'uploaded_by'])]
class Media extends Model
{
    public const FOLDERS = ['General', 'About', 'Events', 'Meditation'];

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
