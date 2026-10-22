<?php

namespace App\Mail;

use App\Models\Support\Ticket;
use App\Services\Site\GoLive;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

/** Tells a support team member that a ticket was assigned to them, with a link to it on the desk. */
class TicketAssignedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Ticket $ticket, public string $assigneeName, public string $assignedBy) {}

    public function envelope(): Envelope
    {
        $urgent = $this->ticket->priority === 'urgent' ? 'Urgent: ' : '';

        return new Envelope(subject: "{$urgent}Ticket {$this->ticket->ref} assigned to you — {$this->ticket->subject}");
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.ticket-assigned',
            text: 'emails.ticket-assigned-text',
            with: [
                'ticket' => $this->ticket,
                'name' => Str::before($this->assigneeName, ' ') ?: 'friend',
                'by' => $this->assignedBy,
                'from' => $this->ticket->requester_name ?: $this->ticket->member?->name ?: 'A member',
                'question' => Str::limit((string) $this->ticket->body, 600),
                'url' => GoLive::frontendUrl().'/support/ticket/'.$this->ticket->id,
            ],
        );
    }
}
