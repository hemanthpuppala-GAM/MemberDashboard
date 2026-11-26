<?php

namespace App\Mail;

use App\Services\Site\GoLive;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

/**
 * Morning reminder to the grievance chief: every grievance still open, oldest first. Sent only when there are some.
 * Reference numbers and ages only — no sender and no message in email (team decision).
 */
class GrievanceDigestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Collection $tickets, public string $chiefName) {}

    public function envelope(): Envelope
    {
        $n = $this->tickets->count();

        return new Envelope(subject: "{$n} grievance".($n === 1 ? '' : 's').' waiting for you — Golden Age Wisdom');
    }

    public function content(): Content
    {
        $base = GoLive::frontendUrl();
        $lines = $this->tickets->map(function ($t) use ($base) {
            $days = max(0, (int) $t->created_at->diffInDays(now()));

            return "• {$t->ref} · ".($days === 0 ? 'arrived today' : "open {$days} day".($days === 1 ? '' : 's'))
                .($t->nudged_at ? ' · nudged by the team' : '')
                ."\n  {$base}/support/ticket/{$t->id}";
        })->implode("\n");

        return new Content(
            html: 'emails.ask-received',
            text: 'emails.ask-received-text',
            with: [
                'greeting' => "Namaste {$this->chiefName},",
                'bodyLine' => "These grievances are still open. Open each one on the support desk to read it:\n\n{$lines}\n\nMark each one resolved on the desk when it is settled. This reminder stops when none are open.",
                'signoff' => 'Golden Age Wisdom grievance cell',
            ],
        );
    }
}
