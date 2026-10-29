<?php

namespace App\Http\Controllers\Api\Public\Engage;

use App\Http\Controllers\Controller;
use App\Mail\Admin\NewRegistrationFormSubmissionMail;
use App\Models\Engage\RegistrationForm;
use App\Models\Engage\RegistrationFormSubmission;
use App\Models\People\Member;
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

        // Members only: the member's own (Google sign-in) token; each member has one answer, kept up to date.
        $member = null;
        if ($form->members_only) {
            $member = auth('sanctum')->user();
            if (! $member instanceof Member) {
                return response()->json(['message' => 'Please sign in with Google to fill this form.', 'sign_in_required' => true], 401);
            }
        }

        $validator = Validator::make($request->all(), $this->rulesFor($fields));
        $validated = $validator->validate();

        $data = [];
        foreach ($fields as $field) {
            $data[$field->field_key] = $validated[$field->field_key] ?? null;
        }

        $existing = $member ? $form->submissions()->where('member_id', $member->id)->first() : null;
        if ($existing) {
            $existing->update(['data' => $data]);
            $submission = $existing;
        } else {
            $submission = $form->submissions()->create(['data' => $data, 'member_id' => $member?->id]);
            $submission->setRelation('form', $form);
            $this->notifyAdmin($submission);
        }

        return response()->json([
            'success_message' => $form->success_message ?: "You're registered — we'll be in touch soon.",
            'submission_id' => $submission->id,
            'updated' => (bool) $existing,
        ], $existing ? 200 : 201);
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
