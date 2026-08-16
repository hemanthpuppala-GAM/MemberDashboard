<?php

namespace App\Models\Cms;

use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Auth\User;

#[Fillable(['slug', 'title', 'is_builtin', 'status', 'sort_order', 'created_by'])]
class Page extends Model
{
    use LogsActivity;

    public const BUILTIN_SLUGS = ['home', 'about', 'meditate', 'wellness', 'events', 'mission', 'contact'];

    public const STATUSES = ['draft', 'published'];

    protected function casts(): array
    {
        return [
            'is_builtin' => 'boolean',
        ];
    }

    public function translations(): HasMany
    {
        return $this->hasMany(PageTranslation::class);
    }

    public function sections(): HasMany
    {
        return $this->hasMany(PageSection::class)->orderBy('sort_order');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
