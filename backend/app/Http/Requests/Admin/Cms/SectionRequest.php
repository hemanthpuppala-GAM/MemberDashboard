<?php

namespace App\Http\Requests\Admin\Cms;

use App\Models\Cms\PageSection;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(PageSection::TYPES)],
            'status' => ['nullable', Rule::in(PageSection::STATUSES)],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
