<?php

namespace App\Mail;

use App\Models\Support\Ticket;
use App\Services\Site\GoLive;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * To the grievance chief only: a new grievance, or the team's nudge. A notification only — never the sender, the
 * contact details or the message (team decision): the chief opens the desk to read them.
 */
class GrievanceAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Ticket $ticket, public string $kind, public string $chiefName, public ?string $by = null) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->kind === 'nudge'
            ? "Reminder: grievance {$this->ticket->ref} is waiting for you"
            : "New grievance {$this->ticket->ref} — only you can read it");
    }

    public function content(): Content
    {
        $url = GoLive::frontendUrl().'/support/ticket/'.$this->ticket->id;
        $days = max(0, (int) $this->ticket->created_at?->diffInDays(now()));
        $line = $this->kind === 'nudge'
            ? "{$this->by} from the support team asks you to look at grievance {$this->ticket->ref}. It has been open for {$days} ".($days === 1 ? 'day' : 'days').'.'
            : "A new grievance ({$this->ticket->ref}) has arrived. Only you can read who sent it and what it says.";

        return new Content(
            html: 'emails.ask-received',
            text: 'emails.ask-received-text',
            with: [
                'greeting' => "Namaste {$this->chiefName},",
                'bodyLine' => $line."\n\nOpen the support desk to read and reply: {$url}",
                'signoff' => 'Golden Age Wisdom grievance cell',
            ],
        );
    }
}
