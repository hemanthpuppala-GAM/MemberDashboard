<?php

namespace App\Models\Content;

use App\Models\People\VolunteerApplication;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

#[Fillable(['name', 'slug', 'description', 'is_active', 'sort_order'])]
class VolunteerCategory extends Model
{
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        // Applications store team slugs, so every category needs a stable one.
        static::creating(function (self $category) {
            if (! filled($category->slug)) {
                $base = Str::slug($category->name) ?: 'team';
                $slug = $base;
                for ($i = 2; static::where('slug', $slug)->exists(); $i++) {
                    $slug = $base.'-'.$i;
                }
                $category->slug = $slug;
            }
        });
    }

    public function applications(): HasMany
    {
        return $this->hasMany(VolunteerApplication::class, 'category_id');
    }
}
