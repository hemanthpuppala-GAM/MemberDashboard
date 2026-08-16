<?php

namespace Database\Seeders;

use App\Models\Cms\PageContent;
use Illuminate\Database\Seeder;

/**
 * Seeds page_contents with the copy that used to be hardcoded in
 * frontend/src/components/sections/*.jsx, so the public site keeps showing
 * the same content once it switches to reading from the API.
 */
class PageContentSeeder extends Seeder
{
    public function run(): void
    {
        $blocks = [
            [
                'slug' => 'about',
                'eyebrow' => 'About Me',
                'title' => 'A teaching, not a brand',
                'description' => 'Golden Age Wisdom carries a living lineage of meditation practice — offered freely, held by a community of everyday practitioners rather than a single teacher or institution.',
                'points' => [
                    'Rooted in a decades-old meditation lineage, adapted for modern practice',
                    'Guided by volunteer practitioners, not paid staff',
                    'Open to any background — no prior experience or belief required',
                ],
                'reverse' => false,
            ],
            [
                'slug' => 'meditate',
                'eyebrow' => 'Meditation',
                'title' => 'Sit alone, or sit with the world',
                'description' => 'Start with a solo timed sit whenever you like, or join the daily mass meditation — the same moment, held by practitioners around the world at once.',
                'points' => [
                    'A daily group sit, open to anyone, anywhere',
                    'Solo timed sits in 5, 15, or 30 minutes',
                    'No streaks to keep, no account required to start',
                ],
                'cta_label' => "Join today's sit",
                'cta_href' => '#meditate-now',
                'cta_variant' => 'primary',
                'reverse' => true,
            ],
            [
                'slug' => 'wellness',
                'eyebrow' => 'Wellness',
                'title' => 'Practice for the body, not just the mind',
                'description' => 'Gentle movement, breathwork, and rest practices that prepare the body to sit still — meditation supported by the rest of daily life, not separate from it.',
                'points' => [
                    'Breathwork sequences to open a sit or close a long day',
                    'Simple movement practices, no equipment needed',
                    'Guidance on sleep, rest, and pacing your own practice',
                ],
                'reverse' => false,
            ],
            [
                'slug' => 'events',
                'eyebrow' => 'Events',
                'title' => 'Gather, in person and online',
                'description' => 'From weekly online circles to seasonal in-person retreats — ways to practice alongside others, at whatever distance feels right.',
                'points' => [
                    'Weekly online circles, open to newcomers',
                    'Seasonal in-person retreats and gatherings',
                    'Local practice groups, searchable by city',
                ],
                'reverse' => false,
            ],
            [
                'slug' => 'mission',
                'eyebrow' => 'Our Mission',
                'title' => 'Why we exist',
                'description' => 'We believe a calmer inner life adds up to a calmer world. Every sit — solo or shared — is one small, verifiable act toward that, offered without cost or obligation.',
                'points' => [
                    'Free access to every teaching and every session, always',
                    'Funded entirely by voluntary support, never by ads',
                    'Run by a small volunteer team across several countries',
                ],
                'reverse' => true,
            ],
        ];

        foreach ($blocks as $block) {
            PageContent::updateOrCreate(['slug' => $block['slug']], $block);
        }
    }
}
