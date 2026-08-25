<?php

namespace Database\Seeders;

use App\Models\Cms\Media;
use App\Models\Cms\Page;
use App\Models\Cms\PageSection;
use App\Models\Cms\PageTranslation;
use App\Models\Cms\SectionContent;
use App\Models\Languages\Language;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

/**
 * Seeds the pages/page_sections/section_content system (the one the admin
 * CMS UI already edits) with today's real copy, so the public site can
 * switch from hardcoded JSX to fetching from GET /pages/{slug} without
 * losing any content. Mirrors the copy in PageContentSeeder (legacy
 * page_contents table) and the hardcoded strings in HeroSection.jsx /
 * WisdomSection.jsx.
 */
class BuiltInPagesSeeder extends Seeder
{
    public function run(): void
    {
        $language = Language::where('is_default', true)->firstOrFail();

        $contentBlocks = [
            [
                'slug' => 'about',
                'title' => 'About',
                'fields' => [
                    'eyebrow' => 'About Me',
                    'heading' => 'Dr. Hari Krishna — where science meets spirit',
                    'description' => 'A medical professional and spiritual teacher, Dr. Hari Krishna founded the Golden Age Spiritual Movement to make meditation logical, practical and free for all — guiding a global community of seekers toward conscious living and the coming golden age.',
                    'reverse' => false,
                ],
            ],
            [
                'slug' => 'meditate',
                'title' => 'Meditate',
                'fields' => [
                    'eyebrow' => 'The Path · Meditation 101',
                    'heading' => 'Explained simply — and scientifically',
                    'description' => "You don't do meditation. You sit, you surrender, and it happens. That's the whole method. Nothing to buy, nothing to master.",
                    'points' => [
                        'Sit cross-legged, hands joined or at rest — any comfortable seat will do, floor or chair. Cross the legs and rest the palms open on the knees, or join the hands together in the lap; either closes the circuit. Keep the spine easy and upright.',
                        'Close the eyes — nothing to look at. The world can wait an hour.',
                        "Watch the breath — don't control it. Just notice it arriving and leaving.",
                        'Let the thoughts flow — they are traffic, not enemies. Watching them is the practice.',
                        'Surrender and observe — surrender means: I am nothing. Let the universe — nature, God, whichever word is yours — deal with it. Stop trying to meditate and allow it to happen to you.',
                    ],
                    'cta_label' => 'Take the 41-day challenge',
                    'cta_href' => '#meditate-now',
                    'reverse' => true,
                ],
            ],
            [
                'slug' => 'wellness',
                'title' => 'Wellness',
                'fields' => [
                    'eyebrow' => 'Wellness',
                    'heading' => 'Practice for the body, not just the mind',
                    'description' => 'Gentle movement, breathwork, and rest practices that prepare the body to sit still — meditation supported by the rest of daily life, not separate from it.',
                    'points' => [
                        'Breathwork sequences to open a sit or close a long day',
                        'Simple movement practices, no equipment needed',
                        'Guidance on sleep, rest, and pacing your own practice',
                    ],
                    'reverse' => false,
                ],
            ],
            [
                'slug' => 'events',
                'title' => 'Events',
                'fields' => [
                    'eyebrow' => 'Events',
                    'heading' => 'Gather, in person and online',
                    'description' => 'From weekly online circles to seasonal in-person retreats — ways to practice alongside others, at whatever distance feels right.',
                    'points' => [
                        'Weekly online circles, open to newcomers',
                        'Seasonal in-person retreats and gatherings',
                        'Local practice groups, searchable by city',
                    ],
                    'reverse' => false,
                ],
            ],
            [
                'slug' => 'mission',
                'title' => 'Our Mission',
                'fields' => [
                    'eyebrow' => 'Our Mission',
                    'heading' => 'Why we exist',
                    'description' => 'We believe a calmer inner life adds up to a calmer world. Every sit — solo or shared — is one small, verifiable act toward that, offered without cost or obligation.',
                    'points' => [
                        'Free access to every teaching and every session, always',
                        'Funded entirely by voluntary support, never by ads',
                        'Run by a small volunteer team across several countries',
                    ],
                    'reverse' => true,
                ],
            ],
            [
                'slug' => 'wisdom',
                'title' => 'Wisdom',
                'fields' => [
                    'eyebrow' => 'Wisdom',
                    'heading' => 'Teachings for a quiet mind',
                    'description' => 'Short talks, recorded sits, and written reflections on the practice — the same material shared in our in-person circles, kept open for anyone to read or listen to at their own pace.',
                    'points' => [
                        'Weekly reflections on practice and daily life',
                        'Recorded guided sits in multiple lengths',
                        'A growing library, organized by theme rather than difficulty',
                    ],
                    'reverse' => true,
                ],
            ],
            [
                'slug' => 'contact',
                'title' => 'Contact',
                'fields' => [
                    'eyebrow' => 'Contact',
                    'heading' => 'Send us a question',
                    'description' => "Whether it's about a session, a retreat, or getting involved — we read every message.",
                    'reverse' => false,
                ],
            ],
            [
                'slug' => 'volunteer',
                'title' => 'Volunteer',
                'fields' => [
                    'eyebrow' => 'Volunteer',
                    'heading' => 'Become a volunteer',
                    'description' => "Give your time and talent to the community — tell us a bit about yourself and where you'd like to help.",
                    'reverse' => false,
                ],
            ],
            [
                'slug' => 'donate',
                'title' => 'Donate',
                'fields' => [
                    'eyebrow' => 'Support the mission',
                    'heading' => 'Help keep every teaching free',
                    'description' => 'Every session, retreat, and teaching stays free because of voluntary support like yours — choose whichever way works best for you below.',
                    'reverse' => false,
                ],
            ],
        ];

        foreach ($contentBlocks as $block) {
            $this->seedPage($block['slug'], $block['title'], $language, 'content_block', $block['fields']);
        }

        $heroFields = [
            'eyebrow' => '',
            'heading' => "Peace begins within —\ntogether we *radiate it* across the world",
            'description' => 'A global movement to awaken consciousness, live in harmony, and create a golden future.',
            'cta_label' => 'Join the movement',
            'cta_href' => 'https://goldenagewisdom.org/join',
        ];
        if ($heroImageUrl = $this->seedHeroImage()) {
            $heroFields['image'] = $heroImageUrl;
        }
        $this->seedPage('home', 'Home', $language, 'hero', $heroFields);

        $this->seedMeditateDeepContent($language);
        $this->seedAboutStrengths($language);
        $this->seedEventsList($language);
    }

