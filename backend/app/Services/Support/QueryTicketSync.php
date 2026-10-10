<?php

namespace App\Services\Support;

use App\Models\People\ContactSubmission;
use App\Models\Support\SupportAgent;
use App\Models\Support\Ticket;

/**
 * Admin "Queries" and the support desk are one inbox: every website / Ask / member-portal
 * question is a ContactSubmission *and* a Ticket. A status or assignee change on either side is
 * copied to the other, so the admin panel and the desk never disagree.
 */
class QueryTicketSync
{
    /** Ticket sources that come from a ContactSubmission. */
    public const QUERY_SOURCES = ['ask_web', 'member_portal', 'website'];

    private static bool $syncing = false;

    public static function ticketFor(ContactSubmission $s): ?Ticket
    {
        return Ticket::whereIn('source', self::QUERY_SOURCES)->where('source_id', $s->id)->first();
    }

    public static function submissionFor(Ticket $t): ?ContactSubmission
    {
        if (! in_array($t->source, self::QUERY_SOURCES, true) || ! $t->source_id) {
            return null;
        }

        return ContactSubmission::find($t->source_id);
    }

    /** Desk → Queries. */
    public static function fromTicket(Ticket $t): void
    {
        if (self::$syncing || ! $t->wasChanged(['status', 'assigned_agent_id'])) {
            return;
        }
        $s = self::submissionFor($t);
        if (! $s) {
            return;
        }

        $userId = $t->assigned_agent_id ? SupportAgent::whereKey($t->assigned_agent_id)->value('user_id') : null;
        $status = match ($t->status) {
            'open' => $userId ? 'assigned' : 'new',
            'in_progress', 'waiting' => 'in_progress',
            'resolved' => 'resolved',
            'closed' => 'archived',
            default => $s->status,
        };

        $changes = ['status' => $status];
        // Only staff agents map to an admin user; a core/volunteer assignee leaves Queries' owner alone.
        if ($t->wasChanged('assigned_agent_id') && ($userId || ! $t->assigned_agent_id)) {
            $changes['assigned_to'] = $userId;
        }

        self::quietly(fn () => $s->forceFill($changes)->save());
    }

    /** Queries → desk. */
    public static function fromSubmission(ContactSubmission $s): void
    {
        if (self::$syncing || ! $s->wasChanged(['status', 'assigned_to'])) {
            return;
        }
        $t = self::ticketFor($s);
        if (! $t) {
            return;
        }

        if ($s->wasChanged('status')) {
            $status = match ($s->status) {
                'new', 'assigned' => 'open',
                // "Waiting on the member" is a desk-only nuance; keep it.
                'in_progress' => $t->status === 'waiting' ? 'waiting' : 'in_progress',
                'resolved' => 'resolved',
                'archived' => 'closed',
                default => $t->status,
            };
            $t->moveTo($status);
        }
        if ($s->wasChanged('assigned_to')) {
            $user = $s->assignee;
            $t->assigned_agent_id = $user ? SupportAgent::forUser($user)->id : null;
        }

        if ($t->isDirty()) {
            self::quietly(fn () => $t->save());
        }
    }

    private static function quietly(callable $fn): void
    {
        self::$syncing = true;
        try {
            $fn();
        } finally {
            self::$syncing = false;
        }
    }
}
