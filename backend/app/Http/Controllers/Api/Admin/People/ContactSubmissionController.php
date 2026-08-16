<?php

namespace App\Http\Controllers\Api\Admin\People;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\People\ContactSubmissionUpdateRequest;
use App\Models\People\ContactSubmission;
use App\Models\People\Member;
use App\Models\People\MemberJourney;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContactSubmissionController extends Controller
{
    public function index(Request $request)
    {
        $query = ContactSubmission::query()->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }
        if ($assignedTo = $request->query('assigned_to')) {
            $query->where('assigned_to', $assignedTo);
        }
        if ($search = $request->query('search')) {
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
        }
        if ($from = $request->query('date_from')) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to = $request->query('date_to')) {
            $query->whereDate('created_at', '<=', $to);
        }

        return response()->json($query->paginate((int) $request->query('per_page', 20)));
    }

    public function show(ContactSubmission $contactSubmission)
    {
        return response()->json($contactSubmission->load('assignee:id,name'));
    }

    public function update(ContactSubmissionUpdateRequest $request, ContactSubmission $contactSubmission)
    {
        $contactSubmission->update($request->validated());

        return response()->json($contactSubmission);
    }

    public function assign(Request $request, ContactSubmission $contactSubmission)
    {
        $request->validate(['assigned_to' => ['nullable', 'integer', 'exists:users,id']]);

        $contactSubmission->update([
            'assigned_to' => $request->input('assigned_to'),
            'status' => $request->input('assigned_to') ? 'assigned' : 'new',
        ]);

        return response()->json($contactSubmission);
    }

    public function convertToMember(Request $request, ContactSubmission $contactSubmission)
    {
        abort_if($contactSubmission->converted_to_member_id, 422, 'This query has already been converted to a member.');

        $member = DB::transaction(function () use ($contactSubmission, $request) {
            $member = Member::create([
                'name' => $contactSubmission->name,
                'email' => $contactSubmission->email,
                'phone' => $contactSubmission->phone,
                'category' => $contactSubmission->category,
                'assigned_practitioner_id' => $contactSubmission->assigned_to,
                'source_submission_id' => $contactSubmission->id,
                'status' => 'active',
                'join_date' => now()->toDateString(),
                'last_contact_date' => now()->toDateString(),
            ]);

            MemberJourney::create([
                'member_id' => $member->id,
                'added_by' => $request->user()->id,
                'entry_type' => 'status_change',
                'content' => 'Converted from query to member.',
            ]);

            MemberJourney::create([
                'member_id' => $member->id,
                'added_by' => null,
                'entry_type' => 'note',
                'content' => "Original query: \"{$contactSubmission->message}\"",
            ]);

            $contactSubmission->update([
                'converted_to_member_id' => $member->id,
                'status' => 'resolved',
            ]);

            return $member;
        });

        return response()->json($member, 201);
    }
}
