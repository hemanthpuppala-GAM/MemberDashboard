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
                'title' => 'Dr. Hari Krishna — where science meets spirit',
                'description' => 'A medical professional and spiritual teacher, Dr. Hari Krishna founded the Golden Age Spiritual Movement to make meditation logical, practical and free for all — guiding a global community of seekers toward conscious living and the coming golden age.',
                'points' => [
                    '🎓 Education — A qualified medical doctor — MD in Anaesthesiology — bringing scientific clarity from biology, psychology and physiology to every teaching.',
                    '☾ 25 years of meditation — Over 25 years of dedicated practice and deep study of consciousness — from Anapanasati breath awareness to the science of prana and the energy body.',
                    '༄ Kundalini-awakened guru — A guide who has walked the path — demystifying kundalini and guiding real awakening journeys with patience, compassion and direct experience.',
                ],
                'reverse' => false,
            ],
            [
                'slug' => 'meditate',
                'eyebrow' => 'The Path · Meditation 101',
                'title' => 'Explained simply — and scientifically',
                'description' => "You don't do meditation. You sit, you surrender, and it happens.",
                'points' => [
                    'Sit cross-legged, hands joined or at rest — any comfortable seat will do, floor or chair, spine easy and upright.',
                    'Close the eyes — nothing to look at, the world can wait an hour.',
                    'Watch the breath — don\'t control it, just notice it arriving and leaving.',
                    'Let the thoughts flow — they are traffic, not enemies. Watching them is the practice.',
                    'Surrender and observe — stop trying to meditate and allow it to happen to you.',
                ],
                'cta_label' => 'Take the 41-day challenge',
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
