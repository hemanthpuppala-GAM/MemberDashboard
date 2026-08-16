<?php

namespace App\Models\Concerns;

use App\Models\ActivityLog;
use Illuminate\Support\Str;

/**
 * Auto-writes an activity_logs row on create/update/delete, so individual
 * controllers never have to remember to log anything by hand.
 * Applied to the models whose changes are worth showing in the Reports
 * activity feed — not every model (pivot rows, section_content field edits,
 * etc. would be too noisy).
 */
trait LogsActivity
{
    public static function bootLogsActivity(): void
    {
        static::created(fn ($model) => $model->writeActivityLog('created'));
        static::updated(fn ($model) => $model->writeActivityLog('updated'));
        static::deleted(fn ($model) => $model->writeActivityLog('deleted'));
    }

    protected function activityLabel(): string
    {
        return method_exists($this, 'getName') ? $this->getName() : ($this->title ?? $this->name ?? "#{$this->id}");
    }

    protected function writeActivityLog(string $verb): void
    {
        $userId = auth('sanctum')->id();
        if (! $userId) {
            return;
        }

        ActivityLog::create([
            'user_id' => $userId,
            'action' => "{$verb} ".Str::snake(Str::afterLast(static::class, '\\'), ' '),
            'target_type' => Str::afterLast(static::class, '\\'),
            'target_id' => $this->id,
            'meta' => ['label' => $this->activityLabel()],
            'ip_address' => request()?->ip(),
        ]);
    }
}
