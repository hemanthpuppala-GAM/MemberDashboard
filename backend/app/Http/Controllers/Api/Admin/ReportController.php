<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\ContactSubmission;
use App\Models\Member;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class ReportController extends Controller
{
    public function overview()
    {
        $months = $this->lastSixMonths();

        return response()->json([
            'submissions_total' => ContactSubmission::count(),
            'submissions_monthly' => $months->map(fn ($m) => [
                'month' => $m['label'],
                'count' => ContactSubmission::whereBetween('created_at', [$m['start'], $m['end']])->count(),
            ]),
            'by_category' => ContactSubmission::selectRaw('category, count(*) as count')->groupBy('category')->pluck('count', 'category'),
        ]);
    }

    public function members()
    {
        $months = $this->lastSixMonths();

        return response()->json([
            'members_by_practitioner' => User::whereHas('roles', fn ($q) => $q->where('name', 'practitioner'))
                ->withCount('assignedMembers')
                ->get()
                ->map(fn ($u) => ['name' => $u->name, 'members' => $u->assigned_members_count]),
            'status_breakdown' => Member::selectRaw('status, count(*) as count')->groupBy('status')->pluck('count', 'status'),
            'new_vs_resolved_monthly' => $months->map(fn ($m) => [
                'month' => $m['label'],
                'new' => Member::whereBetween('created_at', [$m['start'], $m['end']])->count(),
                'resolved' => Member::where('status', 'resolved')->whereBetween('updated_at', [$m['start'], $m['end']])->count(),
            ]),
        ]);
    }

    public function practitioners()
    {
        $practitioners = User::whereHas('roles', fn ($q) => $q->where('name', 'practitioner'))
            ->withCount('assignedMembers')
            ->get();

        return response()->json($practitioners->map(fn ($u) => [
            'name' => $u->name,
            'members' => $u->assigned_members_count,
            'capacity' => $u->max_capacity,
            'resolved_this_month' => $u->assignedMembers()->where('status', 'resolved')->whereMonth('updated_at', now()->month)->count(),
        ]));
    }

    public function queries()
    {
        return response()->json([
            'by_category' => ContactSubmission::selectRaw('category, count(*) as count')->groupBy('category')->pluck('count', 'category'),
            'by_status' => ContactSubmission::selectRaw('status, count(*) as count')->groupBy('status')->pluck('count', 'status'),
        ]);
    }

    public function activityLog(Request $request)
    {
        $query = ActivityLog::query()->with('user:id,name')->latest();

        if ($userId = $request->query('user_id')) {
            $query->where('user_id', $userId);
        }
        if ($action = $request->query('action')) {
            $query->where('action', 'like', "%{$action}%");
        }
        if ($from = $request->query('date_from')) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to = $request->query('date_to')) {
            $query->whereDate('created_at', '<=', $to);
        }

        return response()->json($query->paginate((int) $request->query('per_page', 25)));
    }

    public function export(Request $request)
    {
        $request->validate(['type' => ['required', 'in:activity-log,members'], 'format' => ['required', 'in:csv,pdf']]);

        abort_if($request->query('format') === 'pdf', 501, 'PDF export is not wired up yet — use CSV.');

        if ($request->query('type') === 'members') {
            return app(MemberController::class)->export();
        }

        $rows = ActivityLog::with('user:id,name')->latest()->get();
        $csv = "User,Action,Target,IP,When\n";
        foreach ($rows as $row) {
            $csv .= implode(',', array_map(
                fn ($v) => '"'.str_replace('"', '""', (string) $v).'"',
                [$row->user?->name, $row->action, $row->target_type, $row->ip_address, $row->created_at],
            ))."\n";
        }

        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="activity-log.csv"',
        ]);
    }

    private function lastSixMonths()
    {
        return collect(range(5, 0))->map(function ($i) {
            $date = now()->subMonths($i);

            return [
                'label' => $date->format('M'),
                'start' => $date->copy()->startOfMonth(),
                'end' => $date->copy()->endOfMonth(),
            ];
        });
    }
}
