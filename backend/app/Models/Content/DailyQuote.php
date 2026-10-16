<?php

namespace App\Models\Content;

use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

#[Fillable(['image_path', 'title', 'text', 'author', 'show_on', 'status', 'created_by'])]
class DailyQuote extends Model
{
    use LogsActivity;

    public const TZ = 'Asia/Kolkata';

    protected $appends = ['image_url'];

    protected function casts(): array
    {
        return ['show_on' => 'date:Y-m-d'];
    }

    /** False until `php artisan migrate` has created the table (deploys don't migrate). */
    public static function ready(): bool
    {
        static $ready = null;

        return $ready ??= Schema::hasTable('daily_quotes');
    }

    public static function today(): string
    {
        return now(self::TZ)->toDateString();
    }

    /** Published quotes up to today (India date), newest first — today's is the first. */
    public function scopeShowing(Builder $q): Builder
    {
        return $q->where('status', 'published')->whereDate('show_on', '<=', self::today())->orderByDesc('show_on')->orderByDesc('id');
    }

    public function getImageUrlAttribute(): ?string
    {
        $p = $this->image_path;

        return ! $p ? null : (preg_match('#^https?://#i', $p) ? $p : Storage::disk(config('filesystems.uploads_disk', 'public'))->url($p));
    }

    protected function activityLabel(): string
    {
        return $this->title ?: 'Quote for '.$this->show_on?->toDateString();
    }
}
