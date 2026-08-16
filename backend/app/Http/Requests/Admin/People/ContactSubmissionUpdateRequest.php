<?php

namespace App\Http\Requests\Admin\People;

use App\Models\People\ContactSubmission;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ContactSubmissionUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(ContactSubmission::STATUSES)],
        ];
    }
}
