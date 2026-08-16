<?php

namespace App\Http\Requests\Admin;

use App\Models\Page;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $pageId = $this->route('page')?->id;

        return [
            'slug' => ['required', 'string', 'max:191', 'alpha_dash', 'unique:pages,slug,'.$pageId],
            'title' => ['required', 'string', 'max:255'],
            'status' => ['required', Rule::in(Page::STATUSES)],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
