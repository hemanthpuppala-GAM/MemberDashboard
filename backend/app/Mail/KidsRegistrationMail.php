<?php

namespace App\Mail;

use App\Models\Kids\KidRegistration;
use App\Services\Kids\KidsProgram;
use App\Services\Site\GoLive;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** To the parent: confirmation, how to join (Zoom only goes out here and on My family), and the signed copy. */
class KidsRegistrationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public KidRegistration $registration) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Kids Meditation Circle: you are registered — Golden Age Wisdom');
    }

    public function content(): Content
    {
        $groups = collect(KidsProgram::groups())->keyBy('key');
        $kids = $this->registration->kids->where('status', 'active')->values()->map(fn ($k) => [
            'name' => "{$k->first_name} {$k->last_name}",
            'age' => $k->age,
            'group' => $groups[$k->group]['label'] ?? $k->group,
            'times' => collect($groups[$k->group]['zones'] ?? [])->map(fn ($z) => "{$z['time']} {$z['zone']}")->implode(' · '),
            'photos' => $k->media_consent === 'yes' ? 'Yes' : 'No',
        ]);
        $consent = $this->registration->latestConsent;

        return new Content(
            html: 'emails.kids-registered',
            text: 'emails.kids-registered-text',
            with: [
                'r' => $this->registration,
                'kids' => $kids,
                'day' => config('kids.day') ?: 'Weekly',
                'join' => KidsProgram::joinDetails(),
                'consent' => $consent,
                'dashboardUrl' => GoLive::frontendUrl().'/dashboard/family',
                'phone' => config('kids.phone'),
            ],
        );
    }
}
