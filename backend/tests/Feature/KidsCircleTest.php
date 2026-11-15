<?php

namespace Tests\Feature;

use App\Mail\KidsRegistrationMail;
use App\Models\Auth\Role;
use App\Models\Auth\User;
use App\Models\Kids\Kid;
use App\Models\Kids\KidConsent;
use App\Models\Kids\KidRegistration;
use App\Models\People\Member;
use App\Services\Kids\KidsConsent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class KidsCircleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['kids.zoom_passcode' => 'Secret-77', 'kids.zoom_id' => '858 3986 9813']);
        Mail::fake();
    }

    private function parent(string $email = 'priya@example.com'): Member
    {
        return Member::create(['name' => 'Priya Rao', 'email' => $email, 'password' => 'secret-pass', 'category' => 'meditation', 'join_date' => now()]);
    }

    private function payload(array $over = []): array
    {
        return array_merge([
            'guardian_name' => 'Priya Rao',
            'relationship' => 'Mother',
            'email' => 'priya@example.com',
            'phone' => '(512) 555-0101',
            'emergency_name' => 'Ravi Rao',
            'emergency_phone' => '512-555-0102',
            'city' => 'Austin',
            'state' => 'TX',
            'heard_about' => 'YouTube',
            'children' => [
                ['first_name' => 'Aarav', 'last_name' => 'Rao', 'age' => 8, 'group' => 'elementary', 'experience' => 'Not yet', 'media_consent' => 'no', 'notes' => 'Shy at first'],
                ['first_name' => 'Diya', 'last_name' => 'Rao', 'age' => 13, 'group' => 'teens', 'experience' => 'A little', 'media_consent' => 'yes'],
            ],
            'agreed' => KidsConsent::keys(),
            'esign' => true,
            'signature_name' => 'priya  rao',
            'consent_version' => KidsConsent::VERSION,
        ], $over);
    }

    private function admin(): User
    {
        $role = Role::create(['name' => Role::SUPER_ADMIN, 'display_name' => 'Super admin']);
        $admin = User::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => 'secret-pass']);
        $admin->roles()->attach($role);

        return $admin;
    }

    public function test_public_program_info_never_shows_zoom_details(): void
    {
        $res = $this->getJson('/api/v1/kids/program')->assertOk();
        $res->assertJsonPath('consent.version', KidsConsent::VERSION);
        $this->assertCount(2, $res->json('groups'));
        $this->assertSame(['ET', 'CT', 'MT', 'PT'], array_column($res->json('groups.0.zones'), 'zone'));
        $this->assertStringNotContainsString('Secret-77', $res->getContent());
        $this->assertStringNotContainsString('858 3986', $res->getContent());
    }

    public function test_registering_needs_google_sign_in(): void
    {
        $this->postJson('/api/v1/member/kids', $this->payload())->assertUnauthorized();
    }

    public function test_a_parent_registers_two_children_and_signs_the_consent(): void
    {
        $parent = $this->parent();
        $token = $parent->createToken('member')->plainTextToken;

        $res = $this->withToken($token)->postJson('/api/v1/member/kids', $this->payload())->assertCreated();
        $res->assertJsonPath('join.zoom_passcode', 'Secret-77')->assertJsonPath('needs_resign', false);
        $this->assertCount(2, $res->json('kids'));

        $consent = KidConsent::first();
        $this->assertSame(KidsConsent::VERSION, $consent->version);
        $this->assertSame(KidsConsent::hash($consent->snapshot), $consent->text_hash);
        $this->assertSame('priya  rao', $consent->signature_name);
        $this->assertSame('no', $consent->children[0]['photos']);
        $this->assertNotNull($consent->ip);
        // Notes are stored encrypted.
        $this->assertStringNotContainsString('Shy at first', (string) \DB::table('kids')->where('first_name', 'Aarav')->value('notes'));
        $this->assertSame('Shy at first', Kid::where('first_name', 'Aarav')->first()->notes);
        // Phone saved on the member when missing.
        $this->assertSame('(512) 555-0101', $parent->fresh()->phone);
        Mail::assertSent(KidsRegistrationMail::class, function ($m) {
            $html = $m->render();

            return $m->hasTo('priya@example.com') && str_contains($html, 'Secret-77') && str_contains($html, 'Aarav Rao')
                && str_contains($html, 'Signed electronically by <strong>priya  rao</strong>') && str_contains($html, 'ORDINARY NEGLIGENCE');
        });
    }

    public function test_every_section_signature_and_current_version_are_required(): void
    {
        $token = $this->parent()->createToken('member')->plainTextToken;

        $this->withToken($token)->postJson('/api/v1/member/kids', $this->payload(['agreed' => ['program', 'health']]))->assertStatus(422)->assertJsonValidationErrors('agreed');
        $this->withToken($token)->postJson('/api/v1/member/kids', $this->payload(['signature_name' => 'Someone Else']))->assertStatus(422)->assertJsonValidationErrors('signature_name');
        $this->withToken($token)->postJson('/api/v1/member/kids', $this->payload(['esign' => false]))->assertStatus(422)->assertJsonValidationErrors('esign');
        $this->withToken($token)->postJson('/api/v1/member/kids', $this->payload(['consent_version' => 0]))->assertStatus(422)->assertJsonValidationErrors('consent_version');
        $this->withToken($token)->postJson('/api/v1/member/kids', $this->payload(['children' => [['first_name' => 'A', 'last_name' => 'B', 'age' => 19, 'group' => 'teens', 'experience' => 'Not yet', 'media_consent' => 'no']]]))
            ->assertStatus(422)->assertJsonValidationErrors('children.0.age');
        $this->assertSame(0, KidRegistration::count());
    }

    public function test_updating_keeps_every_signed_copy_and_withdraws_removed_children(): void
    {
        $token = $this->parent()->createToken('member')->plainTextToken;
        $first = $this->withToken($token)->postJson('/api/v1/member/kids', $this->payload())->json();

        $aarav = collect($first['kids'])->firstWhere('first_name', 'Aarav');
        $update = $this->payload(['children' => [['id' => $aarav['id'], 'first_name' => 'Aarav', 'last_name' => 'Rao', 'age' => 9, 'group' => 'elementary', 'experience' => 'A little', 'media_consent' => 'yes']]]);
        $res = $this->withToken($token)->postJson('/api/v1/member/kids', $update)->assertCreated();

        $this->assertSame(2, KidConsent::count());
        $this->assertCount(2, $res->json('consents'));
        $this->assertSame('withdrawn', Kid::where('first_name', 'Diya')->value('status'));
        $this->assertSame(9, Kid::where('first_name', 'Aarav')->value('age'));
        $this->assertSame(1, KidRegistration::count());
    }

    public function test_photo_choice_and_withdraw_only_touch_the_parents_own_children(): void
    {
        $token = $this->parent()->createToken('member')->plainTextToken;
        $kids = $this->withToken($token)->postJson('/api/v1/member/kids', $this->payload())->json('kids');
        $other = $this->parent('other@example.com')->createToken('member')->plainTextToken;

        $this->app['auth']->forgetGuards();
        $this->withToken($other)->putJson("/api/v1/member/kids/{$kids[0]['id']}/media", ['media_consent' => 'yes'])->assertNotFound();
        $this->app['auth']->forgetGuards();
        $this->withToken($token)->putJson("/api/v1/member/kids/{$kids[0]['id']}/media", ['media_consent' => 'yes'])->assertOk();
        $this->assertSame('yes', Kid::find($kids[0]['id'])->media_consent);

        $this->withToken($token)->postJson("/api/v1/member/kids/{$kids[0]['id']}/withdraw")->assertOk();
        $res = $this->withToken($token)->postJson("/api/v1/member/kids/{$kids[1]['id']}/withdraw")->assertOk();
        $res->assertJsonPath('registration.status', 'withdrawn')->assertJsonPath('join', null);

        $consentId = KidConsent::first()->id;
        $this->app['auth']->forgetGuards();
        $this->withToken($other)->getJson("/api/v1/member/kids/consents/{$consentId}")->assertNotFound();
        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson("/api/v1/member/kids/consents/{$consentId}")->assertOk()->assertJsonPath('snapshot.version', KidsConsent::VERSION);
    }

    public function test_admin_sees_analytics_roster_attendance_and_export(): void
    {
        $token = $this->parent()->createToken('member')->plainTextToken;
        $kids = $this->withToken($token)->postJson('/api/v1/member/kids', $this->payload())->json('kids');
        $this->app['auth']->forgetGuards();

        Sanctum::actingAs($this->admin(), [], 'sanctum');
        $this->postJson('/api/v1/admin/kids/attendance', ['kid_id' => $kids[0]['id'], 'date' => '2026-11-14', 'present' => true])->assertOk();
        $this->postJson('/api/v1/admin/kids/attendance', ['kid_id' => $kids[0]['id'], 'date' => '2026-11-14', 'present' => true])->assertOk(); // idempotent

        $a = $this->getJson('/api/v1/admin/kids/analytics')->assertOk();
        $a->assertJsonPath('totals.children', 2)->assertJsonPath('totals.families', 1)->assertJsonPath('totals.sibling_families', 1)
            ->assertJsonPath('totals.photo_opt_out', 1)->assertJsonPath('totals.sessions_held', 1)->assertJsonPath('totals.never_attended', 1);
        $this->assertSame('TX', $a->json('by_state.0.option'));

        $roster = $this->getJson('/api/v1/admin/kids/roster?group=elementary&date=2026-11-14')->assertOk();
        $roster->assertJsonPath('kids.0.name', 'Aarav R.')->assertJsonPath('kids.0.present', true)->assertJsonPath('kids.0.photos', 'no');

        $this->getJson('/api/v1/admin/kids?q=priya')->assertOk()->assertJsonCount(2);
        $csv = $this->get('/api/v1/admin/kids/export')->assertOk()->getContent();
        $this->assertStringContainsString('"Aarav Rao","8","Elementary kids"', $csv);

        $reg = KidRegistration::first();
        $this->getJson("/api/v1/admin/kids/families/{$reg->id}")->assertOk()->assertJsonPath('kids.0.notes', 'Shy at first');

        $this->postJson('/api/v1/admin/kids/attendance', ['kid_id' => $kids[0]['id'], 'date' => '2026-11-14', 'present' => false])->assertOk();
        $this->getJson('/api/v1/admin/kids/roster?group=elementary&date=2026-11-14')->assertJsonPath('kids.0.present', false);
    }

    public function test_a_wording_change_asks_the_parent_to_sign_again(): void
    {
        $token = $this->parent()->createToken('member')->plainTextToken;
        $this->withToken($token)->postJson('/api/v1/member/kids', $this->payload())->assertCreated();
        KidConsent::query()->update(['version' => KidsConsent::VERSION - 1]);

        $this->withToken($token)->getJson('/api/v1/member/kids')->assertOk()
            ->assertJsonPath('needs_resign', true)->assertJsonPath('join', null);
    }
}