    /**
     * The events page's auto-rendering event_list section — the frontend's
     * EventListSection reads this section's presence to know to fetch and
     * show published events, rather than always fetching unconditionally.
     */
    private function seedEventsList(Language $language): void
    {
        $page = Page::where('slug', 'events')->firstOrFail();

        $this->seedSection($page, $language, 'event_list', 2, [
            'heading' => 'Upcoming gatherings',
        ]);
    }

    /**
     * The three "strengths" cards on the About page (education, meditation
     * practice, kundalini) — a proper card_grid section instead of squeezing
     * them into content_block's bullet points. See CONTENT.md §1.
     */
    private function seedAboutStrengths(Language $language): void
    {
        $page = Page::where('slug', 'about')->firstOrFail();

        // The three strengths used to live as content_block bullet points —
        // now they're their own card_grid section, so drop the stale field.
        $contentBlock = $page->sections()->where('type', 'content_block')->first();
        $contentBlock?->content()->where('field_key', 'points')->delete();

        $this->seedSection($page, $language, 'card_grid', 2, [
            'heading' => 'What grounds the teaching',
            'cards' => [
                ['icon' => '🎓', 'title' => 'Education', 'body' => 'A qualified medical doctor — MD in Anaesthesiology — bringing scientific clarity from biology, psychology and physiology to every teaching.'],
                ['icon' => '☾', 'title' => '25 years of meditation', 'body' => 'Over 25 years of dedicated practice and deep study of consciousness — from Anapanasati breath awareness to the science of prana and the energy body.'],
                ['icon' => '༄', 'title' => 'Kundalini-awakened guru', 'body' => 'A guide who has walked the path — demystifying kundalini and guiding real awakening journeys with patience, compassion and direct experience.'],
            ],
        ]);
    }

