<?php

namespace App\Mail;

use App\Models\Support\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** The grievance chief's reply, to the person who raised the grievance. */
class GrievanceReplyMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Ticket $ticket, public string $name, public string $reply, public bool $resolved = false) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Reply to your grievance {$this->ticket->ref} — Golden Age Wisdom");
    }

    public function content(): Content
    {
        return new Content(
            html: 'emails.ask-received',
            text: 'emails.ask-received-text',
            with: [
                'greeting' => "Namaste {$this->name},",
                'bodyLine' => $this->reply.($this->resolved ? "\n\nWe have marked grievance {$this->ticket->ref} as resolved." : '')."\n\nYou can reply to this email; it goes only to the grievance chief.",
                'signoff' => 'Grievance cell, Golden Age Wisdom',
            ],
        );
    }
}
