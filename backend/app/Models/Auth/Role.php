<?php

namespace App\Models\Auth;

use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name', 'display_name', 'description', 'is_system'])]
class Role extends Model
{
    use LogsActivity;

    public const SUPER_ADMIN = 'super_admin';

    public const SYSTEM_ROLES = ['super_admin', 'admin', 'content_manager', 'practitioner'];

    public function getName(): string
    {
        return $this->display_name;
    }

    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
        ];
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permissions');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_roles');
    }
}
