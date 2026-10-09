<?php

namespace Tests\Feature;

use App\Mail\AskReceivedMail;
use App\Models\People\ContactSubmission;
use App\Models\People\Member;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AskQuestionTest extends TestCase
{
    use RefreshDatabase;

    public function test_anonymous_qr_question_needs_no_contact_details(): void
    {
        Mail::fake();

        $this->postJson('/api/v1/contact', [
            'category' => 'general',
            'message' => 'How long should I sit?',
            'source' => 'qr_web',
            'lang' => 'te',
        ])->assertCreated()->assertJson(['source' => 'qr_web', 'ack_sent' => false]);

        $this->assertDatabaseHas('contact_submissions', ['source' => 'qr_web', 'name' => 'Visitor (QR / web)', 'member_id' => null]);
        Mail::assertNotSent(AskReceivedMail::class);
    }

    public function test_website_contact_form_still_requires_contact_details(): void
    {
        $this->postJson('/api/v1/contact', ['category' => 'general', 'message' => 'Hi'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'phone']);
    }

    public function test_member_question_is_linked_and_acknowledged_by_email(): void
    {
        Mail::fake();
        $member = Member::create(['name' => 'Asha Rao', 'email' => 'asha@example.com', 'password' => 'secret-pass', 'category' => 'meditation', 'join_date' => now()]);
        Sanctum::actingAs($member, [], 'sanctum');

        $this->postJson('/api/v1/contact', [
            'category' => 'meditation',
            'message' => '[Trouble sitting] My knees hurt.',
            'lang' => 'te',
        ])->assertCreated()->assertJson(['source' => 'member_portal', 'ack_sent' => true]);

        $submission = ContactSubmission::sole();
        $this->assertSame($member->id, $submission->member_id);
        $this->assertSame('asha@example.com', $submission->email);

        Mail::assertSent(AskReceivedMail::class, fn (AskReceivedMail $mail) => $mail->hasTo('asha@example.com')
            && $mail->hasCc('info@goldenagewisdom.org')
            && $mail->lang === 'te'
            && str_contains($mail->envelope()->subject, 'మీ ప్రశ్న అందింది'));
    }

    public function test_public_settings_expose_support_numbers(): void
    {
        config(['services.support.primary' => '+91 7396 112 111', 'services.support.web' => '917396119111']);

        $this->getJson('/api/v1/settings')
            ->assertOk()
            ->assertJson(['support.primary' => '917396112111', 'support.web' => '917396119111']);
    }
}
