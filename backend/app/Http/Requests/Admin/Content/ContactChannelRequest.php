<?php

namespace App\Http\Requests\Admin\Content;

use App\Models\Content\ContactChannel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ContactChannelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(ContactChannel::TYPES)],
            'label' => ['required', 'string', 'max:255'],
            'value' => ['required', 'string', 'max:500'],
            'is_visible' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
