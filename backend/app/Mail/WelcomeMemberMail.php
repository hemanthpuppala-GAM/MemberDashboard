<?php

namespace App\Mail;

use App\Models\People\Member;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class WelcomeMemberMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Member $member) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to Golden Age Spiritual Movement Family',
        );
    }

    public function content(): Content
    {
        $name = trim((string) $this->member->name);
        $firstName = $name !== '' ? Str::of($name)->before(' ')->toString() : 'friend';

        return new Content(
            html: 'emails.welcome-member',
            text: 'emails.welcome-member-text',
            with: [
                'memberName' => $name !== '' ? $name : 'friend',
                'firstName' => $firstName,
                'dashboardUrl' => rtrim((string) config('app.frontend_url'), '/').'/dashboard',
                'siteName' => config('app.name', 'Golden Age Wisdom'),
            ],
        );
    }
}
