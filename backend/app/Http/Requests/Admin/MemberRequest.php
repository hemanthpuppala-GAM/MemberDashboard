<?php

namespace App\Http\Requests\Admin;

use App\Models\Member;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'category' => ['required', Rule::in(Member::CATEGORIES)],
            'summary' => ['nullable', 'string', 'max:5000'],
            'status' => ['required', Rule::in(Member::STATUSES)],
            'assigned_practitioner_id' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }
}
