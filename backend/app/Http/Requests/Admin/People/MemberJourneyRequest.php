<?php

namespace App\Http\Requests\Admin\People;

use App\Models\People\MemberJourney;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MemberJourneyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'entry_type' => ['required', Rule::in(MemberJourney::ENTRY_TYPES)],
            'content' => ['required_unless:entry_type,qa', 'nullable', 'string', 'max:5000'],
            'question' => ['required_if:entry_type,qa', 'nullable', 'string', 'max:2000'],
            'answer' => ['required_if:entry_type,qa', 'nullable', 'string', 'max:5000'],
        ];
    }
}
