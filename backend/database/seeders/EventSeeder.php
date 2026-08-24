<?php

namespace Database\Seeders;

use App\Models\Cms\Event;
use Illuminate\Database\Seeder;

/**
 * Real gatherings — see CONTENT.md §3. Replaces the earlier placeholder
 * demo events ("Weekly Online Circle", "Seasonal Retreat") with the actual
 * featured gathering from the live site.
 */
class EventSeeder extends Seeder
{
    public function run(): void
    {
        Event::whereIn('title', ['Weekly Online Circle', 'Seasonal Retreat'])->delete();

        Event::updateOrCreate(
            ['title' => 'Awakening Hyderabad'],
            [
                'description' => 'Awaken the inner wisdom · live with purpose & peace — a full day with Dr. Harikrishna Garu, founder of the movement. Parking is limited — please carpool. Contact: info@goldenagewisdom.org',
                'starts_at' => '2026-07-26 11:00:00',
                'ends_at' => '2026-07-26 18:00:00',
                'location' => '9 Convention, Sanath Nagar, Hyderabad',
                'join_url' => null,
                'is_published' => true,
            ],
        );
    }
}
