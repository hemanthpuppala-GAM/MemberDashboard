<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class PageContentUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'eyebrow' => ['required', 'string', 'max:80'],
            'title' => ['required', 'string', 'max:160'],
            'description' => ['required', 'string', 'max:2000'],
            'points' => ['nullable', 'array'],
            'points.*' => ['string', 'max:300'],
            'cta_label' => ['nullable', 'string', 'max:60'],
            'cta_href' => ['nullable', 'string', 'max:255'],
            'cta_variant' => ['nullable', 'in:primary,secondary'],
            'reverse' => ['boolean'],
            'image_path' => ['nullable', 'string', 'max:255'],
        ];
    }
}
