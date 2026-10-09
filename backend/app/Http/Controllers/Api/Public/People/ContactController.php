<?php

namespace App\Http\Controllers\Api\Public\People;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\People\ContactStoreRequest;
use App\Mail\Admin\NewContactSubmissionMail;
use App\Mail\AskReceivedMail;
use App\Models\People\ContactSubmission;
use App\Models\People\Member;
use App\Models\Settings\Setting;
use App\Services\Mail\SmtpSettings;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(ContactStoreRequest $request)
    {
        $data = $request->validated();
        $lang = $data['lang'] ?? 'en';
        unset($data['lang']);
        $member = $request->user('sanctum');

        if ($member instanceof Member) {
            $data['member_id'] = $member->id;
            $data['source'] = 'member_portal';
            $data['name'] = $data['name'] ?? $member->name;
            $data['email'] = $data['email'] ?? $member->email;
            $data['phone'] = $data['phone'] ?? $member->phone;
        }

        // name/email columns are NOT NULL; anonymous QR questions have neither.
        $data['name'] = $data['name'] ?? 'Visitor (QR / web)';
        $data['email'] = $data['email'] ?? '';
        $data['source'] = $data['source'] ?? 'website';

        $submission = ContactSubmission::create($data);

        $this->notifyAdmin($submission);

        $ackSent = $member instanceof Member && $this->acknowledge($member, $lang);

        return response()->json($submission->toArray() + ['ack_sent' => $ackSent], 201);
    }

    /** "We received your question" mail to the member, cc the seva inbox. */
    private function acknowledge(Member $member, string $lang): bool
    {
        if (! filled($member->email)) {
            return false;
        }

        try {
            SmtpSettings::apply();
            $mail = Mail::to($member->email);
            if (filled(config('services.support.cc_email'))) {
                $mail->cc(config('services.support.cc_email'));
            }
            $mail->send(new AskReceivedMail($member, $lang));

            return true;
        } catch (\Throwable $e) {
            Log::warning('Ask acknowledgement email failed: '.$e->getMessage(), ['member_id' => $member->id]);

            return false;
        }
    }

    private function notifyAdmin(ContactSubmission $submission): void
    {
        if (! Setting::notifyOnSubmission()) {
            return;
        }

        try {
            Mail::to(Setting::adminEmail())->send(new NewContactSubmissionMail($submission));
        } catch (\Throwable $e) {
            Log::error('Failed to send new-contact-submission notification: '.$e->getMessage());
        }
    }
}
