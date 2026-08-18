<?php

namespace App\Models\Content;

use App\Models\People\VolunteerApplication;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'is_active', 'sort_order'])]
class VolunteerCategory extends Model
{
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function applications(): HasMany
    {
        return $this->hasMany(VolunteerApplication::class, 'category_id');
    }
}
