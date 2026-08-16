<?php

namespace Database\Seeders;

use App\Models\Auth\Role;
use App\Models\Auth\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $superAdminRole = Role::where('name', Role::SUPER_ADMIN)->firstOrFail();

        $user = User::updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@goldenagewisdom.org')],
            [
                'name' => 'Admin',
                'password' => env('ADMIN_PASSWORD', 'ChangeMe123!'),
                'status' => 'active',
                'primary_role_id' => $superAdminRole->id,
                'email_verified_at' => now(),
            ],
        );

        $user->roles()->syncWithoutDetaching([$superAdminRole->id]);
    }
}
