<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The public site's quotes now come from admin Testimonials. Copy the quotes the site shipped
 * with (home rotation + sub-page quotes) into the table so nothing disappears, published and
 * featured. Quotes already in the table are left alone; removing one in admin removes it on the site.
 */
return new class extends Migration
{
    private const QUOTES = [
        ['Manohar Gnani', 'A doctor in a white coat heals the body; a spiritual teacher heals the soul.'],
        ['Sreenivas Kumar G.', 'He explains spiritual principles in a simple, logical and scientific way.'],
        ['Vamshi', 'My thoughts really changed after listening to Hari sir — and I started doing meditation.'],
        ['Jyothi Gunda', 'Now I know what inner peace is, and how to attain it.'],
        ['Sheela Shivraman', 'After knowing him I have not only improved my health but also my thinking towards my life.'],
        ['Hem', 'His teachings have helped me navigate daily stress with a calm and grounded spirit.'],
        ['Kavitha Reddy', 'Incredibly knowledgeable — a walking encyclopedia, with answers to even the most profound spiritual questions.'],
        ['Swathi G', 'I have attended a few of his sessions — fantastic, and free of cost.'],
        ['Premalatha', 'He is a modern Guru for people who want to grow spiritually.'],
        ['Aruna Chatla', 'The Golden Age movement will definitely attract more youth towards meditation.'],
        ['Kalyani', 'He is a torch bearer to many in spirituality.'],
        ['Syamala Gowri', 'Spiritual knowledge + scientific knowledge + simplicity + compassion + thirst for human evolution = Dr. Hari Krishna sir'],
    ];

    public function up(): void
    {
        $existing = DB::table('testimonials')->pluck('quote')->map(fn ($q) => trim($q, " \t\n\"“”"))->all();
        $order = (int) DB::table('testimonials')->max('sort_order');
        $now = now();

        foreach (self::QUOTES as [$name, $quote]) {
            if (in_array($quote, $existing, true)) {
                continue;
            }
            DB::table('testimonials')->insert([
                'name' => $name,
                'quote' => $quote,
                'rating' => 5,
                'status' => 'published',
                'is_featured' => true,
                'sort_order' => ++$order,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        DB::table('testimonials')->whereIn('quote', array_column(self::QUOTES, 1))->whereNull('created_by')->delete();
    }
};
