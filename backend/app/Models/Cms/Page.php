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

    public const BUILTIN_SLUGS = ['home', 'about', 'meditate', 'wellness', 'events', 'mission', 'wisdom', 'contact', 'volunteer', 'donate'];

    public const STATUSES = ['draft', 'published'];

    /**
     * The new website shows CMS sections under its hand-built pages (About, Wisdom, …), but the
     * built-in CMS pages still carry sections seeded for the previous site, which repeat old copy.
     * On built-in pages the site therefore shows only sections added from this moment on.
     */
    public const SITE_SECTIONS_SINCE = '2026-10-14 00:00:00';

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
