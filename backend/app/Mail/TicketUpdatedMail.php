<?php

namespace App\Mail;

use App\Models\Support\Ticket;
use App\Models\Support\TicketComment;
use App\Services\Site\GoLive;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Tells the member their question got a reply or was resolved, with a link to follow it. */
class TicketUpdatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Ticket $ticket, public string $kind, public ?TicketComment $comment = null) {}

    /** "question", or "volunteer sign-up" for sign-up tickets. */
    private function what(): string
    {
        return in_array($this->ticket->source, ['volunteer', 'volunteer_old'], true) ? 'volunteer sign-up' : 'question';
    }

    public function envelope(): Envelope
    {
        $subject = $this->kind === 'resolved'
            ? "Your {$this->what()} {$this->ticket->ref} is resolved — Golden Age Wisdom"
            : "Reply to your {$this->what()} {$this->ticket->ref} — Golden Age Wisdom";

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.ticket-updated',
            text: 'emails.ticket-updated-text',
            with: [
                'ticket' => $this->ticket,
                'kind' => $this->kind,
                'what' => $this->what(),
                'reply' => $this->comment?->body,
                'name' => $this->ticket->requester_name ?: 'friend',
                'url' => GoLive::frontendUrl().'/support/my?ticket='.$this->ticket->id,
            ],
        );
    }
}
