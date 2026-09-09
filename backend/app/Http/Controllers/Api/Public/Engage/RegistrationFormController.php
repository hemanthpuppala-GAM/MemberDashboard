<?php

namespace App\Http\Controllers\Api\Public\Engage;

use App\Http\Controllers\Controller;
use App\Mail\Admin\NewRegistrationFormSubmissionMail;
use App\Models\Engage\RegistrationForm;
use App\Models\Engage\RegistrationFormSubmission;
use App\Models\Settings\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class RegistrationFormController extends Controller
{
    public function show(string $slug)
    {
        $form = RegistrationForm::where('slug', $slug)->where('status', 'published')->firstOrFail();

        return response()->json($form->load('fields'));
    }

    public function submit(Request $request, string $slug)
    {
        $form = RegistrationForm::where('slug', $slug)->where('status', 'published')->firstOrFail();
        $fields = $form->fields;

        $validator = Validator::make($request->all(), $this->rulesFor($fields));
        $validated = $validator->validate();

        $data = [];
        foreach ($fields as $field) {
            $data[$field->field_key] = $validated[$field->field_key] ?? null;
        }

        $submission = $form->submissions()->create(['data' => $data]);
        $submission->setRelation('form', $form);

        $this->notifyAdmin($submission);

        return response()->json([
            'success_message' => $form->success_message ?: "You're registered — we'll be in touch soon.",
            'submission_id' => $submission->id,
        ], 201);
    }

    private function notifyAdmin(RegistrationFormSubmission $submission): void
    {
        if (! Setting::notifyOnSubmission()) {
            return;
        }

        try {
            Mail::to(Setting::adminEmail())->send(new NewRegistrationFormSubmissionMail($submission));
        } catch (\Throwable $e) {
            Log::error('Failed to send new-registration-form-submission notification: '.$e->getMessage());
        }
    }

    private function rulesFor($fields): array
    {
        $rules = [];

        foreach ($fields as $field) {
            $required = $field->is_required ? 'required' : 'nullable';

            $rules[$field->field_key] = match ($field->type) {
                'email' => [$required, 'email', 'max:190'],
                'number' => [$required, 'numeric'],
                'date' => [$required, 'date'],
                'checkbox' => [$field->is_required ? 'accepted' : 'nullable', 'boolean'],
                'select', 'radio' => [$required, Rule::in($field->options ?? [])],
                default => [$required, 'string', 'max:2000'],
            };
        }

        return $rules;
    }
}
