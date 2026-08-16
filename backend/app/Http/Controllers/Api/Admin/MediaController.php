<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MediaUpdateRequest;
use App\Http\Requests\Admin\MediaUploadRequest;
use App\Models\Media;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    public function index()
    {
        return response()->json(Media::latest()->get());
    }

    public function store(MediaUploadRequest $request)
    {
        $file = $request->file('file');
        $disk = config('filesystems.uploads_disk', 'public');
        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs('media', $filename, $disk);

        $media = Media::create([
            'filename' => $filename,
            'original_name' => $file->getClientOriginalName(),
            'disk' => $disk,
            'path' => $path,
            'url' => Storage::disk($disk)->url($path),
            'mime_type' => $file->getMimeType(),
            'size_bytes' => $file->getSize(),
            'alt_text' => $request->validated('alt_text'),
            'folder' => $request->validated('folder') ?: 'General',
            'uploaded_by' => $request->user()->id,
        ]);

        return response()->json($media, 201);
    }

    public function update(MediaUpdateRequest $request, Media $media)
    {
        $media->update($request->validated());

        return response()->json($media);
    }

    public function destroy(Media $media)
    {
        Storage::disk($media->disk)->delete($media->path);
        $media->delete();

        return response()->json(null, 204);
    }
}
