<?php

namespace App\Http\Controllers\Api\Public\People;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\People\ContactStoreRequest;
use App\Mail\Admin\NewContactSubmissionMail;
use App\Models\People\ContactSubmission;
use App\Models\People\Member;
use App\Models\Settings\Setting;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(ContactStoreRequest $request)
    {
        $data = $request->validated();
        $member = $request->user('sanctum');

        if ($member instanceof Member) {
            $data['member_id'] = $member->id;
            $data['source'] = 'member_portal';
        }

        $submission = ContactSubmission::create($data);

        $this->notifyAdmin($submission);

        return response()->json($submission, 201);
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
