<?php

namespace App\Http\Controllers\Api\Admin\Content;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Content\MusicTrackRequest;
use App\Models\Content\MusicTrack;
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

    /** Largest upload this server accepts (the stricter of PHP's two limits and the 50 MB rule). */
    public function limits()
    {
        $toMb = function (string $v): float {
            $v = trim($v);
            $n = (float) $v;
            return match (strtolower(substr($v, -1))) {
                'g' => $n * 1024, 'm' => $n, 'k' => $n / 1024, default => $n / 1048576,
            };
        };
        $limits = array_filter([$toMb((string) ini_get('upload_max_filesize')), $toMb((string) ini_get('post_max_size')), 50.0], fn ($v) => $v > 0);

        return response()->json(['max_mb' => (int) floor(min($limits))]);
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
