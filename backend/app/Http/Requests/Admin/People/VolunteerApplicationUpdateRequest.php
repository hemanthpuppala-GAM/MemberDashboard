<?php

namespace App\Http\Requests\Admin\People;

use App\Models\People\VolunteerApplication;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VolunteerApplicationUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(VolunteerApplication::STATUSES)],
        ];
    }
}
