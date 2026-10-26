<?php

namespace Tests\Feature;

use App\Models\People\VolunteerApplication;
use App\Models\Support\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
