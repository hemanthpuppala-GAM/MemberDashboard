<?php

namespace App\Http\Requests\Admin\Content;

use App\Models\Content\Testimonial;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TestimonialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'role' => ['nullable', 'string', 'max:255'],
            // A video testimonial may skip the written quote (it becomes the caption when given).
            'quote' => ['required_without_all:video_url,video', 'nullable', 'string', 'max:2000'],
            'place' => ['nullable', 'string', 'max:120'],
            'video_url' => ['nullable', 'url:https', 'max:500'],
            'video' => ['nullable', 'file', 'mimetypes:video/mp4,video/webm,video/quicktime', 'max:204800'],
            'remove_video' => ['boolean'],
            'rating' => ['required', 'integer', 'between:1,5'],
            'status' => ['required', Rule::in(Testimonial::STATUSES)],
            'is_featured' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'photo' => ['nullable', 'image', 'max:5120'],
        ];
    }
}
