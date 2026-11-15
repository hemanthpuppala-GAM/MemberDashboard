<?php

namespace App\Services\Kids;

/**
 * The legal text a parent signs for the Kids Meditation Circle (online), and the in-person workshop waiver.
 *
 * Each document has a version. Every signature stores the version, a SHA-256 of the exact text and a full copy
 * of it (kid_consents.snapshot), so we can always show what was agreed. Change of wording = bump VERSION;
 * parents with an older version are asked to sign again on their next visit.
 *
 * Written for US programs in any state. It meets the stricter Texas rules (release names negligence and is
 * conspicuous) and adds E-SIGN / UETA consent, severability and a governing-law clause. The governing state
 * comes from config('kids.governing_state') for online sessions, or from the event's state for in-person
 * workshops. A US attorney should review before it is relied on.
 */
class KidsConsent
{
    public const VERSION = 1;

    public const IN_PERSON_VERSION = 1;

    /** Sections the parent ticks one by one. `conspicuous` sections are shown boxed and bold. */
    public static function sections(): array
    {
        $org = config('kids.organization');
        $state = config('kids.governing_state');

        return [
            [
                'key' => 'program',
                'title' => 'About the program',
                'paragraphs' => [
                    "My child takes part by choice in free online sessions run by {$org} (the \"Organization\"): gentle breathing exercises (pranayama), short guided meditation, wisdom stories and games.",
                    'The sessions are for relaxation, well-being and general education only.',
                ],
            ],
            [
                'key' => 'health',
                'title' => 'Health notice and assumption of risk',
                'paragraphs' => [
                    'The Organization, its teachers and volunteers do not give medical, psychological or clinical care or advice. Dr. Hari Krishna is a physician, but these sessions do not create a doctor–patient relationship.',
                    'My child is physically and mentally fit to take part. If my child has a health condition, I will ask a licensed physician before my child joins.',
                    'Breathing and meditation can sometimes cause mild discomfort, light-headedness or strong feelings. My child may stop, rest or leave at any time. I understand these risks and accept them for my child.',
                ],
            ],
            [
                'key' => 'release',
                'title' => 'Release of liability',
                'conspicuous' => true,
                'paragraphs' => [
                    'TO THE FULLEST EXTENT PERMITTED BY LAW, I RELEASE AND DISCHARGE THE ORGANIZATION, ITS DIRECTORS, OFFICERS, SPIRITUAL LEADERS (INCLUDING DR. HARI KRISHNA), TEACHERS AND VOLUNTEERS FROM ANY CLAIM FOR INJURY OR LOSS ARISING FROM MY CHILD\'S PARTICIPATION, INCLUDING CLAIMS ARISING FROM THEIR OWN ORDINARY NEGLIGENCE.',
                    'This release does not cover gross negligence or intentional misconduct.',
                ],
            ],
            [
                'key' => 'permission',
                'title' => 'Parent permission and supervision',
                'paragraphs' => [
                    'I am the parent or legal guardian of each child named in this form. I give permission for each child to join the Kids Meditation Circle online.',
                    'A responsible adult will be at home during every session. My child will join from a safe, quiet place. I am responsible for my child\'s behavior and safety at home.',
                ],
            ],
            [
                'key' => 'safety',
                'title' => 'Our child-safety promise',
                'paragraphs' => [
                    'At least two approved adults are present in every session. There are no private chats and no one-to-one breakout rooms with a child.',
                    'Only registered children are admitted from the waiting room, by name. Zoom details are sent only to registered parents.',
                    'Sessions are not recorded. Volunteers who work with children are screened. We follow state child-abuse reporting laws.',
                    'If a child seems unwell or upset, a teacher will contact the parent. Parents may watch any session.',
                ],
            ],
            [
                'key' => 'media',
                'title' => 'Photos',
                'paragraphs' => [
                    'Sessions are not recorded. Now and then a teacher may take a group screenshot for our website or social media, only of children whose parent says yes below. We never show a child\'s full name with a photo.',
                    'You can change your answer at any time from your member dashboard. A change applies to future use.',
                ],
            ],
            [
                'key' => 'privacy',
                'title' => 'Privacy',
                'paragraphs' => [
                    'We use these details only to run the program and contact you. We do not sell or share them. Only program coordinators and teachers can see them.',
                    'You can see, correct or remove your details at any time. We keep this signed form until the youngest child named turns 21, as legal records require.',
                ],
            ],
            [
                'key' => 'signature',
                'title' => 'Electronic signature and general terms',
                'paragraphs' => [
                    'I agree to sign electronically. My typed full name is my signature, the same as signing by hand. A copy of this signed form is emailed to me and stays in my member dashboard.',
                    "This agreement covers every session until I withdraw, which I can do at any time. The laws of the State of {$state} apply. If any part is found invalid, the rest still applies.",
                ],
            ],
        ];
    }

