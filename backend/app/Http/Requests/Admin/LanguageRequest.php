<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LanguageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $languageId = $this->route('language')?->id;

        return [
            'name' => ['required', 'string', 'max:100'],
            'native_name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:10', 'unique:languages,code,'.$languageId],
            'direction' => ['required', Rule::in(['ltr', 'rtl'])],
            'is_enabled' => ['boolean'],
            'is_default' => ['boolean'],
        ];
    }
}
