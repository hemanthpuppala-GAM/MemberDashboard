<?php

namespace App\Http\Requests\Admin\Engage;

use App\Models\Engage\Broadcast;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BroadcastRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(Broadcast::TYPES)],
            'content_text' => ['nullable', 'string', 'max:2000'],
            'content_video_url' => ['nullable', 'url', 'max:500'],
            'cta_label' => ['nullable', 'string', 'max:100'],
            'cta_url' => ['nullable', 'string', 'max:500'],
            'target_pages' => ['nullable', 'array'],
            'target_pages.*' => ['string'],
            'audience' => ['required', Rule::in(Broadcast::AUDIENCES)],
            'show_after_seconds' => ['nullable', 'integer', 'min:0'],
            'frequency' => ['required', Rule::in(Broadcast::FREQUENCIES)],
            'active_from' => ['nullable', 'date'],
            'active_until' => ['nullable', 'date', 'after_or_equal:active_from'],
            'status' => ['required', Rule::in(Broadcast::STATUSES)],
        ];
    }
}
