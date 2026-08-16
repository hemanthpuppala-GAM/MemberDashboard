<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['section_id', 'language_id', 'field_key', 'field_value', 'field_type'])]
class SectionContent extends Model
{
    public const FIELD_TYPES = ['text', 'json', 'image_path'];

    public function section(): BelongsTo
    {
        return $this->belongsTo(PageSection::class, 'section_id');
    }

    public function language(): BelongsTo
    {
        return $this->belongsTo(Language::class);
    }

    public function decodedValue(): mixed
    {
        if ($this->field_type === 'json' && $this->field_value !== null) {
            return json_decode($this->field_value, true);
        }

        return $this->field_value;
    }
}
