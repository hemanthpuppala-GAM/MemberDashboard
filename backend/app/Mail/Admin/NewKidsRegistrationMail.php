<?php

namespace App\Mail\Admin;

use App\Mail\Admin\Concerns\BuildsNotificationHtml;
use App\Models\Kids\KidRegistration;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewKidsRegistrationMail extends Mailable
{
    use BuildsNotificationHtml, Queueable, SerializesModels;

    public function __construct(public KidRegistration $registration) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "Kids Circle registration — {$this->registration->guardian_name}");
    }

    public function content(): Content
    {
        $r = $this->registration;
        $rows = [
            'Parent' => "{$r->guardian_name} ({$r->relationship})",
            'Email' => $r->email,
            'Phone' => $r->phone,
            'City' => "{$r->city}, {$r->state}",
        ];
        foreach ($r->kids->where('status', 'active') as $i => $k) {
            $rows['Child '.($i + 1)] = "{$k->first_name} {$k->last_name}, {$k->age} · {$k->group} · photos: {$k->media_consent}";
        }
        $rows['Signed'] = $r->latestConsent?->signed_at?->format('d M Y, H:i').' (v'.$r->latestConsent?->version.')';

        return new Content(htmlString: $this->wrap('New Kids Circle registration', $this->htmlTable($rows)));
    }
}
