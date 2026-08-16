<?php

namespace App\Models\Cms;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use App\Models\Auth\User;

#[Fillable([
    'title',
    'description',
    'starts_at',
    'ends_at',
    'location',
    'join_url',
    'is_published',
    'updated_by',
])]
class Event extends Model
{
    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_published' => 'boolean',
        ];
    }

    public function editor()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
