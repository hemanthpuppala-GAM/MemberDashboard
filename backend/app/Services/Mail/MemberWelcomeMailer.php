<?php

namespace App\Services\Mail;

use App\Mail\WelcomeMemberMail;
use App\Models\People\Member;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class MemberWelcomeMailer
{
    public function send(Member $member): void
    {
        if (! $this->shouldSend($member)) {
            return;
        }

        try {
            SmtpSettings::apply();
            Mail::to($member->email)->send(new WelcomeMemberMail($member));
        } catch (\Throwable $e) {
            report($e);
            Log::warning('Welcome email failed to send.', [
                'member_id' => $member->id,
                'email' => $member->email,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function shouldSend(Member $member): bool
    {
        $email = strtolower(trim((string) $member->email));

        if ($email === '' || $email === 'demo@goldenagewisdom.org') {
            return false;
        }

        // Local OAuth bypass accounts (e.g. google.dev@goldenagewisdom.org).
        if (str_ends_with($email, '.dev@goldenagewisdom.org')) {
            return false;
        }

        return true;
    }
}
