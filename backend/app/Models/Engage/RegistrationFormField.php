<?php

namespace App\Models\Engage;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['form_id', 'label', 'field_key', 'type', 'is_required', 'options', 'placeholder', 'sort_order'])]
class RegistrationFormField extends Model
{
    public const TYPES = ['text', 'textarea', 'email', 'phone', 'number', 'date', 'select', 'radio', 'checkbox', 'checkboxes'];

    /** Field types that need an `options` list of choices. */
    public const CHOICE_TYPES = ['select', 'radio', 'checkboxes'];

    /** A choice named "Other" or "Any other …" comes with its own text box ("Any other: yoga"). */
    public static function isOtherOption(string $option): bool
    {
        return (bool) preg_match('/^\s*(any\s+)?others?\b/i', $option);
    }

    protected function casts(): array
    {
        return [
            'is_required' => 'boolean',
            'options' => 'array',
        ];
    }

    public function form(): BelongsTo
    {
        return $this->belongsTo(RegistrationForm::class, 'form_id');
    }
}
