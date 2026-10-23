<?php

namespace Tests\Feature;

use App\Mail\TicketAssignedMail;
use App\Models\Support\SupportAgent;
use App\Models\Support\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SupportAssignAlertTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_team_member_a_ticket_is_assigned_to_gets_an_email(): void
    {
        Mail::fake();
        $core = new SupportAgent(['kind' => 'core', 'name' => 'Lakshmi', 'phone' => SupportAgent::normalizePhone('+91 73961 12111')]);
        $core->setPin('246810');
        $core->save();
        $expert = SupportAgent::create(['kind' => 'volunteer', 'name' => 'Dr. Ravi Kumar', 'email' => 'ravi@example.com']);
        $noEmail = new SupportAgent(['kind' => 'core', 'name' => 'Sita', 'phone' => SupportAgent::normalizePhone('+91 90000 00001')]);
        $noEmail->setPin('135790');
        $noEmail->save();
        $ticket = Ticket::create(['source' => 'ask_web', 'requester_name' => 'Asha', 'subject' => 'Knees hurt', 'body' => 'My knees hurt when I sit.', 'priority' => 'urgent']);

        Sanctum::actingAs($core, [], 'sanctum');
        $this->patchJson("/api/v1/support/tickets/{$ticket->id}", ['assigned_agent_id' => $expert->id])->assertOk();

        Mail::assertSent(TicketAssignedMail::class, function (TicketAssignedMail $mail) use ($ticket) {
            $mail->assertSeeInHtml('Lakshmi assigned ticket');
            $mail->assertSeeInHtml('My knees hurt when I sit.');
            $mail->assertSeeInHtml('/support/ticket/'.$ticket->id);

            return $mail->hasTo('ravi@example.com') && str_starts_with($mail->envelope()->subject, 'Urgent: Ticket');
        });

        // Taking a ticket yourself, or giving it to someone with no email, sends nothing.
        Mail::fake();
        $this->patchJson("/api/v1/support/tickets/{$ticket->id}", ['assigned_agent_id' => $core->id])->assertOk();
        $this->patchJson("/api/v1/support/tickets/{$ticket->id}", ['assigned_agent_id' => $noEmail->id])->assertOk();
        $this->patchJson("/api/v1/support/tickets/{$ticket->id}", ['assigned_agent_id' => null])->assertOk();
        Mail::assertNothingSent();
    }
}
