<?php

namespace App\Models\Content;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['type', 'label', 'value', 'is_visible', 'sort_order'])]
class ContactChannel extends Model
{
    public const TYPES = ['phone', 'whatsapp', 'email', 'address', 'website', 'social'];

    protected function casts(): array
    {
        return [
            'is_visible' => 'boolean',
        ];
    }
}
