<?php

namespace App\Models\Languages;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'native_name', 'code', 'direction', 'is_enabled', 'is_default'])]
class Language extends Model
{
    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'is_default' => 'boolean',
        ];
    }
}
