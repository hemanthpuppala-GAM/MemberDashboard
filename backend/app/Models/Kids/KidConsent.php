<?php

namespace App\Models\Kids;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** One signature, never changed afterwards: the exact text, what was ticked, the children and photo answers. */
#[Fillable(['kid_registration_id', 'document', 'version', 'text_hash', 'snapshot', 'agreed', 'children', 'signature_name', 'signed_at', 'ip', 'user_agent'])]
class KidConsent extends Model
{
    protected function casts(): array
    {
        return [
            'snapshot' => 'array',
            'agreed' => 'array',
            'children' => 'array',
            'signed_at' => 'datetime',
            'version' => 'integer',
        ];
    }

    public function registration(): BelongsTo
    {
        return $this->belongsTo(KidRegistration::class, 'kid_registration_id');
    }
}
