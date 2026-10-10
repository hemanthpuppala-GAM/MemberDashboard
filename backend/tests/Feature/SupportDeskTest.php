<?php

namespace Tests\Feature;

use App\Models\People\Member;
use App\Models\Support\SupportAgent;
use App\Models\Support\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SupportDeskTest extends TestCase
{
    use RefreshDatabase;

    private function core(string $phone = '+91 73961 12111', string $pin = '246810'): SupportAgent
    {
        $a = new SupportAgent(['kind' => 'core', 'name' => 'Lakshmi', 'phone' => SupportAgent::normalizePhone($phone)]);
        $a->setPin($pin);
        $a->save();

        return $a->refresh();
    }

    private function member(string $email = 'asha@example.com'): Member
    {
        return Member::create(['name' => 'Asha Rao', 'email' => $email, 'password' => 'secret-pass', 'category' => 'meditation', 'join_date' => now()]);
    }

    public function test_core_support_logs_in_with_phone_and_pin(): void
    {
        $this->core();

        $this->postJson('/api/v1/support/login', ['phone' => '7396112111', 'pin' => '000000'])->assertUnprocessable();
        $token = $this->postJson('/api/v1/support/login', ['phone' => '07396 112-111', 'pin' => '246810'])
            ->assertOk()->assertJsonPath('agent.kind', 'core')->json('token');

        $this->withToken($token)->getJson('/api/v1/support/me')->assertOk()->assertJsonPath('agent.name', 'Lakshmi');
    }

    public function test_volunteer_member_gets_in_but_ordinary_member_does_not(): void
    {
        $vol = $this->member('seva@example.com');
        $other = $this->member('other@example.com');
        SupportAgent::create(['kind' => 'volunteer', 'name' => 'Seva', 'email' => 'seva@example.com']);
        Sanctum::actingAs($vol, [], 'sanctum');
        $this->getJson('/api/v1/support/dashboard')->assertOk()->assertJsonPath('me.kind', 'volunteer');

        Sanctum::actingAs($other, [], 'sanctum');
        $this->getJson('/api/v1/support/dashboard')->assertForbidden();
    }

    public function test_questions_and_volunteer_signups_become_tickets(): void
    {
        Mail::fake();
        $this->postJson('/api/v1/contact', ['category' => 'general', 'message' => 'How long should I sit each day?', 'source' => 'qr_web', 'lang' => 'te'])->assertCreated();

        $t = Ticket::sole();
        $this->assertSame('ask_web', $t->source);
        $this->assertSame('open', $t->status);
        $this->assertSame('te', $t->lang);
        $this->assertStringContainsString('How long should I sit', $t->subject);

        $this->postJson('/api/v1/volunteer-applications', ['name' => 'Ravi', 'email' => 'ravi@example.com', 'phone' => '+91 98765 43210', 'teams' => ['tech'], 'availability' => 'Events only'])->assertCreated();
        $v = Ticket::where('source', 'volunteer')->sole();
        $this->assertSame('Volunteer sign-up: Ravi', $v->subject);
        $this->assertStringContainsString('Teams: tech', $v->body);
    }

    public function test_full_ticket_lifecycle_with_member_follow_up_and_rating(): void
    {
        Mail::fake();
        $member = $this->member();
        $agent = $this->core();
        $ticket = Ticket::create(['source' => 'member_portal', 'member_id' => $member->id, 'requester_email' => 'asha@example.com', 'subject' => 'Knees hurt', 'body' => 'My knees hurt when I sit.']);

        Sanctum::actingAs($agent, [], 'sanctum');
        $this->getJson('/api/v1/support/tickets?scope=unassigned')->assertOk()->assertJsonPath('meta.total', 1);
        $this->postJson("/api/v1/support/tickets/{$ticket->id}/comments", ['body' => 'Internal: check with Dr.', 'internal' => true])->assertCreated();
        $this->postJson("/api/v1/support/tickets/{$ticket->id}/comments", ['body' => 'Sit on a cushion, knees lower than hips.'])->assertCreated();
        $ticket->refresh();
        $this->assertSame('waiting', $ticket->status);
        $this->assertNotNull($ticket->first_response_at);
        $this->assertSame($agent->id, $ticket->assigned_agent_id);
        Mail::assertSent(\App\Mail\TicketUpdatedMail::class, 1);

        // Member sees the public reply only, answers back -> back in progress.
        Sanctum::actingAs($member, [], 'sanctum');
        $thread = $this->getJson("/api/v1/member/tickets/{$ticket->id}")->assertOk()->json('comments');
        $this->assertCount(1, $thread);
        $this->assertSame('Golden Age Wisdom support', $thread[0]['author_name']);
        $this->postJson("/api/v1/member/tickets/{$ticket->id}/rating", ['rating' => 5])->assertUnprocessable();
        $this->postJson("/api/v1/member/tickets/{$ticket->id}/comments", ['body' => 'Thank you, that helps'])->assertCreated();
        $this->assertSame('in_progress', $ticket->fresh()->status);

        // Resolve, then member rates.
        Sanctum::actingAs($agent, [], 'sanctum');
        $this->patchJson("/api/v1/support/tickets/{$ticket->id}", ['status' => 'resolved'])->assertOk()->assertJsonPath('status', 'resolved');
        Sanctum::actingAs($member, [], 'sanctum');
        $this->postJson("/api/v1/member/tickets/{$ticket->id}/rating", ['rating' => 5, 'comment' => 'Very kind'])->assertOk();

        Sanctum::actingAs($agent, [], 'sanctum');
        $dash = $this->getJson('/api/v1/support/dashboard')->assertOk();
        $dash->assertJsonPath('stats.resolved', 1)->assertJsonPath('stats.ratings', 1);
        $this->assertSame(1, collect($dash->json('team'))->firstWhere('id', $agent->id)['resolved_total']);
    }

    public function test_members_only_see_their_own_tickets(): void
    {
        $mine = $this->member();
        $other = $this->member('b@example.com');
        $t = Ticket::create(['source' => 'ask_web', 'member_id' => $other->id, 'subject' => 'x']);
        Sanctum::actingAs($mine, [], 'sanctum');
        $this->getJson('/api/v1/member/tickets')->assertOk()->assertJsonCount(0);
        $this->getJson("/api/v1/member/tickets/{$t->id}")->assertNotFound();
    }

    public function test_first_line_can_log_a_call(): void
    {
        $agent = $this->core();
        Sanctum::actingAs($agent, [], 'sanctum');
        $this->postJson('/api/v1/support/tickets', ['source' => 'call', 'requester_name' => 'Ravi', 'requester_phone' => '9876543210', 'body' => 'Asked about the Sunday session timing.'])
            ->assertCreated()->assertJsonPath('status', 'in_progress')->assertJsonPath('assignee.id', $agent->id);
    }

    public function test_inactive_agent_is_locked_out(): void
    {
        $agent = $this->core();
        $agent->update(['is_active' => false]);
        $this->postJson('/api/v1/support/login', ['phone' => '7396112111', 'pin' => '246810'])->assertUnprocessable();
    }
}
