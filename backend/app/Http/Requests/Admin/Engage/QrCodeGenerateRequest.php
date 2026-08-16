<?php

namespace App\Http\Requests\Admin\Engage;

use App\Models\Engage\QrCode;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QrCodeGenerateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(QrCode::TYPES)],
            'input_data' => ['required', 'array'],
            'options' => ['nullable', 'array'],
            'options.size' => ['nullable', 'integer', 'min:64', 'max:1024'],
            'options.fg' => ['nullable', 'string', 'max:9'],
            'options.bg' => ['nullable', 'string', 'max:9'],
            'options.errorCorrection' => ['nullable', 'in:L,M,Q,H'],
        ];
    }
}
