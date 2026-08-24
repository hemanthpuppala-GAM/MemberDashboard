<?php

namespace Database\Seeders;

use App\Models\Content\Testimonial;
use Illuminate\Database\Seeder;

/**
 * Real visitor quotes from the live site's "voice rail" (shared between the
 * About and Events pages) — see CONTENT.md §1.
 */
class TestimonialSeeder extends Seeder
{
    public function run(): void
    {
        $quotes = [
            ['name' => 'Manohar Gnani', 'quote' => 'A doctor in a white coat heals the body; a spiritual teacher heals the soul.'],
            ['name' => 'Sreenivas Kumar G.', 'quote' => 'He explains spiritual principles in a simple, logical and scientific way.'],
            ['name' => 'Jyothi Gunda', 'quote' => 'Now I know what inner peace is, and how to attain it.'],
            ['name' => 'Sheela Shivraman', 'quote' => 'After knowing him I have not only improved my health but also my thinking towards my life.'],
            ['name' => 'Kavitha Reddy', 'quote' => 'Incredibly knowledgeable — a walking encyclopedia, with answers to even the most profound spiritual questions.'],
            ['name' => 'Swathi G', 'quote' => 'I have attended a few of his sessions — fantastic, and free of cost.'],
            ['name' => 'Vamshi', 'quote' => 'My thoughts really changed after listening to Hari sir — and I started doing meditation.'],
            ['name' => 'Hem', 'quote' => 'His teachings have helped me navigate daily stress with a calm and grounded spirit.'],
            ['name' => 'Kalyani', 'quote' => 'He is a torch bearer to many in spirituality.'],
            ['name' => 'Aruna Chatla', 'quote' => 'The Golden Age movement will definitely attract more youth towards meditation.'],
            ['name' => 'Syamala Gowri', 'quote' => 'Spiritual knowledge + scientific knowledge + simplicity + compassion + thirst for human evolution = Dr. Hari Krishna sir'],
        ];

        foreach ($quotes as $i => $quote) {
            Testimonial::updateOrCreate(
                ['name' => $quote['name'], 'quote' => $quote['quote']],
                ['status' => 'published', 'is_featured' => false, 'sort_order' => $i + 1, 'rating' => 5],
            );
        }
    }
}
