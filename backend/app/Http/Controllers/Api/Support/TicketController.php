<?php

namespace App\Http\Controllers\Api\Support;

use App\Http\Controllers\Controller;
use App\Mail\TicketUpdatedMail;
use App\Models\People\Member;
use App\Models\Support\SupportAgent;
use App\Models\Support\Ticket;
use App\Models\Support\TicketComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class TicketController extends Controller
{
    private function agent(Request $request): SupportAgent
    {
        return $request->attributes->get('support_agent');
    }

    public function index(Request $request)
    {
        $agent = $this->agent($request);
        $q = Ticket::query()->with('assignee')->withCount('comments');

        match ($request->query('scope', 'open')) {
            'mine' => $q->where('assigned_agent_id', $agent->id)->whereIn('status', Ticket::OPEN_STATUSES),
            'unassigned' => $q->whereNull('assigned_agent_id')->whereIn('status', Ticket::OPEN_STATUSES),
            'resolved' => $q->whereIn('status', ['resolved', 'closed']),
            'all' => null,
            default => $q->whereIn('status', Ticket::OPEN_STATUSES),
        };

        if ($status = $request->query('status')) {
            $q->whereIn('status', array_intersect(explode(',', $status), Ticket::STATUSES));
        }
        if ($source = $request->query('source')) {
            $q->whereIn('source', array_intersect(explode(',', $source), Ticket::SOURCES));
        }
        if ($assignee = $request->query('agent_id')) {
            $q->where('assigned_agent_id', (int) $assignee);
        }
        if ($term = trim((string) $request->query('q'))) {
            $id = (int) preg_replace('/\D+/', '', $term);
            $q->where(function ($w) use ($term, $id) {
                $like = '%'.$term.'%';
                $w->where('subject', 'like', $like)
                    ->orWhere('body', 'like', $like)
                    ->orWhere('requester_name', 'like', $like)
                    ->orWhere('requester_email', 'like', $like)
                    ->orWhere('requester_phone', 'like', $like);
                if ($id > 0) {
                    $w->orWhere('id', $id);
                }
            });
        }

        // Urgent first, then the ones waiting longest.
        $page = $q->orderByRaw("case when priority = 'urgent' then 0 else 1 end")
            ->orderBy('updated_at', $request->query('scope') === 'resolved' ? 'desc' : 'asc')
            ->paginate(min(100, (int) $request->query('per_page', 25)));

        return response()->json([
            'data' => collect($page->items())->map(fn (Ticket $t) => $t->toApi())->all(),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'total' => $page->total()],
        ]);
    }

    /** First-line logs a phone call / WhatsApp chat as a ticket. */
    public function store(Request $request)
    {
        $agent = $this->agent($request);
        $data = $request->validate([
            'source' => ['required', Rule::in(['call', 'whatsapp', 'other'])],
            'requester_name' => ['nullable', 'string', 'max:120'],
            'requester_phone' => ['nullable', 'string', 'max:50'],
            'requester_email' => ['nullable', 'email', 'max:190'],
            'subject' => ['nullable', 'string', 'max:200'],
            'body' => ['required', 'string', 'max:5000'],
            'category' => ['nullable', 'string', 'max:40'],
            'priority' => ['nullable', Rule::in(Ticket::PRIORITIES)],
            'status' => ['nullable', Rule::in(Ticket::STATUSES)],
            'assign_to_me' => ['nullable', 'boolean'],
        ]);

        $email = isset($data['requester_email']) ? strtolower($data['requester_email']) : null;
        $ticket = new Ticket([
            'source' => $data['source'],
            'member_id' => $email ? Member::where('email', $email)->value('id') : null,
            'requester_name' => $data['requester_name'] ?? null,
            'requester_phone' => $data['requester_phone'] ?? null,
            'requester_email' => $email,
            'subject' => $data['subject'] ?? Ticket::subjectFrom($data['body']),
            'body' => $data['body'],
            'category' => $data['category'] ?? 'general',
            'priority' => $data['priority'] ?? 'normal',
            'created_by_agent_id' => $agent->id,
            'assigned_agent_id' => ($data['assign_to_me'] ?? true) ? $agent->id : null,
        ]);
        $ticket->status = 'open';
        $ticket->moveTo($data['status'] ?? 'in_progress');
        $ticket->save();

        return response()->json($ticket->fresh(['assignee', 'creator'])->toApi(true), 201);
    }

    public function show(Ticket $ticket)
    {
        $ticket->load(['assignee', 'creator']);
        $data = $ticket->toApi(true);

        // Earlier tickets from the same person — helps follow-up.
        $data['history'] = Ticket::where('id', '!=', $ticket->id)
            ->where(function ($w) use ($ticket) {
                if ($ticket->member_id) {
                    $w->orWhere('member_id', $ticket->member_id);
                }
                if ($ticket->requester_email) {
                    $w->orWhere('requester_email', $ticket->requester_email);
                }
                if ($ticket->requester_phone) {
                    $w->orWhere('requester_phone', $ticket->requester_phone);
                }
                if (! $ticket->member_id && ! $ticket->requester_email && ! $ticket->requester_phone) {
                    $w->whereRaw('1 = 0');
                }
            })
            ->latest()->limit(10)->get(['id', 'subject', 'status', 'created_at'])
            ->map(fn (Ticket $t) => ['id' => $t->id, 'ref' => $t->ref, 'subject' => $t->subject, 'status' => $t->status, 'created_at' => $t->created_at]);

        return response()->json($data);
    }

    public function update(Request $request, Ticket $ticket)
    {
        $agent = $this->agent($request);
        $data = $request->validate([
            'status' => ['sometimes', Rule::in(Ticket::STATUSES)],
            'priority' => ['sometimes', Rule::in(Ticket::PRIORITIES)],
            'category' => ['sometimes', 'string', 'max:40'],
            'assigned_agent_id' => ['sometimes', 'nullable', 'integer', Rule::exists('support_agents', 'id')->where('is_active', true)],
        ]);

        $notes = [];
        if (array_key_exists('assigned_agent_id', $data) && $data['assigned_agent_id'] !== $ticket->assigned_agent_id) {
            $ticket->assigned_agent_id = $data['assigned_agent_id'];
            $to = $data['assigned_agent_id'] ? SupportAgent::find($data['assigned_agent_id'])?->name : 'nobody';
            $notes[] = "{$agent->name} assigned this to {$to}.";
        }
        if (isset($data['status']) && $data['status'] !== $ticket->status) {
            $notes[] = "{$agent->name} changed status to ".str_replace('_', ' ', $data['status']).'.';
            $ticket->moveTo($data['status']);
        }
        if (isset($data['priority']) && $data['priority'] !== $ticket->priority) {
            $ticket->priority = $data['priority'];
            $notes[] = "{$agent->name} marked this {$data['priority']}.";
        }
        if (isset($data['category'])) {
            $ticket->category = $data['category'];
        }
        $wasResolved = $ticket->isDirty('status') && in_array($ticket->status, ['resolved', 'closed'], true);
        $ticket->save();

        foreach ($notes as $n) {
            $ticket->comments()->create(['author_type' => 'system', 'agent_id' => $agent->id, 'body' => $n, 'internal' => true]);
        }
        if ($wasResolved) {
            $this->notifyRequester($ticket, 'resolved');
        }

        return response()->json($ticket->fresh(['assignee', 'creator'])->toApi(true));
    }

    public function comment(Request $request, Ticket $ticket)
    {
        $agent = $this->agent($request);
        $data = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
            'internal' => ['nullable', 'boolean'],
        ]);
        $internal = (bool) ($data['internal'] ?? false);

        $comment = $ticket->comments()->create([
            'author_type' => 'agent',
            'agent_id' => $agent->id,
            'body' => $data['body'],
            'internal' => $internal,
        ]);

        if (! $internal) {
            $ticket->first_response_at ??= now();
            if ($ticket->status === 'open') {
                $ticket->moveTo('waiting');
            }
            $ticket->assigned_agent_id ??= $agent->id;
        }
        $ticket->touch();
        $ticket->save();

        if (! $internal) {
            $this->notifyRequester($ticket, 'reply', $comment);
        }

        return response()->json($comment->load('agent')->toApi(), 201);
    }

    private function notifyRequester(Ticket $ticket, string $kind, ?TicketComment $comment = null): void
    {
        $email = $ticket->requester_email ?: $ticket->member?->email;
        if (! $email) {
            return;
        }
        try {
            Mail::to($email)->send(new TicketUpdatedMail($ticket, $kind, $comment));
        } catch (\Throwable $e) {
            Log::warning("Ticket {$ticket->ref} email failed: ".$e->getMessage());
        }
    }
}
