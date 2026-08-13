<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@goldenagewisdom.org')],
            [
                'name' => 'Admin',
                'password' => env('ADMIN_PASSWORD', 'ChangeMe123!'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ],
        );
    }
}
