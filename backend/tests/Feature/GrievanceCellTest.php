<?php

namespace Tests\Feature;

use App\Mail\GrievanceAlertMail;
use App\Mail\GrievanceReplyMail;
use App\Models\Auth\Role;
use App\Models\Auth\User;
use App\Models\People\Member;
use App\Models\Support\Grievance;
use App\Models\Support\SupportAgent;
use App\Models\Support\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GrievanceCellTest extends TestCase
{
    use RefreshDatabase;

    private SupportAgent $chief;

    private SupportAgent $team;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        $this->chief = $this->agent('Chief Ravi', '9000000001', 'chief@example.com', true);
        $this->team = $this->agent('Lakshmi', '9000000002', 'lakshmi@example.com');
    }

    private function agent(string $name, string $phone, string $email, bool $chief = false): SupportAgent
    {
        $a = new SupportAgent(['kind' => 'core', 'name' => $name, 'phone' => SupportAgent::normalizePhone($phone), 'email' => $email, 'is_active' => true, 'is_grievance_chief' => $chief]);
        $a->setPin('246810');
        $a->save();

        return $a->refresh();
    }

    private function as(SupportAgent $a): self
    {
        $this->app['auth']->forgetGuards();

        return $this->withToken($a->createToken('support')->plainTextToken);
    }

    private function file(array $over = []): int
    {
        $this->postJson('/api/v1/grievances', array_merge([
            'about' => 'A teacher, volunteer or team member',
            'message' => 'The volunteer at Saturday satsang spoke rudely to my mother.',
            'name' => 'Meera Iyer',
            'email' => 'meera@example.com',
            'phone' => '9876543210',
        ], $over))->assertCreated()->assertJsonStructure(['ref']);

        return Ticket::latest('id')->value('id');
    }

    public function test_a_grievance_is_stored_encrypted_and_masked_on_the_ticket(): void
    {
        $id = $this->file();

        $row = DB::table('tickets')->find($id);
        $this->assertTrue((bool) $row->confidential);
        $this->assertSame('grievance', $row->source);
        $this->assertSame(Ticket::MASKED_SUBJECT, $row->subject);
        $this->assertNull($row->requester_name);
        $this->assertNull($row->requester_email);
        $this->assertNull($row->member_id);
        $this->assertSame($this->chief->id, $row->assigned_agent_id);

        $g = DB::table('grievances')->where('ticket_id', $id)->first();
        foreach (['Meera', 'meera@example.com', '9876543210', 'rudely'] as $plain) {
            $this->assertStringNotContainsString($plain, json_encode($g));
        }
        $this->assertSame('Meera Iyer', Grievance::where('ticket_id', $id)->first()->name);

        // The chief is told, without the sender or the message in the email.
        Mail::assertSent(GrievanceAlertMail::class, function ($m) {
            $html = $m->render();

            return $m->hasTo('chief@example.com') && ! str_contains($html, 'Meera') && ! str_contains($html, 'rudely');
        });
    }

    public function test_the_team_sees_only_a_masked_grievance_and_can_nudge_the_chief(): void
    {
        $id = $this->file();

        // Kept out of the normal support queues; only under the Grievances tab.
        $this->as($this->team)->getJson('/api/v1/support/tickets?scope=open')->assertOk()->assertJsonCount(0, 'data');
        $this->as($this->team)->getJson('/api/v1/support/tickets?scope=all')->assertOk()->assertJsonCount(0, 'data');
        $list = $this->as($this->team)->getJson('/api/v1/support/tickets?scope=grievances')->assertOk();
        $this->assertStringNotContainsString('Meera', $list->getContent());
        $list->assertJsonPath('data.0.confidential', true)->assertJsonPath('data.0.requester.name', 'Anonymous');

        $show = $this->as($this->team)->getJson("/api/v1/support/tickets/{$id}")->assertOk();
        $show->assertJsonPath('can_read', false)->assertJsonPath('subject', Ticket::MASKED_SUBJECT);
        $this->assertStringNotContainsString('rudely', $show->getContent());

        $this->as($this->team)->postJson("/api/v1/support/tickets/{$id}/comments", ['body' => 'hi'])->assertForbidden();
        $this->as($this->team)->patchJson("/api/v1/support/tickets/{$id}", ['status' => 'resolved'])->assertForbidden();

        $this->as($this->team)->postJson("/api/v1/support/tickets/{$id}/nudge")->assertOk()->assertJsonPath('nudged', true);
        $this->as($this->team)->postJson("/api/v1/support/tickets/{$id}/nudge")->assertOk()->assertJsonPath('nudged', false);
        Mail::assertSent(GrievanceAlertMail::class, fn ($m) => $m->kind === 'nudge' && $m->hasTo('chief@example.com'));

        // Bulk actions skip grievances.
        $this->as($this->team)->postJson('/api/v1/support/tickets/bulk-close', ['ids' => [$id]])->assertOk()->assertJsonPath('closed', 0);

        $stats = $this->as($this->team)->getJson('/api/v1/support/dashboard')->assertOk();
        $stats->assertJsonPath('stats.grievances_open', 1)->assertJsonPath('stats.grievance_chief', 'Chief Ravi')->assertJsonPath('stats.open', 0);
    }

    public function test_only_the_chief_reads_replies_and_resolves(): void
    {
        $id = $this->file();

        $show = $this->as($this->chief)->getJson("/api/v1/support/tickets/{$id}")->assertOk();
        $show->assertJsonPath('can_read', true)->assertJsonPath('requester.name', 'Meera Iyer')->assertJsonPath('requester.email', 'meera@example.com');
        $this->assertStringContainsString('rudely', $show->json('body'));

        $this->as($this->chief)->postJson("/api/v1/support/tickets/{$id}/comments", ['body' => 'Thank you, Meera. I will speak to them today.'])->assertCreated();
        Mail::assertSent(GrievanceReplyMail::class, fn ($m) => $m->hasTo('meera@example.com') && $m->hasReplyTo('chief@example.com'));

        // The reply is encrypted in the database and hidden from the team.
        $this->assertStringNotContainsString('speak to them', (string) DB::table('ticket_comments')->where('ticket_id', $id)->where('author_type', 'agent')->value('body'));
        $team = $this->as($this->team)->getJson("/api/v1/support/tickets/{$id}")->assertOk();
        $this->assertStringNotContainsString('speak to them', $team->getContent());

        $this->as($this->chief)->patchJson("/api/v1/support/tickets/{$id}", ['status' => 'resolved'])->assertOk()->assertJsonPath('status', 'resolved');
    }

    public function test_anonymous_grievance_and_a_signed_in_member_is_never_linked(): void
    {
        $id = $this->file(['name' => null, 'email' => null, 'phone' => null]);
        $this->as($this->chief)->getJson("/api/v1/support/tickets/{$id}")->assertJsonPath('requester.name', 'Anonymous');

        $member = Member::create(['name' => 'Asha Rao', 'email' => 'asha@example.com', 'password' => 'secret-pass', 'category' => 'meditation', 'join_date' => now()]);
        $this->app['auth']->forgetGuards();
        $this->withToken($member->createToken('m')->plainTextToken)->postJson('/api/v1/grievances', ['about' => 'Something else', 'message' => 'Please look into the late start of sessions.'])->assertCreated();
        $tid = Ticket::latest('id')->value('id');
        $this->assertNull(Ticket::find($tid)->member_id);
        $this->as($this->chief)->getJson("/api/v1/support/tickets/{$tid}")->assertJsonPath('requester.email', 'asha@example.com');
        // Not in the member's own "My questions".
        $this->app['auth']->forgetGuards();
        $this->withToken($member->createToken('m2')->plainTextToken)->getJson('/api/v1/member/tickets')->assertOk()->assertJsonMissing(['source' => 'grievance']);
    }

    public function test_one_chief_at_a_time_and_every_change_is_logged(): void
    {
        $role = Role::create(['name' => Role::SUPER_ADMIN, 'display_name' => 'Super admin']);
        $admin = User::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => 'secret-pass']);
        $admin->roles()->attach($role);
        Sanctum::actingAs($admin, [], 'sanctum');

        $this->putJson("/api/v1/admin/support-agents/{$this->team->id}", ['is_grievance_chief' => true])->assertOk();
        $this->assertTrue($this->team->fresh()->is_grievance_chief);
        $this->assertFalse($this->chief->fresh()->is_grievance_chief);
        $this->assertDatabaseHas('activity_logs', ['action' => 'named grievance chief', 'target_id' => $this->team->id]);

        $id = $this->file();
        $this->as($this->chief)->getJson("/api/v1/support/tickets/{$id}")->assertJsonPath('can_read', false);
        $this->as($this->team)->getJson("/api/v1/support/tickets/{$id}")->assertJsonPath('can_read', true);
    }

    public function test_form_rejects_bots_and_empty_messages(): void
    {
        $this->postJson('/api/v1/grievances', ['about' => 'Something else', 'message' => 'short'])->assertUnprocessable();
        $this->postJson('/api/v1/grievances', ['about' => 'Something else', 'message' => 'A long enough message here.', 'website' => 'spam'])->assertUnprocessable();
        $this->postJson('/api/v1/grievances', ['about' => 'Not a choice', 'message' => 'A long enough message here.'])->assertUnprocessable();
    }
}
