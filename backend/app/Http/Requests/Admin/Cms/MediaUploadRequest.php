<?php

namespace App\Http\Requests\Admin\Cms;

use Illuminate\Foundation\Http\FormRequest;

class MediaUploadRequest extends FormRequest
{
    /** Videos (background clips) need far more headroom than photos — capped separately so images can't quietly balloon too. */
    private const MAX_IMAGE_KB = 10240;
    private const MAX_VIDEO_KB = 30720;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isVideo = str_starts_with((string) $this->file('file')?->getMimeType(), 'video');

        return [
            'file' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,gif,webp,svg,mp4,webm',
                'max:' . ($isVideo ? self::MAX_VIDEO_KB : self::MAX_IMAGE_KB),
            ],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'folder' => ['nullable', 'string', 'max:100'],
        ];
    }
}
