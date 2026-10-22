<?php

namespace App\Http\Requests\Public\Member;

use Illuminate\Foundation\Http\FormRequest;

class PracticeSessionStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'duration_minutes' => ['required', 'integer', 'min:1', 'max:180'],
            'sit_preset_id' => ['nullable', 'integer', 'exists:sit_presets,id'],
            // Set when the sit was a live session joined from the dashboard (logged on return).
            'via' => ['nullable', 'in:zoom,youtube'],
        ];
    }
}
