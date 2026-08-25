<?php

namespace App\Http\Requests\Public\Member;

use Illuminate\Foundation\Http\FormRequest;

class JournalStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'max:5000'],
        ];
    }
}
