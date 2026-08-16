<?php

namespace App\Models\Engage;

use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Auth\User;

#[Fillable([
    'title', 'type', 'content_text', 'content_image_path', 'content_video_url', 'cta_label', 'cta_url',
    'target_pages', 'audience', 'show_after_seconds', 'frequency', 'active_from', 'active_until', 'status', 'created_by',
])]
class Broadcast extends Model
{
    use LogsActivity;

    public const TYPES = ['text_banner', 'popup_card', 'media_popup', 'news_ticker'];

    public const AUDIENCES = ['all', 'new_visitors', 'returning'];

    public const FREQUENCIES = ['every_visit', 'once_per_session', 'once_per_day', 'once_ever'];

    public const STATUSES = ['draft', 'active', 'paused', 'expired'];

    protected function casts(): array
    {
        return [
            'target_pages' => 'array',
            'active_from' => 'date',
            'active_until' => 'date',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
