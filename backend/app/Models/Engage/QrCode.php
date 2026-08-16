<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['title', 'type', 'input_data', 'options', 'file_path', 'download_count', 'created_by'])]
class QrCode extends Model
{
    public const TYPES = ['url', 'text', 'email', 'phone', 'sms', 'vcard', 'wifi', 'location'];

    protected function casts(): array
    {
        return [
            'input_data' => 'array',
            'options' => 'array',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
