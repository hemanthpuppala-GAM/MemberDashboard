<?php

namespace App\Http\Requests\Public\People;

use App\Mail\AskReceivedMail;
use App\Models\People\ContactSubmission;
use App\Models\People\Member;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ContactStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Anonymous QR/web "Ask" questions go out on WhatsApp, and signed-in members are
        // already known — neither needs to type contact details.
        $contactOptional = $this->input('source') === 'qr_web' || $this->user('sanctum') instanceof Member;
        $presence = $contactOptional ? 'nullable' : 'required';

        return [
            'name' => [$presence, 'string', 'max:120'],
            'email' => [$presence, 'email', 'max:190'],
            'phone' => [$presence, 'string', 'max:50'],
            'category' => ['required', Rule::in(ContactSubmission::CATEGORIES)],
            'message' => ['required', 'string', 'max:5000'],
            'source' => ['nullable', Rule::in(['website', 'qr_web'])],
            'lang' => ['nullable', Rule::in(AskReceivedMail::LANGS)],
        ];
    }
}
