<?php

namespace App\Http\Controllers\Api\Admin\People;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\People\MemberJourneyRequest;
use App\Models\People\Member;
use Illuminate\Http\Request;

class MemberJourneyController extends Controller
{
    public function index(Member $member)
    {
        return response()->json($member->journeys()->with('author:id,name')->get());
    }

    public function store(MemberJourneyRequest $request, Member $member)
    {
        $entry = $member->journeys()->create([
            ...$request->validated(),
            'added_by' => $request->user()->id,
        ]);

        $member->update(['last_contact_date' => now()->toDateString()]);

        return response()->json($entry->load('author:id,name'), 201);
    }
}
