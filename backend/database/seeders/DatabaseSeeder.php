<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            LanguagesSeeder::class,
            AdminUserSeeder::class,
            PageContentSeeder::class,
            BuiltInPagesSeeder::class,
            SettingSeeder::class,
            EventSeeder::class,
            TestimonialSeeder::class,
            DemoUsersSeeder::class,
            DemoContentSeeder::class,
        ]);
    }
}
