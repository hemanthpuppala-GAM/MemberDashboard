<?php

namespace App\Services\Support;

use App\Mail\GrievanceAlertMail;
use App\Mail\GrievanceReplyMail;
use App\Models\People\Member;
use App\Models\Support\Grievance;
use App\Models\Support\SupportAgent;
use App\Models\Support\Ticket;
use App\Models\Support\TicketComment;
use App\Services\Mail\SmtpSettings;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Grievance cell. A grievance becomes a confidential desk ticket: the ticket row only says "Grievance
 * (confidential)" and "Anonymous"; the sender, contact details, message and every reply are encrypted and only
 * the grievance chief can read them. The rest of the team sees that it exists, its age and status, and can
 * nudge the chief.
 */
class GrievanceDesk
{
    public static function file(array $data, ?Member $member): Ticket
    {
        $chief = SupportAgent::grievanceChief();

        $ticket = DB::transaction(function () use ($data, $member, $chief) {
            $ticket = new Ticket([
                'source' => 'grievance',
                'confidential' => true,
                'requester_name' => null,
                'requester_email' => null,
                'requester_phone' => null,
                'member_id' => null, // never linked: the link alone would name the sender
                'subject' => Ticket::MASKED_SUBJECT,
                'body' => Ticket::MASKED_BODY,
                'category' => 'grievance',
                'priority' => 'normal',
                'assigned_agent_id' => $chief?->id,
            ]);
            $ticket->status = 'open';
            $ticket->save();

            Grievance::create([
                'ticket_id' => $ticket->id,
                'name' => $data['name'] ?? $member?->name,
                'email' => isset($data['email']) ? strtolower($data['email']) : $member?->email,
                'phone' => $data['phone'] ?? $member?->phone,
                'member_ref' => $member ? trim(($member->member_code ?? '').' · #'.$member->id, ' ·') : null,
                'about' => $data['about'],
                'subject' => Ticket::subjectFrom($data['message']),
                'body' => $data['message'],
            ]);

            return $ticket;
        });

        self::alertChief($ticket->load('grievance'), 'new');

        return $ticket;
    }

    public static function canRead(SupportAgent $agent): bool
    {
        return (bool) $agent->is_grievance_chief && $agent->is_active;
    }

    /** Desk API shape for one ticket, unmasked only for the chief. */
    public static function present(Ticket $ticket, array $data, SupportAgent $agent): array
    {
        if (! $ticket->confidential) {
            return $data;
        }
        if (! self::canRead($agent)) {
            $data['requester'] = ['name' => 'Anonymous', 'email' => null, 'phone' => null, 'member_id' => null, 'member_code' => null];
            if (isset($data['comments'])) {
                // Only the system notes (status changes, nudges) — never what the chief wrote.
                $data['comments'] = collect($data['comments'])->where('author_type', 'system')->values()->all();
            }
            $data['history'] = [];
            $data['can_read'] = false;

            return $data;
        }
        $g = $ticket->grievance;
        if ($g) {
            $data['subject'] = $g->subject;
            $data['body'] = "[{$g->about}]\n\n{$g->body}";
            $data['requester'] = [
                'name' => $g->name ?: 'Anonymous',
                'email' => $g->email,
                'phone' => $g->phone,
                'member_id' => null,
                'member_code' => $g->member_ref,
            ];
        }
        $data['history'] = [];
        $data['can_read'] = true;

        return $data;
    }

    /** The team presses "Nudge the chief": a note on the ticket and an email to the chief (once per 12 hours). */
    public static function nudge(Ticket $ticket, SupportAgent $by): array
    {
        if ($ticket->nudged_at && $ticket->nudged_at->gt(now()->subHours(12))) {
            return ['nudged' => false, 'message' => 'The chief was already nudged in the last 12 hours.'];
        }
        $ticket->nudged_at = now();
        $ticket->save();
        $ticket->comments()->create(['author_type' => 'system', 'agent_id' => $by->id, 'body' => "{$by->name} nudged the grievance chief to resolve this.", 'internal' => true]);
        self::alertChief($ticket, 'nudge', $by->name);

        return ['nudged' => true, 'message' => 'The chief has been reminded by email.'];
    }

    /** Email the chief: the full grievance (so they don't need the desk to read it), or the team's nudge. */
    public static function alertChief(Ticket $ticket, string $kind, ?string $by = null): void
    {
        $chief = SupportAgent::grievanceChief();
        $email = $chief?->alertEmail();
        if (! $email) {
            Log::warning("Grievance {$ticket->ref}: no grievance chief with an email is set (Admin → Support team).");

            return;
        }
        try {
            SmtpSettings::apply();
            Mail::to($email)->send(new GrievanceAlertMail($ticket, $kind, $chief->name, $by));
        } catch (\Throwable $e) {
            Log::warning("Grievance {$ticket->ref} alert email failed: ".$e->getMessage());
        }
    }

    /** Daily: remind the chief of every open grievance. Returns how many were listed (0 = nothing sent). */
    public static function remindChief(): int
    {
        $chief = SupportAgent::grievanceChief();
        $email = $chief?->alertEmail();
        $open = Ticket::with('grievance')->where('confidential', true)->whereIn('status', Ticket::OPEN_STATUSES)->oldest()->get();
        if (! $email || $open->isEmpty()) {
            return 0;
        }
        try {
            SmtpSettings::apply();
            Mail::to($email)->send(new \App\Mail\GrievanceDigestMail($open, $chief->name));
        } catch (\Throwable $e) {
            Log::warning('Grievance reminder email failed: '.$e->getMessage());

            return 0;
        }

        return $open->count();
    }

    /** The chief's reply goes to the sender, if they left an email. Reply-To is the chief, so they can write back. */
    public static function replyToSender(Ticket $ticket, TicketComment $comment, SupportAgent $chief, bool $resolved = false): bool
    {
        $g = $ticket->grievance;
        if (! $g?->email) {
            return false;
        }
        try {
            SmtpSettings::apply();
            $mail = new GrievanceReplyMail($ticket, $g->name ?: 'friend', $comment->body, $resolved);
            if ($chief->alertEmail()) {
                $mail->replyTo($chief->alertEmail(), $chief->name);
            }
            Mail::to($g->email)->send($mail);

            return true;
        } catch (\Throwable $e) {
            Log::warning("Grievance {$ticket->ref} reply email failed: ".$e->getMessage());

            return false;
        }
    }
}
