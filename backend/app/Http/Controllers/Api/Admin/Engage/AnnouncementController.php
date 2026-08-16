<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AnnouncementRequest;
use App\Models\Announcement;

class AnnouncementController extends Controller
{
    public function index()
    {
        return response()->json(
            Announcement::withCount('reads')->latest()->get(),
        );
    }

    public function store(AnnouncementRequest $request)
    {
        $announcement = Announcement::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
        ]);

        return response()->json($announcement, 201);
    }

    public function update(AnnouncementRequest $request, Announcement $announcement)
    {
        $announcement->update($request->validated());

        return response()->json($announcement->fresh());
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return response()->json(null, 204);
    }

    public function send(Announcement $announcement)
    {
        $announcement->update(['sent_at' => now()]);

        return response()->json($announcement);
    }
}
