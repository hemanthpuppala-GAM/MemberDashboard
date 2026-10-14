<?php

namespace App\Http\Controllers\Api\Admin\People;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\People\MemberRequest;
use App\Models\People\Member;
use App\Services\People\MemberNumbers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class MemberController extends Controller
{
    public function index(Request $request)
    {
        $query = Member::query()
            ->select(['id', 'member_num', 'name', 'email', 'phone', 'category', 'status', 'source', 'drive_id', 'join_date', 'assigned_practitioner_id'])
            ->with(['practitioner:id,name', 'drive:id,name'])
            ->withCount(['volunteerApplications', 'tickets'])
            ->latest();

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($practitionerId = $request->query('assigned_practitioner_id')) {
            $query->where('assigned_practitioner_id', $practitionerId);
        }
        if ($driveId = $request->query('drive_id')) {
            $query->where('drive_id', $driveId);
        }
        if ($source = $request->query('source')) {
            $query->where('source', $source);
        }
        if ($search = trim((string) $request->query('search'))) {
            $num = MemberNumbers::parse($search);
            $phone = MemberNumbers::phoneKey($search);
            $query->where(fn ($q) => $q->where('name', 'like', "{$search}%")->orWhere('email', 'like', "{$search}%")
                ->when($num, fn ($q) => $q->orWhere('member_num', $num))
                ->when($phone, fn ($q) => $q->orWhere('phone_key', $phone)));
        }

        return response()->json($query->paginate((int) $request->query('per_page', 20)));
    }

    public function store(MemberRequest $request)
    {
        $member = Member::create([
            ...$request->validated(),
            'source' => 'admin',
            'join_date' => now()->toDateString(),
        ]);

        return response()->json($member, 201);
    }

    public function show(Member $member)
    {
        $member->load('practitioner:id,name', 'sourceSubmission:id,message', 'drive:id,name,held_on');

        // Everything this person has done anywhere — volunteer, support desk, practice, journal.
        return response()->json([
            ...$member->toArray(),
            'linked' => [
                'volunteer_applications' => $member->volunteerApplications()->with('category:id,name')
                    ->get(['id', 'member_id', 'name', 'status', 'teams', 'availability', 'city', 'category_id', 'created_at']),
                'tickets' => $member->tickets()->limit(20)
                    ->get(['id', 'member_id', 'source', 'subject', 'status', 'priority', 'created_at'])
                    ->map(fn ($t) => ['id' => $t->id, 'ref' => $t->ref, 'source' => $t->source, 'subject' => $t->subject, 'status' => $t->status, 'priority' => $t->priority, 'created_at' => $t->created_at]),
                'tickets_count' => $member->tickets()->count(),
                'practice' => [
                    'sits' => $member->practiceSessions()->count(),
                    'minutes' => (int) $member->practiceSessions()->sum('duration_minutes'),
                    'last_sit_at' => $member->practiceSessions()->max('completed_at'),
                ],
                'journal_count' => $member->journalEntries()->count(),
                'journal_recent' => $member->journalEntries()->limit(3)->get(['id', 'member_id', 'content', 'created_at']),
            ],
        ]);
    }

    public function update(MemberRequest $request, Member $member)
    {
        $member->update($request->validated());

        return response()->json($member->fresh());
    }

    public function destroy(Member $member)
    {
        $member->delete();

        return response()->json(null, 204);
    }

    public function assign(Request $request, Member $member)
    {
        $request->validate(['assigned_practitioner_id' => ['nullable', 'integer', 'exists:users,id']]);

        $member->update(['assigned_practitioner_id' => $request->input('assigned_practitioner_id')]);

        return response()->json($member);
    }

    public function export()
    {
        $rows = Member::with(['practitioner:id,name', 'drive:id,name'])->orderBy('member_num')->get();

        $csv = "Member ID,Name,Email,Phone,Category,Status,Source,Drive,Practitioner,Joined\n";
        foreach ($rows as $row) {
            $csv .= implode(',', array_map(
                fn ($v) => '"'.str_replace('"', '""', (string) $v).'"',
                [$row->member_code, $row->name, $row->email, $row->phone, $row->category, $row->status, $row->source, $row->drive?->name, $row->practitioner?->name, $row->join_date?->toDateString()],
            ))."\n";
        }

        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="members.csv"',
        ]);
    }
}
