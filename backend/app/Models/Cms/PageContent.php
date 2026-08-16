<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'slug',
    'eyebrow',
    'title',
    'description',
    'points',
    'cta_label',
    'cta_href',
    'cta_variant',
    'reverse',
    'image_path',
    'updated_by',
])]
class PageContent extends Model
{
    public const SLUGS = ['about', 'meditate', 'wellness', 'events', 'mission'];

    protected function casts(): array
    {
        return [
            'points' => 'array',
            'reverse' => 'boolean',
        ];
    }

    public function editor()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