    /**
     * The deeper "Meditation 101" content (quick answers, the science, the
     * new/seasoned toggle, the yuga/mission tie-in) — see CONTENT.md §2. Each
     * lives as its own section on the 'meditate' page, after the main
     * content_block, so the admin CMS UI can edit them independently.
     */
    private function seedMeditateDeepContent(Language $language): void
    {
        $page = Page::where('slug', 'meditate')->firstOrFail();

        $this->seedSection($page, $language, 'quick_answers', 2, [
            'heading' => 'Quick answers',
            'items' => [
                ['label' => 'Best time', 'title' => 'Sunrise', 'body' => 'Brahmamuhurtham is finest — but no hour is forbidden. The one you keep is the right one.'],
                ['label' => 'How long', 'title' => "It happens, you don't do it", 'body' => 'Beginners: start with 30 minutes, or an hour if it comes easily. Some sit 1–2 hours; some drop deep in minutes. Comparison is a thief of joy.'],
                ['label' => 'The goal', 'title' => "There isn't one", 'body' => 'Keep sitting. Life reorders itself — physically, emotionally, spiritually. Try it and watch.'],
            ],
        ]);

        $this->seedSection($page, $language, 'science_panel', 3, [
            'eyebrow' => 'The science, simply',
            'heading' => 'The field closes into a torus around you',
            'body' => "Sit still with the legs crossed — palms open on the knees, or the hands joined together in the lap — and the body's field closes on itself: lines of energy leave the crown, arc wide around you, and return through the base of the spine — the same shape a magnet draws in iron filings. Inside that loop the work is not yours to do. Healing settles, energy rises, the chakras open in their own order. You only have to stop interfering.",
            'recommend_heading' => 'Dr. Hari Krishna recommends — simply sit and watch the breath',
            'recommend_body' => 'No technique to learn, no counting, no force — and by far the most efficient way. Surrender, and let whichever breath wants to happen, happen by itself.',
            'techniques' => ['Soham', 'Kundalini breathing', 'Anapanasati', 'Kumbhaka', 'Bhramari'],
            'techniques_note' => 'Other techniques people use (optional, not required). Some use these as a catalyst into a deeper state. They are optional — the sitting is not.',
            'body_note' => 'And the body? Most disease sits at the mitochondrial level. Restored prana reaches the cell and heals upward — cellular, bodily, psychic, emotional.',
        ]);

        $this->seedSection($page, $language, 'deep_cards', 4, [
            'new_label' => 'New to this',
            'new_body' => 'As Dr. Hari says — "Gammuga kurcho" means simply sit, quietly.',
            'seasoned_label' => 'Seasoned meditator',
            'items' => [
                ['icon' => '༄', 'title' => 'What kundalini is', 'body' => 'An infinite energy that rises and aligns every chakra, moving like a serpent — cleansing the nadis, healing at each level. Scientifically: cosmic energy raising your frequency once you are connected. Emotionally: fear, shame and guilt giving way to bliss.'],
                ['icon' => '✦', 'title' => 'Karmas, visions, openings', 'body' => 'Third-eye visions, past-life glimpses, awakenings — all part of the terrain. They come and they go. The real beauty is transformation: wisdom that stays after the vision fades.'],
                ['icon' => '◎', 'title' => 'Where the energy comes from', 'body' => 'Some use a pyramid as a conductor. Some sit in groups, where consciousness pools higher. Some connect straight to the universe and give energy away like transformers. Guided meditation is another door.'],
                ['icon' => '☀', 'title' => 'The ultimate truth', 'body' => 'It depends on what you seek — joy for one, wisdom for another, self-discovery for the next. Come to know yourself through your own journey. See you on the other side, friend.'],
            ],
            'footer_note' => 'Letters, shapes, numbers, colours behind the eyes? Enough reading, friend — time to meditate.',
        ]);

        $this->seedSection($page, $language, 'mission_cosmology', 5, [
            'eyebrow' => 'World peace through meditation, scientifically',
            'intro' => 'In the ancient yuga cycle, time turns through four great ages. We live at the far edge of Kali — the age of conflict and restlessness — and every tradition that tells this story agrees on what comes next: Satya Yugam, the age of truth. A world where harmony is the norm, not the exception.',
            'yugas' => [
                ['name' => 'Satya', 'label' => 'The Golden Age', 'description' => 'Truth, harmony, meditation as the natural state', 'active' => false],
                ['name' => 'Treta', 'label' => 'The Silver Age', 'description' => 'Virtue begins to wane', 'active' => false],
                ['name' => 'Dvapara', 'label' => 'The Bronze Age', 'description' => 'Balance tips toward unrest', 'active' => false],
                ['name' => 'Kali', 'label' => 'The dark age of conflict', 'description' => 'Where we rise from, together', 'active' => true],
            ],
            'outro' => 'Science gives us the mechanism: when enough minds settle into stillness, the collective field shifts — calm spreads the way fear does, person to person. The golden age is not waited for. It is meditated into being.',
            'goal_percent' => '8%',
            'goal_label' => 'of humanity in meditative space — the critical mass of consciousness that tips the world into Satya Yugam.',
            'goal_caption' => 'Every lit dot is a meditator · be the next one.',
        ]);
    }