    /** Draft text for in-person workshops (Phase 3: signed at RSVP / check-in). */
    public static function inPersonSections(?string $state = null): array
    {
        $org = config('kids.organization');
        $state = $state ?: config('kids.governing_state');

        return [
            ['key' => 'program', 'title' => 'About the workshop', 'paragraphs' => [
                "I (or my child) take part by choice in in-person meditation, gentle breathing (pranayama) and wellness programs run by {$org} (the \"Organization\"). They are for relaxation, well-being and general education only.",
            ]],
            ['key' => 'health', 'title' => 'Health notice and assumption of risk', 'paragraphs' => [
                'The Organization, its teachers and volunteers do not give medical, psychological or clinical care. Dr. Hari Krishna is a physician, but these programs do not create a doctor–patient relationship.',
                'I (or my child) am fit to take part. If there is a health condition, I will ask a licensed physician first.',
                'I understand and accept the risks, known and unknown, of attending in person, including mild discomfort, light-headedness, strong feelings, and slips or falls at the venue.',
            ]],
            ['key' => 'release', 'title' => 'Release of liability', 'conspicuous' => true, 'paragraphs' => [
                'TO THE FULLEST EXTENT PERMITTED BY LAW, I RELEASE AND DISCHARGE THE ORGANIZATION, ITS DIRECTORS, OFFICERS, SPIRITUAL LEADERS (INCLUDING DR. HARI KRISHNA), TEACHERS, VOLUNTEERS AND VENUE HOSTS FROM ANY CLAIM FOR INJURY, PROPERTY DAMAGE OR LOSS ARISING FROM ATTENDANCE, INCLUDING CLAIMS ARISING FROM THEIR OWN ORDINARY NEGLIGENCE.',
                'This release does not cover gross negligence or intentional misconduct.',
            ]],
            ['key' => 'minors', 'title' => 'Children under 18', 'paragraphs' => [
                'I am the parent or legal guardian. I give permission for my child to attend. I or another adult I name stays at the venue for the whole event and is responsible for my child.',
                'Only the adults I name may pick my child up.',
            ]],
            ['key' => 'emergency', 'title' => 'Emergency care', 'paragraphs' => [
                'If I cannot be reached in an emergency, I allow the Organization to call emergency services and to arrange first aid or emergency medical treatment. I am responsible for any cost of that care.',
                'I have listed any allergies or medical needs the team should know.',
            ]],
            ['key' => 'media', 'title' => 'Photos and video', 'paragraphs' => [
                'Photos or video may be taken for our website, social media and records, only of people who say yes below. We never show a child\'s full name with a photo. You can change your answer at any time; it applies to future use.',
                'If you say no, please tell the check-in desk so the photographer knows.',
            ]],
            ['key' => 'signature', 'title' => 'Electronic signature and general terms', 'paragraphs' => [
                'I agree to sign electronically. My typed full name is my signature. A copy is emailed to me.',
                "The laws of the State of {$state} apply. If any part is found invalid, the rest still applies.",
            ]],
        ];
    }

    public static function document(): array
    {
        return ['version' => self::VERSION, 'title' => 'Kids Meditation Circle: Parent Consent, Health Notice and Release', 'sections' => self::sections()];
    }

    public static function hash(array $document): string
    {
        return hash('sha256', json_encode($document, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    }

    /** Section keys the parent must tick (every section). */
    public static function keys(): array
    {
        return array_column(self::sections(), 'key');
    }
}
