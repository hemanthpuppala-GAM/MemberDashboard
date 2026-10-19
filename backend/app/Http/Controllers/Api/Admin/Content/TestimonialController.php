<?php

namespace App\Http\Controllers\Api\Admin\Content;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Content\TestimonialRequest;
use App\Models\Content\Testimonial;
use App\Services\Content\YouTubeFeed;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TestimonialController extends Controller
{
    public function index()
    {
        return response()->json(Testimonial::orderBy('sort_order')->get());
    }

    /**
     * Latest Shorts from the channel, to pick as video testimonials; marks the ones already added.
     * Read fresh each time (a just-posted Short shows up), which also updates the public list.
     */
    public function youtube()
    {
        try {
            $feed = YouTubeFeed::refresh();
        } catch (\Throwable $e) {
            report($e);

            return response()->json(['message' => 'Could not read the YouTube channel right now. You can still paste a Shorts link into a testimonial.'], 502);
        }
        $used = Testimonial::videosReady()
            ? Testimonial::whereNotNull('video_url')->pluck('video_url')->map(fn ($u) => preg_match('/(?:shorts\/|v=|youtu\.be\/|embed\/)([\w-]{6,})/', (string) $u, $m) ? $m[1] : null)->filter()->all()
            : [];
        $feed['items'] = array_map(fn ($v) => $v + ['added' => in_array($v['id'], $used, true)], $feed['items']);

        return response()->json($feed);
    }

    public function store(TestimonialRequest $request)
    {
        $data = $this->fields($request);
        $data['created_by'] = $request->user()->id;
        $data['sort_order'] ??= Testimonial::count() + 1;

        if ($request->hasFile('photo')) {
            $data['photo_path'] = $this->storePhoto($request);
        }

        $testimonial = Testimonial::create($data);

        return response()->json($testimonial, 201);
    }

    public function update(TestimonialRequest $request, Testimonial $testimonial)
    {
        $data = $this->fields($request);

        if ($request->hasFile('photo')) {
            $data['photo_path'] = $this->storePhoto($request);
        }

        $testimonial->update($data);

        return response()->json($testimonial->fresh());
    }

    public function destroy(Testimonial $testimonial)
    {
        $testimonial->delete();

        return response()->json(null, 204);
    }

    /** Validated fields; an uploaded video wins over a pasted link. Video fields wait for the migration. */
    private function fields(TestimonialRequest $request): array
    {
        $data = $request->safe()->except(['photo', 'video', 'remove_video']);
        $data['quote'] = (string) ($data['quote'] ?? '');

        if (! Testimonial::videosReady()) {
            unset($data['video_url'], $data['place']);

            return $data;
        }
        if ($request->boolean('remove_video')) {
            $data['video_url'] = null;
        }
        if ($request->hasFile('video')) {
            $disk = config('filesystems.uploads_disk', 'public');
            $file = $request->file('video');
            $path = $file->storeAs('testimonials/videos', Str::uuid().'.'.strtolower($file->getClientOriginalExtension() ?: 'mp4'), $disk);
            $data['video_url'] = Storage::disk($disk)->url($path);
        }

        return $data;
    }

    private function storePhoto($request): string
    {
        $disk = config('filesystems.uploads_disk', 'public');
        $file = $request->file('photo');
        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs('testimonials', $filename, $disk);

        return Storage::disk($disk)->url($path);
    }
}
