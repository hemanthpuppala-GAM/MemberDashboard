<?php

namespace App\Http\Requests\Admin\Cms;

use Illuminate\Foundation\Http\FormRequest;

class EventStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** Browsers still report some old zone names (Chrome: "Asia/Calcutta"); store the current ones. */
    private const ZONE_ALIASES = [
        'Asia/Calcutta' => 'Asia/Kolkata',
        'Asia/Katmandu' => 'Asia/Kathmandu',
        'Asia/Saigon' => 'Asia/Ho_Chi_Minh',
        'Asia/Rangoon' => 'Asia/Yangon',
        'Europe/Kiev' => 'Europe/Kyiv',
    ];

    protected function prepareForValidation(): void
    {
        if ($tz = $this->input('timezone')) {
            $this->merge(['timezone' => self::ZONE_ALIASES[$tz] ?? $tz]);
        }
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:2000'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'recurrence' => ['sometimes', 'in:none,daily'],
            'timezone' => ['nullable', 'timezone:all_with_bc'],
            'location' => ['nullable', 'string', 'max:160'],
            'join_url' => ['nullable', 'string', 'max:255'],
            'is_published' => ['boolean'],
            'host_practitioner_id' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }
}
