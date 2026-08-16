<?php

namespace App\Http\Requests\Admin\Content;

use App\Models\Content\MusicTrack;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MusicTrackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isCreate = $this->isMethod('post');

        return [
            'title' => ['required', 'string', 'max:255'],
            'artist' => ['nullable', 'string', 'max:255'],
            'category' => ['required', Rule::in(MusicTrack::CATEGORIES)],
            'description' => ['nullable', 'string', 'max:2000'],
            'status' => ['required', Rule::in(MusicTrack::STATUSES)],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'file' => [$isCreate ? 'required' : 'nullable', 'file', 'mimes:mp3,wav,m4a,mp4,ogg', 'max:51200'],
            'cover' => ['nullable', 'image', 'max:5120'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
