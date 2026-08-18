<?php

namespace App\Http\Requests\Public\People;

use Illuminate\Foundation\Http\FormRequest;

class VolunteerApplicationStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['required', 'string', 'max:50'],
            'category_id' => ['required', 'integer', 'exists:volunteer_categories,id'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
