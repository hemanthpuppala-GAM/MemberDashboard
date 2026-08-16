<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'label', 'account_holder', 'bank_name', 'account_number', 'ifsc', 'branch',
    'swift', 'upi_id', 'payout_link', 'qr_image_path', 'notes', 'is_active', 'sort_order',
])]
class DonationMethod extends Model
{
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
