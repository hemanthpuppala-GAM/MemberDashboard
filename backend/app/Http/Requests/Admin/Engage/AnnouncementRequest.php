<?php

namespace App\Http\Requests\Admin\Engage;

use App\Models\Engage\Announcement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AnnouncementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:20000'],
            'type' => ['required', Rule::in(Announcement::TYPES)],
            'target_type' => ['required', Rule::in(Announcement::TARGET_TYPES)],
            'target_ids' => ['nullable', 'array'],
            'target_ids.*' => ['integer'],
            'priority' => ['required', Rule::in(Announcement::PRIORITIES)],
            'scheduled_at' => ['nullable', 'date'],
        ];
    }
}