    /**
     * Copies the homepage hero photo out of the frontend's bundled assets
     * into DB-backed storage (media table + public disk), so it shows up in
     * the Media Library and the hero section's "Background image" field is
     * admin-editable/replaceable instead of silently falling back to the
     * hardcoded frontend import.
     */
    private function seedHeroImage(): ?string
    {
        $source = base_path('../frontend/src/assets/hari_sir_stream.png');
        if (! is_file($source)) {
            return null;
        }

        $path = 'media/hari-sir-stream.png';
        Storage::disk('public')->put($path, file_get_contents($source));

        $media = Media::updateOrCreate(
            ['path' => $path],
            [
                'filename' => 'hari-sir-stream.png',
                'original_name' => 'hari_sir_stream.png',
                'disk' => 'public',
                'url' => Storage::disk('public')->url($path),
                'mime_type' => 'image/png',
                'size_bytes' => filesize($source),
                'folder' => 'Home',
            ],
        );

        return $media->url;
    }

    private function seedPage(string $slug, string $title, Language $language, string $sectionType, array $fields): void
    {
        $page = Page::updateOrCreate(
            ['slug' => $slug],
            ['title' => $title, 'is_builtin' => true, 'status' => 'published', 'sort_order' => 0],
        );

        PageTranslation::updateOrCreate(
            ['page_id' => $page->id, 'language_id' => $language->id],
            ['title' => $title],
        );

        $this->seedSection($page, $language, $sectionType, 1, $fields);
    }

    private function seedSection(Page $page, Language $language, string $sectionType, int $sortOrder, array $fields): void
    {
        $section = PageSection::firstOrCreate(
            ['page_id' => $page->id, 'type' => $sectionType],
            ['sort_order' => $sortOrder, 'status' => 'active'],
        );

        foreach ($fields as $key => $value) {
            $isArray = is_array($value);
            $isBool = is_bool($value);

            SectionContent::updateOrCreate(
                ['section_id' => $section->id, 'language_id' => $language->id, 'field_key' => $key],
                [
                    'field_value' => ($isArray || $isBool) ? json_encode($value) : $value,
                    'field_type' => ($isArray || $isBool) ? 'json' : 'text',
                ],
            );
        }
    }
}
