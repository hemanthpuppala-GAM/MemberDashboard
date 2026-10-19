<?php

namespace App\Http\Controllers\Api\Support;

use App\Http\Controllers\Controller;
use App\Models\Support\SupportAgent;
use App\Models\Support\Ticket;
use Illuminate\Http\Request;

class SupportDashboardController extends Controller
{
    /** Whole-desk picture: queue health, speed, satisfaction, and each person's work. */
    public function index(Request $request)
    {
        $me = $request->attributes->get('support_agent');
        $since = now()->subDays(30);

        $byStatus = Ticket::selectRaw('status, count(*) as n')->groupBy('status')->pluck('n', 'status');
        $openBySource = Ticket::whereIn('status', Ticket::OPEN_STATUSES)
            ->selectRaw('source, count(*) as n')->groupBy('source')->pluck('n', 'source');

        // Timing maths in PHP keeps it identical on MySQL and SQLite.
        $recent = Ticket::where('created_at', '>=', $since)->get(['id', 'created_at', 'first_response_at', 'resolved_at', 'assigned_agent_id', 'rating', 'status']);
        $avgMinutes = fn ($rows, $from, $to) => ($c = $rows->filter(fn ($t) => $t->$to)->count())
            ? round($rows->filter(fn ($t) => $t->$to)->avg(fn ($t) => $t->$from->diffInMinutes($t->$to)))
            : null;

        $rated = Ticket::whereNotNull('rating');
        $stats = [
            'open' => (int) ($byStatus['open'] ?? 0),
            'in_progress' => (int) ($byStatus['in_progress'] ?? 0),
            'waiting' => (int) ($byStatus['waiting'] ?? 0),
            'resolved' => (int) ($byStatus['resolved'] ?? 0) + (int) ($byStatus['closed'] ?? 0),
            'unassigned' => Ticket::whereNull('assigned_agent_id')->whereIn('status', Ticket::OPEN_STATUSES)->count(),
            'urgent_open' => Ticket::where('priority', 'urgent')->whereIn('status', Ticket::OPEN_STATUSES)->count(),
            'mine_open' => Ticket::where('assigned_agent_id', $me->id)->whereIn('status', Ticket::OPEN_STATUSES)->count(),
            'new_today' => Ticket::where('created_at', '>=', now()->startOfDay())->count(),
            'resolved_7d' => Ticket::where('resolved_at', '>=', now()->subDays(7))->count(),
            'avg_first_response_minutes' => $avgMinutes($recent, 'created_at', 'first_response_at'),
            'avg_resolution_minutes' => $avgMinutes($recent, 'created_at', 'resolved_at'),
            'avg_rating' => ($n = (clone $rated)->count()) ? round((clone $rated)->avg('rating'), 2) : null,
            'ratings' => $n,
            'oldest_open_at' => Ticket::whereIn('status', Ticket::OPEN_STATUSES)->min('created_at'),
        ];

        $team = SupportAgent::where('is_active', true)->orderBy('kind')->orderBy('name')->get()->map(function (SupportAgent $a) use ($recent) {
            $mine = Ticket::where('assigned_agent_id', $a->id);
            $resolved30 = $recent->where('assigned_agent_id', $a->id)->filter(fn ($t) => $t->resolved_at);
            $ratings = (clone $mine)->whereNotNull('rating');

            return [
                ...$a->toPublic(),
                'open' => (clone $mine)->whereIn('status', Ticket::OPEN_STATUSES)->count(),
                'resolved_total' => (clone $mine)->whereIn('status', ['resolved', 'closed'])->count(),
                'resolved_30d' => $resolved30->count(),
                'avg_resolution_minutes' => $resolved30->count() ? round($resolved30->avg(fn ($t) => $t->created_at->diffInMinutes($t->resolved_at))) : null,
                'avg_rating' => ($rc = (clone $ratings)->count()) ? round((clone $ratings)->avg('rating'), 2) : null,
                'ratings' => $rc,
                'last_login_at' => $a->last_login_at,
            ];
        });

        $latestReviews = Ticket::whereNotNull('rating')->with('assignee')->latest('rated_at')->limit(6)->get()
            ->map(fn (Ticket $t) => ['ref' => $t->ref, 'id' => $t->id, 'rating' => $t->rating, 'comment' => $t->rating_comment, 'agent' => $t->assignee?->name, 'rated_at' => $t->rated_at]);

        return response()->json([
            'me' => $me->toPublic(),
            'stats' => $stats,
            'progress' => $this->progress($me, $since),
            'open_by_source' => $openBySource,
            'team' => $team,
            'latest_reviews' => $latestReviews,
        ]);
    }

    /**
     * The last 30 days at a glance: new vs resolved per day, how much got resolved, where
     * requests come from, what they are about, and the signed-in person's own share.
     */
    private function progress(SupportAgent $me, $since): array
    {
        $created = Ticket::where('created_at', '>=', $since)->get(['created_at', 'source', 'category', 'assigned_agent_id', 'created_by_agent_id']);
        $resolved = Ticket::where('resolved_at', '>=', $since)->get(['resolved_at', 'assigned_agent_id']);

        $days = [];
        for ($d = now()->subDays(29)->startOfDay(); $d <= now(); $d = $d->copy()->addDay()) {
            $days[$d->toDateString()] = ['date' => $d->toDateString(), 'new' => 0, 'resolved' => 0];
        }
        foreach ($created as $t) {
            if (isset($days[$k = $t->created_at->toDateString()])) {
                $days[$k]['new']++;
            }
        }
        foreach ($resolved as $t) {
            if (isset($days[$k = $t->resolved_at->toDateString()])) {
                $days[$k]['resolved']++;
            }
        }
        $count = fn ($rows, $key) => $rows->groupBy(fn ($t) => $t->$key ?: 'other')->map->count()->sortDesc()->all();

        return [
            'days' => array_values($days),
            'new_30d' => $created->count(),
            'resolved_30d' => $resolved->count(),
            'by_source' => $count($created, 'source'),
            'by_category' => $count($created, 'category'),
            'mine' => [
                'logged_30d' => $created->where('created_by_agent_id', $me->id)->count(),
                'resolved_30d' => $resolved->where('assigned_agent_id', $me->id)->count(),
                'open' => Ticket::where('assigned_agent_id', $me->id)->whereIn('status', Ticket::OPEN_STATUSES)->count(),
            ],
        ];
    }

    public function agents()
    {
        return response()->json(SupportAgent::where('is_active', true)->orderBy('name')->get()->map->toPublic());
    }
}
