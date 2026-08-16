<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BroadcastRequest;
use App\Models\Broadcast;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BroadcastController extends Controller
{
    public function index()
    {
        return response()->json(Broadcast::latest()->get());
    }

    public function store(BroadcastRequest $request)
    {
        $broadcast = Broadcast::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
        ]);

        return response()->json($broadcast, 201);
    }

    public function update(BroadcastRequest $request, Broadcast $broadcast)
    {
        $broadcast->update($request->validated());

        return response()->json($broadcast->fresh());
    }

    public function destroy(Broadcast $broadcast)
    {
        $broadcast->delete();

        return response()->json(null, 204);
    }

    public function updateStatus(Request $request, Broadcast $broadcast)
    {
        $request->validate(['status' => ['required', Rule::in(Broadcast::STATUSES)]]);

        $broadcast->update(['status' => $request->input('status')]);

        return response()->json($broadcast);
    }
}
