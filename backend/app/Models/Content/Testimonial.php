<?php

namespace App\Models;

use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['name', 'role', 'photo_path', 'quote', 'rating', 'status', 'is_featured', 'sort_order', 'created_by'])]
class Testimonial extends Model
{
    use LogsActivity;

    public const STATUSES = ['draft', 'published'];

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
