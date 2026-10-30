<?php

namespace Tests\Feature;

use App\Models\Auth\Role;
use App\Models\Auth\User;
use App\Models\Cms\Event;
use App\Models\Engage\RegistrationForm;
use App\Models\People\Member;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MembersOnlyFormTest extends TestCase
{
    use RefreshDatabase;

    private function survey(bool $membersOnly = true): RegistrationForm
    {
        $form = RegistrationForm::create(['title' => 'Vasavi Brindavanam meditation survey', 'slug' => 'vasavi-survey', 'status' => 'published', 'members_only' => $membersOnly]);
        $form->fields()->create(['label' => 'How long have you meditated?', 'field_key' => 'how_long', 'type' => 'select', 'is_required' => true, 'options' => ['New', 'Under 1 year', '1+ years'], 'sort_order' => 0]);

        return $form;
    }

    public function test_a_members_only_survey_needs_google_sign_in_and_keeps_one_answer_per_member(): void
    {
        $this->survey();
        $this->getJson('/api/v1/registration-forms/vasavi-survey')->assertOk()->assertJsonPath('members_only', true);
        $this->postJson('/api/v1/registration-forms/vasavi-survey/submit', ['how_long' => 'New'])
            ->assertUnauthorized()->assertJsonPath('sign_in_required', true);

        $member = Member::create(['name' => 'Lakshmi', 'email' => 'lakshmi@example.com', 'password' => 'secret-pass', 'category' => 'meditation', 'join_date' => now()]);
        $token = $member->createToken('member')->plainTextToken;
        $this->withToken($token)->postJson('/api/v1/registration-forms/vasavi-survey/submit', ['how_long' => 'New'])->assertCreated();
        $this->withToken($token)->postJson('/api/v1/registration-forms/vasavi-survey/submit', ['how_long' => 'Under 1 year'])
            ->assertOk()->assertJsonPath('updated', true);

        $form = RegistrationForm::where('slug', 'vasavi-survey')->first();
        $this->assertSame(1, $form->submissions()->count());
        $this->assertSame('Under 1 year', $form->submissions()->first()->data['how_long']);
        $this->assertSame($member->id, $form->submissions()->first()->member_id);

        // The admin's export names the member.
        $role = Role::create(['name' => Role::SUPER_ADMIN, 'display_name' => 'Super admin']);
        $admin = User::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => 'secret-pass']);
        $admin->roles()->attach($role);
        Sanctum::actingAs($admin, [], 'sanctum');
        $csv = $this->get("/api/v1/admin/registration-forms/{$form->id}/submissions/export")->assertOk()->getContent();
        $this->assertStringContainsString('"Member ID","Member name","Member email","How long have you meditated?"', $csv);
        $this->assertStringContainsString('"Lakshmi","lakshmi@example.com","Under 1 year"', $csv);
    }

    public function test_open_forms_still_need_no_sign_in(): void
    {
        $this->survey(false);
        $this->postJson('/api/v1/registration-forms/vasavi-survey/submit', ['how_long' => 'New'])->assertCreated();
    }

    public function test_a_gathering_carries_its_photos_album_and_survey_button(): void
    {
        Event::create([
            'title' => 'Vasavi Brindavanam gathering', 'starts_at' => now()->subDays(2), 'ends_at' => now()->subDays(2)->addHours(3),
            'location' => 'Vasavi Brindavanam, Hyderabad', 'is_published' => true,
            'photos' => ['https://goldenagewisdom.org/storage/media/v1.jpg'], 'photos_url' => 'https://drive.google.com/drive/folders/abc',
            'cta_label' => 'Fill the survey', 'cta_url' => '/register/vasavi-survey',
        ]);

        $this->getJson('/api/v1/events')->assertOk()
            ->assertJsonPath('0.is_past', true)
            ->assertJsonPath('0.photos.0', 'https://goldenagewisdom.org/storage/media/v1.jpg')
            ->assertJsonPath('0.photos_url', 'https://drive.google.com/drive/folders/abc')
            ->assertJsonPath('0.cta_label', 'Fill the survey')
            ->assertJsonPath('0.cta_url', '/register/vasavi-survey');
    }

    public function test_tick_all_that_apply_questions_keep_every_choice_and_the_other_box(): void
    {
        $form = $this->survey(false);
        $form->fields()->create(['label' => 'I am meditating for the following reasons', 'field_key' => 'reasons', 'type' => 'checkboxes', 'is_required' => true,
            'options' => ['Health benefits', 'Peace', 'World peace', 'Any other'], 'sort_order' => 1]);

        $this->postJson('/api/v1/registration-forms/vasavi-survey/submit', ['how_long' => 'New', 'reasons' => []])
            ->assertUnprocessable()->assertJsonValidationErrors('reasons');
        $this->postJson('/api/v1/registration-forms/vasavi-survey/submit', ['how_long' => 'New', 'reasons' => ['Peace', 'Made up']])
            ->assertUnprocessable()->assertJsonValidationErrors('reasons.1');

        $this->postJson('/api/v1/registration-forms/vasavi-survey/submit', ['how_long' => 'New', 'reasons' => ['Peace', 'World peace', 'Any other'], 'reasons_other' => 'Better sleep'])
            ->assertCreated();
        $this->assertSame(['Peace', 'World peace', 'Any other: Better sleep'], $form->submissions()->first()->data['reasons']);
    }

    public function test_the_vasavi_survey_command_loads_the_teams_questions_only_while_unanswered(): void
    {
        $form = $this->survey(false);
        $this->artisan('forms:vasavi-survey')->expectsOutputToContain('20 questions loaded')->assertSuccessful();

        $form->refresh();
        $this->assertTrue($form->members_only);
        $this->assertSame('published', $form->status);
        $this->assertSame(20, $form->fields()->count());
        $this->assertSame('I am meditating', $form->fields()->first()->label);
        $this->assertSame('checkboxes', $form->fields()->where('label', 'I am meditating for the following reasons')->value('type'));

        $form->submissions()->create(['data' => ['q01' => 'Yes']]);
        $this->artisan('forms:vasavi-survey')->assertFailed();
        $this->assertSame(20, $form->fields()->count());
    }
}
