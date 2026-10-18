<?php

namespace App\Models\Content;

use App\Models\Auth\User;
use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Schema;

#[Fillable(['name', 'role', 'place', 'photo_path', 'quote', 'video_url', 'rating', 'status', 'is_featured', 'sort_order', 'created_by'])]
class Testimonial extends Model
{
    use LogsActivity;

    public const STATUSES = ['draft', 'published'];

    /** False until `php artisan migrate` adds video_url / place (deploys don't migrate). */
    public static function videosReady(): bool
    {
        static $ready = null;

        return $ready ??= Schema::hasColumn('testimonials', 'video_url');
    }

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'rating' => 'integer',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
