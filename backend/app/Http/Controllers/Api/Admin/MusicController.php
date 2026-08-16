<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MusicTrackRequest;
use App\Models\MusicTrack;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MusicController extends Controller
{
    public function index()
    {
        return response()->json(MusicTrack::orderBy('sort_order')->get());
    }

    public function store(MusicTrackRequest $request)
    {
        $disk = config('filesystems.uploads_disk', 'public');

        $data = $request->safe()->except(['file', 'cover']);
        $data['file_path'] = Storage::disk($disk)->url($this->storeUpload($request, 'file', 'music', $disk));

        if ($request->hasFile('cover')) {
            $data['cover_path'] = Storage::disk($disk)->url($this->storeUpload($request, 'cover', 'music/covers', $disk));
        }

        $data['created_by'] = $request->user()->id;
        $data['sort_order'] ??= MusicTrack::count() + 1;

        $track = MusicTrack::create($data);

        return response()->json($track, 201);
    }

    public function update(MusicTrackRequest $request, MusicTrack $music)
    {
        $disk = config('filesystems.uploads_disk', 'public');
        $data = $request->safe()->except(['file', 'cover']);

        if ($request->hasFile('file')) {
            $data['file_path'] = Storage::disk($disk)->url($this->storeUpload($request, 'file', 'music', $disk));
        }

        if ($request->hasFile('cover')) {
            $data['cover_path'] = Storage::disk($disk)->url($this->storeUpload($request, 'cover', 'music/covers', $disk));
        }

        $music->update($data);

        return response()->json($music->fresh());
    }

    public function destroy(MusicTrack $music)
    {
        $music->delete();

        return response()->json(null, 204);
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'track_ids' => ['required', 'array'],
            'track_ids.*' => ['integer', 'exists:music_tracks,id'],
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->input('track_ids') as $index => $id) {
                MusicTrack::where('id', $id)->update(['sort_order' => $index + 1]);
            }
        });

        return response()->json(MusicTrack::orderBy('sort_order')->get());
    }

    private function storeUpload(Request $request, string $field, string $folder, string $disk): string
    {
        $file = $request->file($field);
        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();

        return $file->storeAs($folder, $filename, $disk);
    }
}
