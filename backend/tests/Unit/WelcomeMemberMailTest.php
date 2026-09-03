<?php

namespace Tests\Unit;

use App\Mail\WelcomeMemberMail;
use App\Models\People\Member;
use App\Services\Mail\MemberWelcomeMailer;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class WelcomeMemberMailTest extends TestCase
{
    public function test_welcome_mail_uses_the_family_subject_and_greeting(): void
    {
        $member = new Member(['name' => 'Priya Sharma', 'email' => 'priya@example.com']);
        $mailable = new WelcomeMemberMail($member);

        $mailable->assertHasSubject('Welcome to Golden Age Spiritual Movement Family');
        $mailable->assertSeeInHtml('Welcome to Golden Age Spiritual Movement Family');
        $mailable->assertSeeInHtml('Dear Priya');
        $mailable->assertSeeInText('Welcome to Golden Age Spiritual Movement Family');
    }

    public function test_mailer_sends_to_the_new_member(): void
    {
        Mail::fake();

        $member = new Member(['name' => 'Priya Sharma', 'email' => 'priya@example.com']);
        app(MemberWelcomeMailer::class)->send($member);

        Mail::assertSent(WelcomeMemberMail::class, function (WelcomeMemberMail $mail) {
            return $mail->hasTo('priya@example.com');
        });
    }

    public function test_mailer_skips_demo_accounts(): void
    {
        Mail::fake();

        $member = new Member(['name' => 'Demo Seeker', 'email' => 'demo@goldenagewisdom.org']);
        app(MemberWelcomeMailer::class)->send($member);

        Mail::assertNothingSent();
    }
}
