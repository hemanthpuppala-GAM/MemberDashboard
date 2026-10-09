<?php

namespace App\Http\Requests\Public\People;

use App\Models\People\VolunteerApplication;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VolunteerApplicationStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $activeTeam = Rule::exists('volunteer_categories', 'slug')->where('is_active', true);

        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['required', 'string', 'max:50'],
            'occupation' => ['nullable', 'string', 'max:120'],
            'city' => ['nullable', 'string', 'max:120'],
            'lang' => ['nullable', 'string', 'max:20'],
            // Pick one or more teams (slugs); category_id is still accepted from older clients.
            'teams' => ['required_without:category_id', 'nullable', 'array', 'min:1', 'max:7'],
            'teams.*' => ['string', 'distinct', $activeTeam],
            'category_id' => ['required_without:teams', 'nullable', 'integer', 'exists:volunteer_categories,id'],
            'availability' => ['nullable', 'string', Rule::in(VolunteerApplication::AVAILABILITY)],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
