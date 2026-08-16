<?php

namespace App\Http\Controllers\Api\Admin\People;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\People\MemberRequest;
use App\Models\People\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class MemberController extends Controller
{
    public function index(Request $request)
    {
        $query = Member::query()->with('practitioner:id,name')->latest();

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($practitionerId = $request->query('assigned_practitioner_id')) {
            $query->where('assigned_practitioner_id', $practitionerId);
        }
        if ($search = $request->query('search')) {
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
        }

        return response()->json($query->paginate((int) $request->query('per_page', 20)));
    }

    public function store(MemberRequest $request)
    {
        $member = Member::create([
            ...$request->validated(),
            'join_date' => now()->toDateString(),
        ]);

        return response()->json($member, 201);
    }

    public function show(Member $member)
    {
        return response()->json($member->load('practitioner:id,name', 'sourceSubmission:id,message'));
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
        $rows = Member::with('practitioner:id,name')->get();

        $csv = "Name,Email,Phone,Category,Status,Practitioner,Joined\n";
        foreach ($rows as $row) {
            $csv .= implode(',', array_map(
                fn ($v) => '"'.str_replace('"', '""', (string) $v).'"',
                [$row->name, $row->email, $row->phone, $row->category, $row->status, $row->practitioner?->name, $row->join_date],
            ))."\n";
        }

        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="members.csv"',
        ]);
    }
}
