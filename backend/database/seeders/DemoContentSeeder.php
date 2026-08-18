<?php

namespace Database\Seeders;

use App\Models\Content\ContactChannel;
use App\Models\People\ContactSubmission;
use App\Models\Content\DonationMethod;
use App\Models\People\Member;
use App\Models\People\MemberJourney;
use App\Models\Content\MusicTrack;
use App\Models\Content\Testimonial;
use App\Models\Content\VolunteerCategory;
use App\Models\Auth\User;
use Illuminate\Database\Seeder;

/** Non-production only — sample rows so a fresh local/staging install looks populated. */
class DemoContentSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'staging'])) {
            return;
        }

        $this->contactChannels();
        $this->donationMethods();
        $this->musicTracks();
        $this->testimonials();
        $this->volunteerCategories();
        $this->queriesAndMembers();
    }

    private function contactChannels(): void
    {
        $channels = [
            ['type' => 'phone', 'label' => 'Call us', 'value' => '+1 555 0100', 'order' => 1],
            ['type' => 'whatsapp', 'label' => 'WhatsApp support', 'value' => '+1 555 0100', 'order' => 2],
            ['type' => 'email', 'label' => 'General inquiries', 'value' => 'admin@goldenagewisdom.org', 'order' => 3],
            ['type' => 'address', 'label' => 'Studio', 'value' => '108 Serenity Lane, Rishikesh, India', 'order' => 4],
            ['type' => 'social', 'label' => 'Instagram', 'value' => 'https://instagram.com/goldenagewisdom', 'order' => 5],
        ];

        foreach ($channels as $c) {
            ContactChannel::updateOrCreate(
                ['type' => $c['type'], 'label' => $c['label']],
                ['value' => $c['value'], 'sort_order' => $c['order'], 'is_visible' => true],
            );
        }
    }

    private function donationMethods(): void
    {
        DonationMethod::updateOrCreate(
            ['label' => 'Bank Transfer — India'],
            [
                'account_holder' => 'Golden Age Wisdom Trust', 'bank_name' => 'State Bank of India',
                'account_number' => '1234567890123', 'ifsc' => 'SBIN0001234', 'branch' => 'Rishikesh Main',
                'swift' => 'SBININBB104', 'upi_id' => 'goldenagewisdom@sbi',
                'notes' => 'Preferred for domestic donors.', 'is_active' => true, 'sort_order' => 1,
            ],
        );

        DonationMethod::updateOrCreate(
            ['label' => 'International — PayPal'],
            [
                'account_holder' => 'Golden Age Wisdom', 'payout_link' => 'https://paypal.me/goldenagewisdom',
                'notes' => 'For donors outside India.', 'is_active' => true, 'sort_order' => 2,
            ],
        );
    }

    private function musicTracks(): void
    {
        $tracks = [
            ['title' => 'Om Chanting — 108 Repetitions', 'artist' => 'Dr. Hari Krishna', 'category' => 'chanting', 'status' => 'published'],
            ['title' => 'Twenty Minute Body Scan', 'artist' => 'Ravi Kumar', 'category' => 'meditation', 'status' => 'published'],
            ['title' => 'Himalayan Stream (Ambient)', 'artist' => 'Field recording', 'category' => 'nature', 'status' => 'draft'],
        ];

        foreach ($tracks as $i => $t) {
            MusicTrack::updateOrCreate(
                ['title' => $t['title']],
                [
                    'artist' => $t['artist'], 'category' => $t['category'], 'status' => $t['status'],
                    'file_path' => '', 'duration_seconds' => 0, 'sort_order' => $i + 1,
                ],
            );
        }
    }

    private function testimonials(): void
    {
        $testimonials = [
            ['name' => 'Sofia Mendes', 'role' => 'Practitioner, 2 years', 'quote' => 'The daily meditation circle changed how I start my mornings.', 'rating' => 5, 'featured' => true],
            ['name' => 'Daniel Osei', 'role' => 'Kundalini student', 'quote' => 'Having someone to check in with made all the difference.', 'rating' => 5, 'featured' => true],
            ['name' => 'Priya Nair', 'role' => 'Wellness member', 'quote' => 'Breathwork homework fixed my sleep within two nights.', 'rating' => 4, 'featured' => false],
        ];

        foreach ($testimonials as $i => $t) {
            Testimonial::updateOrCreate(
                ['name' => $t['name']],
                [
                    'role' => $t['role'], 'quote' => $t['quote'], 'rating' => $t['rating'],
                    'status' => 'published', 'is_featured' => $t['featured'], 'sort_order' => $i + 1,
                ],
            );
        }
    }

    private function volunteerCategories(): void
    {
        $categories = ['Event Support', 'Teaching & Content', 'Community Outreach', 'Technical & IT'];

        foreach ($categories as $i => $name) {
            VolunteerCategory::updateOrCreate(
                ['name' => $name],
                ['is_active' => true, 'sort_order' => $i + 1],
            );
        }
    }

    private function queriesAndMembers(): void
    {
        $practitioner = User::whereHas('roles', fn ($q) => $q->where('name', 'practitioner'))->first();

        ContactSubmission::updateOrCreate(
            ['email' => 'sofia.m@example.com'],
            [
                'name' => 'Sofia Mendes', 'phone' => '+1 555 0118', 'category' => 'meditation',
                'message' => "I'd love guidance on starting a daily meditation habit.",
                'status' => 'new',
            ],
        );

        if ($practitioner && ! Member::where('email', 'daniel.o@example.com')->exists()) {
            $member = Member::create([
                'name' => 'Daniel Osei', 'email' => 'daniel.o@example.com', 'phone' => '+1 555 0142',
                'category' => 'kundalini', 'assigned_practitioner_id' => $practitioner->id,
                'status' => 'in_progress', 'join_date' => now()->subDays(3)->toDateString(),
                'last_contact_date' => now()->toDateString(),
                'summary' => 'Strong energy sensations after group sessions — mostly normal activation symptoms.',
            ]);

            MemberJourney::create(['member_id' => $member->id, 'entry_type' => 'status_change', 'content' => 'Converted from query to member.']);
            MemberJourney::create([
                'member_id' => $member->id, 'added_by' => $practitioner->id, 'entry_type' => 'qa',
                'question' => 'Is it normal to feel dizzy and warm during the group meditation?',
                'answer' => "Yes — that's typically energy moving through the crown and third-eye centers during activation.",
            ]);
        }
    }
}
