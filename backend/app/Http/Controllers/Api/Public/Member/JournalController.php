<?php

namespace App\Http\Controllers\Api\Public\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\Member\JournalStoreRequest;
use App\Models\People\MemberJournalEntry;
use Illuminate\Http\Request;

class JournalController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->journalEntries()->get(),
        );
    }

    public function store(JournalStoreRequest $request)
    {
        $entry = $request->user()->journalEntries()->create($request->validated());

        return response()->json($entry, 201);
    }

    public function update(JournalStoreRequest $request, MemberJournalEntry $journalEntry)
    {
        abort_unless($journalEntry->member_id === $request->user()->id, 403);

        $journalEntry->update($request->validated());

        return response()->json($journalEntry);
    }

    public function destroy(Request $request, MemberJournalEntry $journalEntry)
    {
        abort_unless($journalEntry->member_id === $request->user()->id, 403);

        $journalEntry->delete();

        return response()->json(null, 204);
    }
}
