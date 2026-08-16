<?php

namespace App\Models;

use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['title', 'body', 'type', 'target_type', 'target_ids', 'priority', 'scheduled_at', 'sent_at', 'created_by'])]
class Announcement extends Model
{
    use LogsActivity;

    public const TYPES = ['info', 'warning', 'alert'];

    public const TARGET_TYPES = ['all', 'role', 'users'];

    public const PRIORITIES = ['normal', 'urgent'];

    protected function casts(): array
    {
        return [
            'target_ids' => 'array',
            'scheduled_at' => 'datetime',
            'sent_at' => 'datetime',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reads(): HasMany
    {
        return $this->hasMany(AnnouncementRead::class);
    }

    public function targetsUser(User $user): bool
    {
        return match ($this->target_type) {
            'all' => true,
            'role' => $user->roles->pluck('id')->intersect($this->target_ids ?? [])->isNotEmpty(),
            'users' => in_array($user->id, $this->target_ids ?? [], true),
            default => false,
        };
    }
}
