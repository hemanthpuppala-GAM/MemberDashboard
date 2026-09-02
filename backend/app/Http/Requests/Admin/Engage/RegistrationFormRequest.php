<?php

namespace App\Http\Requests\Admin\Engage;

use App\Models\Engage\RegistrationForm;
use App\Models\Engage\RegistrationFormField;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegistrationFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $formId = $this->route('registrationForm')?->id;

        return [
            'title' => ['required', 'string', 'max:160'],
            'slug' => ['required', 'string', 'max:191', 'alpha_dash', 'unique:registration_forms,slug,'.$formId],
            'description' => ['nullable', 'string', 'max:2000'],
            'status' => ['required', Rule::in(RegistrationForm::STATUSES)],
            'submit_label' => ['nullable', 'string', 'max:60'],
            'success_message' => ['nullable', 'string', 'max:500'],

            'fields' => ['array'],
            'fields.*.label' => ['required', 'string', 'max:160'],
            'fields.*.field_key' => ['required', 'string', 'max:80', 'regex:/^[a-z0-9_]+$/'],
            'fields.*.type' => ['required', Rule::in(RegistrationFormField::TYPES)],
            'fields.*.is_required' => ['boolean'],
            'fields.*.options' => ['nullable', 'array'],
            'fields.*.options.*' => ['string', 'max:160'],
            'fields.*.placeholder' => ['nullable', 'string', 'max:160'],
        ];
    }
}
