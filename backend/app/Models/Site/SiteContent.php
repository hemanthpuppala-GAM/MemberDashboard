<?php

namespace App\Models\Site;

use App\Models\Auth\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['page', 'data', 'updated_by'])]
class SiteContent extends Model
{
    /** Public pages whose copy is editable from Admin → Site content. */
    public const PAGES = ['home', 'about', 'mission', 'meditation', 'wisdom', 'wellness', 'events'];

    protected function casts(): array
    {
        return ['data' => 'array'];
    }

    public function editor()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
