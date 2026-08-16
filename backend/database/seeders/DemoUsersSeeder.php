<?php

namespace Database\Seeders;

use App\Models\Auth\Role;
use App\Models\Auth\User;
use Illuminate\Database\Seeder;

/** Non-production only — mirrors USERS in frontend/src/admin/mock/mockData.js so a fresh local/staging install is immediately explorable. */
class DemoUsersSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'staging'])) {
            return;
        }

        $roles = Role::pluck('id', 'name');

        $users = [
            ['name' => 'Devika Rao', 'email' => 'devika@goldenagewisdom.org', 'role' => 'content_manager'],
            ['name' => 'Ravi Kumar', 'email' => 'ravi@goldenagewisdom.org', 'role' => 'practitioner', 'specialty' => 'Kundalini & Breathwork', 'bio' => 'Guides seekers through kundalini activation and pranayama.', 'max_capacity' => 20],
            ['name' => 'Meera Iyer', 'email' => 'meera@goldenagewisdom.org', 'role' => 'practitioner', 'specialty' => 'Sound Healing', 'bio' => 'Uses Tibetan bowls and mantra for nervous-system reset.', 'max_capacity' => 15],
            ['name' => 'Karan Patel', 'email' => 'karan@goldenagewisdom.org', 'role' => 'practitioner', 'specialty' => 'General Wellness', 'bio' => 'Supports newcomers with grounding practices.', 'max_capacity' => 10, 'status' => 'inactive'],
        ];

        foreach ($users as $data) {
            $roleId = $roles[$data['role']] ?? null;
            if (! $roleId) {
                continue;
            }

            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => 'password',
                    'status' => $data['status'] ?? 'active',
                    'primary_role_id' => $roleId,
                    'specialty' => $data['specialty'] ?? null,
                    'bio' => $data['bio'] ?? null,
                    'max_capacity' => $data['max_capacity'] ?? null,
                    'email_verified_at' => now(),
                ],
            );

            $user->roles()->syncWithoutDetaching([$roleId]);
        }
    }
}
