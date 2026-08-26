<?php

namespace Database\Seeders;

use App\Models\Languages\Language;
use App\Models\Languages\UiTranslation;
use Illuminate\Database\Seeder;

/** English defaults for site chrome (navbar/footer/hub) rendered outside the CMS section system — see docs/plan for UiTranslation. */
class UiStringsSeeder extends Seeder
{
    private const STRINGS = [
        'nav.about' => 'About',
        'nav.wisdom' => 'Wisdom',
        'nav.wellness' => 'Wellness',
        'nav.meditation' => 'Meditation',
        'nav.events' => 'Events',
        'nav.mission' => 'Mission',
        'nav.volunteer' => 'Volunteer',
        'nav.support' => 'Support',
        'nav.contact' => 'Contact',
        'nav.join_free' => 'Join free',

        'footer.tagline' => 'Free daily meditation and Upanishadic wisdom, offered without cost or obligation to anyone who seeks it.',
        'footer.explore_heading' => 'Explore',
        'footer.contact_heading' => 'Contact',
        'footer.connect_heading' => 'Connect',
        'footer.get_in_touch' => 'Get in touch →',
        'footer.support_mission' => 'Support the mission',
        'footer.go_back' => 'Go Back',
        'footer.copyright' => '© {year} Golden Age Wisdom · A registered non-profit',
        'footer.funded_by_ads' => 'Funded entirely by voluntary support, never by ads',

        'hub.choose_path' => 'Choose a path · the center breathes with you',
        'hub.support' => 'Support',
        'hub.copyright' => 'A registered non-profit · © {year}',
    ];

    /** Navbar-only for now — footer/hub strings fall back to English until translated via Admin → Site Text. */
    private const TELUGU_NAV_STRINGS = [
        'nav.about' => 'మా గురించి',
        'nav.wisdom' => 'జ్ఞానం',
        'nav.wellness' => 'క్షేమం',
        'nav.meditation' => 'ధ్యానం',
        'nav.events' => 'కార్యక్రమాలు',
        'nav.mission' => 'లక్ష్యం',
        'nav.volunteer' => 'స్వచ్ఛంద సేవ',
        'nav.support' => 'మద్దతు',
        'nav.contact' => 'సంప్రదించండి',
        'nav.join_free' => 'ఉచితంగా చేరండి',
    ];

    public function run(): void
    {
        $defaultLanguageId = Language::where('is_default', true)->value('id');
        if ($defaultLanguageId) {
            foreach (self::STRINGS as $key => $value) {
                UiTranslation::updateOrCreate(['language_id' => $defaultLanguageId, 'key' => $key], ['value' => $value]);
            }
        }

        $teLanguageId = Language::where('code', 'te')->value('id');
        if ($teLanguageId) {
            foreach (self::TELUGU_NAV_STRINGS as $key => $value) {
                UiTranslation::updateOrCreate(['language_id' => $teLanguageId, 'key' => $key], ['value' => $value]);
            }
        }
    }
}
