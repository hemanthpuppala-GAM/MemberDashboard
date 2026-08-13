<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['key', 'value'])]
class Setting extends Model
{
    public const DEFAULTS = [
        'contact_email' => 'hello@goldenagewisdom.org',
        'social_youtube' => 'https://www.youtube.com/@GoldenAgeGurus',
        'social_instagram' => '',
        'social_facebook' => '',
        'banner_text' => 'Free mass meditation',
        'maintenance_mode' => 'false',
    ];
}
