<?php

namespace Tests\Feature;

use App\Mail\TicketUpdatedMail;
use App\Models\People\Member;
use App\Models\People\VolunteerApplication;
use App\Models\Support\SupportAgent;
use App\Models\Support\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class VolunteerTicketBackfillTest extends TestCase
{
    use RefreshDatabase;

    private function quietSignUp(string $name, string $daysAgo, string $status = 'new'): VolunteerApplication
    {
        // As Data sync adds them: no "created" hook, so no ticket.
        $a = new VolunteerApplication(['name' => $name, 'email' => strtolower($name).'@example.com', 'phone' => '9876500000', 'city' => 'Pune', 'teams' => ['tech'], 'status' => $status]);
        $a->created_at = now()->subDays((int) $daysAgo);
        $a->saveQuietly();

        return $a;
    }

    public function test_recent_new_sign_ups_without_a_ticket_get_one_dated_when_they_signed_up(): void
    {
        $recent = $this->quietSignUp('Ravi', '5');
        $this->quietSignUp('Old', '40');
        $this->quietSignUp('Handled', '3', 'contacted');
        $this->postJson('/api/v1/volunteer-applications', ['name' => 'Fresh', 'email' => 'fresh@example.com', 'phone' => '9876511111', 'teams' => ['tech']]);
        $this->assertSame(1, Ticket::where('source', 'volunteer')->count()); // the form one, as before

        $this->artisan('support:volunteer-tickets')->expectsOutput('1 ticket created.')->assertSuccessful();
        $this->artisan('support:volunteer-tickets')->expectsOutput('0 tickets created.'); // never twice

        $ticket = Ticket::where('source', 'volunteer')->where('source_id', $recent->id)->sole();
        $this->assertSame('Volunteer sign-up: Ravi', $ticket->subject);
        $this->assertSame('open', $ticket->fresh()->status);
        $this->assertSame($recent->created_at->toDateString(), $ticket->created_at->toDateString());
        $this->assertSame(2, Ticket::where('source', 'volunteer')->count());
    }

    public function test_past_sign_ups_are_tagged_old_and_never_duplicated(): void
    {
        $old = $this->quietSignUp('Lata', '200');
        $recent = $this->quietSignUp('Ravi', '5');

        $this->artisan('support:volunteer-tickets', ['--days' => 3650])->expectsOutput('2 tickets created.');
        $this->artisan('support:volunteer-tickets', ['--days' => 3650])->expectsOutput('0 tickets created.');

        $t = Ticket::where('source_id', $old->id)->sole();
        $this->assertSame('volunteer_old', $t->source);
        $this->assertSame('Old volunteer sign-up: Lata', $t->subject);
        $this->assertSame('volunteer', Ticket::where('source_id', $recent->id)->value('source'));
        $this->assertSame($t->id, Ticket::fromVolunteerApplication($old)->id); // the form path finds it too
    }

    private function agent(string $kind): SupportAgent
    {
        $a = new SupportAgent(['kind' => $kind, 'name' => 'Lakshmi', 'phone' => SupportAgent::normalizePhone('+91 73961 12111')]);
        $a->setPin('246810');
        $a->save();

        return $a;
    }

    public function test_core_team_closes_old_sign_ups_in_bulk_without_emails_or_resolved_stats(): void
    {
        Mail::fake();
        foreach (['Asha', 'Bala', 'Chitra'] as $i => $n) {
            $this->quietSignUp($n, (string) (100 + $i));
        }
        $this->quietSignUp('Ravi', '2');
        Ticket::backfillVolunteerTickets(3650);
        $call = Ticket::create(['source' => 'call', 'subject' => 'Back pain', 'requester_name' => 'Caller']);

        $token = $this->agent('core')->createToken('desk')->plainTextToken;
        $this->withToken($token)->postJson('/api/v1/support/tickets/bulk-close', ['filter' => ['scope' => 'open', 'source' => 'volunteer_old']])
            ->assertOk()->assertJson(['closed' => 3]);
        $this->withToken($token)->postJson('/api/v1/support/tickets/bulk-close', ['ids' => [$call->id]])->assertJson(['closed' => 1]);

        $this->assertSame(3, Ticket::where('source', 'volunteer_old')->where('status', 'closed')->whereNull('resolved_at')->count());
        $this->assertSame('open', Ticket::where('source', 'volunteer')->value('status')); // the recent one stays
        $this->assertSame('closed', $call->fresh()->status);
        $this->assertStringContainsString('closed this in bulk', Ticket::where('source', 'volunteer_old')->first()->comments()->value('body'));
        Mail::assertNothingSent();
        $this->withToken($token)->getJson('/api/v1/support/dashboard')->assertOk()->assertJsonPath('stats.resolved_7d', 0);
    }

    public function test_volunteer_helpers_cannot_close_in_bulk(): void
    {
        $vol = Member::create(['name' => 'Seva', 'email' => 'seva@example.com', 'password' => 'secret-pass', 'category' => 'meditation', 'join_date' => now()]);
        SupportAgent::create(['kind' => 'volunteer', 'name' => 'Seva', 'email' => 'seva@example.com']);
        Sanctum::actingAs($vol, [], 'sanctum');

        $this->postJson('/api/v1/support/tickets/bulk-close', ['filter' => ['scope' => 'open']])->assertForbidden();
    }

    public function test_core_team_replies_to_many_tickets_each_emailed_to_its_own_person(): void
    {
        Mail::fake();
        $this->quietSignUp('Asha', '100');
        $this->quietSignUp('Bala', '120');
        Ticket::backfillVolunteerTickets(3650);
        $noEmail = Ticket::create(['source' => 'volunteer_old', 'subject' => 'Old volunteer sign-up: Phone only', 'requester_name' => 'Phone only', 'requester_phone' => '9000011111']);
        $other = Ticket::create(['source' => 'call', 'subject' => 'Back pain', 'requester_email' => 'caller@example.com']);

        $token = $this->agent('core')->createToken('desk')->plainTextToken;
        $this->withToken($token)->postJson('/api/v1/support/tickets/bulk-reply', [
            'filter' => ['scope' => 'open', 'source' => 'volunteer_old'],
            'body' => "Dear {name}, thank you for offering seva. Please join the volunteers' call on Sunday.",
        ])->assertOk()->assertJson(['replied' => 3, 'emailed' => 2, 'no_email' => 1]);

        Mail::assertQueued(TicketUpdatedMail::class, 2);
        Mail::assertQueued(TicketUpdatedMail::class, fn ($m) => $m->hasTo('asha@example.com') && $m->comment->body === "Dear Asha, thank you for offering seva. Please join the volunteers' call on Sunday."
            && str_contains($m->envelope()->subject, 'volunteer sign-up') && str_contains($m->render(), 'Open my volunteer sign-up'));
        Mail::assertNotQueued(TicketUpdatedMail::class, fn ($m) => $m->hasTo('caller@example.com'));

        $asha = Ticket::where('requester_email', 'asha@example.com')->first();
        $this->assertSame('waiting', $asha->status);
        $this->assertNotNull($asha->first_response_at);
        $this->assertSame(1, $noEmail->comments()->where('internal', false)->count()); // in the thread, for the member page
        $this->assertSame('open', $other->fresh()->status);

        // Reply and resolve the chosen ones.
        $this->withToken($token)->postJson('/api/v1/support/tickets/bulk-reply', ['ids' => [$asha->id], 'body' => 'Welcome aboard!', 'resolve' => true])
            ->assertJson(['replied' => 1, 'emailed' => 1]);
        $this->assertSame('resolved', $asha->fresh()->status);
    }

    public function test_volunteer_helpers_cannot_reply_in_bulk(): void
    {
        $vol = Member::create(['name' => 'Seva', 'email' => 'seva@example.com', 'password' => 'secret-pass', 'category' => 'meditation', 'join_date' => now()]);
        SupportAgent::create(['kind' => 'volunteer', 'name' => 'Seva', 'email' => 'seva@example.com']);
        Sanctum::actingAs($vol, [], 'sanctum');

        $this->postJson('/api/v1/support/tickets/bulk-reply', ['filter' => ['scope' => 'open'], 'body' => 'Hi'])->assertForbidden();
    }
}
