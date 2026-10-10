<?php

namespace App\Models\Support;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['kind', 'name', 'phone', 'email', 'user_id', 'is_active'])]
#[Hidden(['pin_hash'])]
class SupportAgent extends Authenticatable
{
    use HasApiTokens;

    /** Kinds an admin adds by hand. "staff" agents are created when an admin user opens the desk. */
    public const KINDS = ['core', 'volunteer'];

    public const STAFF = 'staff';

    public function user()
    {
        return $this->belongsTo(\App\Models\Auth\User::class);
    }

    /** The desk identity of an admin-panel user (created on first use). */
    public static function forUser(\App\Models\Auth\User $user): self
    {
        return static::firstOrCreate(
            ['user_id' => $user->id],
            ['kind' => self::STAFF, 'name' => $user->name ?: $user->email, 'is_active' => true],
        );
    }

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'last_login_at' => 'datetime'];
    }

    /** Digits only; a bare 10-digit Indian number gets the 91 prefix. */
    public static function normalizePhone(?string $phone): ?string
    {
        // Digits only, without trunk zeros ("07396…" or "0091…" typed by hand).
        $digits = ltrim(preg_replace('/\D+/', '', (string) $phone), '0');
        if ($digits === '') {
            return null;
        }

        return strlen($digits) === 10 ? '91'.$digits : $digits;
    }

    public function setPin(string $pin): void
    {
        $this->pin_hash = Hash::make($pin);
    }

    public function checkPin(string $pin): bool
    {
        return $this->pin_hash !== null && Hash::check($pin, $this->pin_hash);
    }

    public function toPublic(): array
    {
        return ['id' => $this->id, 'name' => $this->name, 'kind' => $this->kind];
    }
}
