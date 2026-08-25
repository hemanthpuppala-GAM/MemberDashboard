<?php

namespace App\Http\Requests\Admin\Content;

use App\Models\Content\SitPreset;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SitPresetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'duration_minutes' => ['required', 'integer', 'min:1', 'max:180'],
            'music_track_id' => ['nullable', 'integer', 'exists:music_tracks,id'],
            'status' => ['required', Rule::in(SitPreset::STATUSES)],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
