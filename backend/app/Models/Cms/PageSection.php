<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['page_id', 'type', 'sort_order', 'status'])]
class PageSection extends Model
{
    public const TYPES = ['hero', 'content_block', 'card_grid', 'event_list', 'contact_form', 'media_embed', 'custom_html'];

    public const STATUSES = ['active', 'hidden'];

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    public function content(): HasMany
    {
        return $this->hasMany(SectionContent::class, 'section_id');
    }
}
