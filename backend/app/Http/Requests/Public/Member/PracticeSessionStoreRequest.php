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
            // zoom / youtube: a live session (logged on return, or added later); own: their own sit added later.
            'via' => ['nullable', 'in:zoom,youtube,own'],
            // "Add a missed sit": the member's own calendar date, today or up to two days back. The window
            // is a day wider each side so members in any time zone fit; the dashboard offers just 3 days.
            'completed_on' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:'.now()->subDays(3)->toDateString(), 'before_or_equal:'.now()->addDay()->toDateString()],
        ];
    }
}
