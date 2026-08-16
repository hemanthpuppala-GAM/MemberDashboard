<?php

namespace App\Http\Controllers\Api\Admin\Content;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Content\TestimonialRequest;
use App\Models\Content\Testimonial;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TestimonialController extends Controller
{
    public function index()
    {
        return response()->json(Testimonial::orderBy('sort_order')->get());
    }

    public function store(TestimonialRequest $request)
    {
        $data = $request->safe()->except('photo');
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
        $data = $request->safe()->except('photo');

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

    private function storePhoto($request): string
    {
        $disk = config('filesystems.uploads_disk', 'public');
        $file = $request->file('photo');
        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs('testimonials', $filename, $disk);

        return Storage::disk($disk)->url($path);
    }
}
