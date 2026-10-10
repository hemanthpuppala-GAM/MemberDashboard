<?php

namespace App\Http\Controllers\Api\Support;

use App\Http\Controllers\Controller;
use App\Models\People\Member;
use App\Models\Support\Ticket;
use Illuminate\Http\Request;

/** A member (Google sign-in) following their own questions. */
class MemberTicketController extends Controller
{
    private function ownedBy(Member $m)
    {
        return Ticket::where(function ($w) use ($m) {
            $w->where('member_id', $m->id);
            if ($m->email) {
                $w->orWhere('requester_email', strtolower($m->email));
            }
        });
    }

    public function index(Request $request)
    {
        $tickets = $this->ownedBy($request->user())->latest()->limit(100)->get();

        return response()->json($tickets->map(fn (Ticket $t) => $t->toApi(false, true)));
    }

    public function show(Request $request, int $id)
    {
        $ticket = $this->ownedBy($request->user())->findOrFail($id);

        return response()->json($ticket->toApi(true, true));
    }

    public function comment(Request $request, int $id)
    {
        $member = $request->user();
        $ticket = $this->ownedBy($member)->findOrFail($id);
        $data = $request->validate(['body' => ['required', 'string', 'max:5000']]);

        $ticket->comments()->create(['author_type' => 'member', 'member_id' => $member->id, 'body' => $data['body']]);
        // The member answered: put it back in front of the team.
        if ($ticket->status === 'waiting') {
            $ticket->moveTo('in_progress');
        } elseif (in_array($ticket->status, ['resolved', 'closed'], true)) {
            $ticket->moveTo('open');
        }
        $ticket->touch();
        $ticket->save();

        return response()->json($ticket->fresh()->toApi(true, true), 201);
    }

    public function rate(Request $request, int $id)
    {
        $ticket = $this->ownedBy($request->user())->findOrFail($id);
        abort_unless(in_array($ticket->status, ['resolved', 'closed'], true), 422, 'You can rate a question once it is resolved.');
        $data = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        $ticket->forceFill(['rating' => $data['rating'], 'rating_comment' => $data['comment'] ?? null, 'rated_at' => now()])->save();

        return response()->json($ticket->toApi(true, true));
    }
}
