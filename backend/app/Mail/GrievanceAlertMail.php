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
 * To the grievance chief only: a new grievance (in full, so they don't have to open the desk) or the team's nudge.
 * On a new grievance with an email, Reply-To is the sender: the chief can answer straight from the inbox.
 */
class GrievanceAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Ticket $ticket, public string $kind, public string $chiefName, public ?string $by = null)
    {
        $g = $ticket->grievance;
        if ($kind === 'new' && $g?->email) {
            $this->replyTo($g->email, $g->name ?: 'Grievance sender');
        }
    }

    public function envelope(): Envelope
    {
        $g = $this->ticket->grievance;

        return new Envelope(subject: $this->kind === 'nudge'
            ? "Reminder: grievance {$this->ticket->ref} is waiting for you"
            : "New grievance {$this->ticket->ref}: ".($g?->subject ?? 'confidential'));
    }

    public function content(): Content
    {
        $g = $this->ticket->grievance;
        $url = GoLive::frontendUrl().'/support/ticket/'.$this->ticket->id;
        $days = max(0, (int) $this->ticket->created_at?->diffInDays(now()));

        if ($this->kind === 'nudge') {
            $line = "{$this->by} from the support team asks you to look at grievance {$this->ticket->ref}"
                .($g ? " (\"{$g->subject}\")" : '').". It has been open for {$days} ".($days === 1 ? 'day' : 'days').".\n\nOpen it on the desk: {$url}";
        } else {
            $from = $g?->name ?: 'Anonymous';
            $contact = collect([$g?->email, $g?->phone, $g?->member_ref ? "member {$g->member_ref}" : null])->filter()->implode(' · ');
            $line = "A new grievance has arrived ({$this->ticket->ref}). Only you receive this.\n\n"
                ."From: {$from}".($contact ? " ({$contact})" : '')."\n"
                ."About: {$g?->about}\n\n"
                ."{$g?->body}\n\n"
                .($g?->email
                    ? "To answer, just reply to this email: it goes straight to {$from}. "
                    : 'No email was given, so a reply cannot reach them'.($g?->phone ? "; you can call or WhatsApp {$g->phone}. " : '. '))
                ."To mark it resolved (so the team stops seeing it as open), use the desk: {$url}";
        }

        return new Content(
            html: 'emails.ask-received',
            text: 'emails.ask-received-text',
            with: [
                'greeting' => "Namaste {$this->chiefName},",
                'bodyLine' => $line,
                'signoff' => 'Golden Age Wisdom grievance cell. This email is confidential.',
            ],
        );
    }
}
