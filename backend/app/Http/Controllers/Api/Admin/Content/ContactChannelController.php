<?php

namespace App\Http\Controllers\Api\Admin\Content;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Content\ContactChannelRequest;
use App\Models\Content\ContactChannel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContactChannelController extends Controller
{
    public function index()
    {
        return response()->json(ContactChannel::orderBy('sort_order')->get());
    }

    public function store(ContactChannelRequest $request)
    {
        $channel = ContactChannel::create([
            ...$request->validated(),
            'sort_order' => $request->validated('sort_order') ?? ContactChannel::count() + 1,
        ]);

        return response()->json($channel, 201);
    }

    public function update(ContactChannelRequest $request, ContactChannel $contactChannel)
    {
        $contactChannel->update($request->validated());

        return response()->json($contactChannel->fresh());
    }

    public function destroy(ContactChannel $contactChannel)
    {
        $contactChannel->delete();

        return response()->json(null, 204);
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'channel_ids' => ['required', 'array'],
            'channel_ids.*' => ['integer', 'exists:contact_channels,id'],
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->input('channel_ids') as $index => $id) {
                ContactChannel::where('id', $id)->update(['sort_order' => $index + 1]);
            }
        });

        return response()->json(ContactChannel::orderBy('sort_order')->get());
    }
}
