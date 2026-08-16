<?php

namespace Database\Seeders;

use App\Models\Cms\Event;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        if (Event::count() > 0) {
            return;
        }

        Event::create([
            'title' => 'Weekly Online Circle',
            'description' => 'A guided group sit open to anyone, anywhere — no experience required.',
            'starts_at' => Carbon::now()->next('Sunday')->setTime(18, 0),
            'ends_at' => Carbon::now()->next('Sunday')->setTime(19, 0),
            'location' => 'Online',
            'join_url' => 'https://goldenagewisdom.org/join',
            'is_published' => true,
        ]);

        Event::create([
            'title' => 'Seasonal Retreat',
            'description' => 'A weekend in-person gathering for deeper practice and community.',
            'starts_at' => Carbon::now()->addMonth()->startOfMonth()->addDays(9),
            'ends_at' => Carbon::now()->addMonth()->startOfMonth()->addDays(11),
            'location' => 'Rishikesh, India',
            'join_url' => null,
            'is_published' => true,
        ]);
    }
}
