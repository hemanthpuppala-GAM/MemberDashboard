<?php

namespace App\Http\Requests;

use App\Models\ContactSubmission;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ContactStoreRequest extends FormRequest
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
            'category' => ['required', Rule::in(ContactSubmission::CATEGORIES)],
            'message' => ['required', 'string', 'max:5000'],
        ];
    }
}
