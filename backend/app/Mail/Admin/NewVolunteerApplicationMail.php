<?php

namespace App\Mail\Admin;

use App\Mail\Admin\Concerns\BuildsNotificationHtml;
use App\Models\People\VolunteerApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewVolunteerApplicationMail extends Mailable
{
    use BuildsNotificationHtml, Queueable, SerializesModels;

    public function __construct(public VolunteerApplication $application)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: "New volunteer application — {$this->application->name}");
    }

    public function content(): Content
    {
        $a = $this->application;

        $html = $this->wrap('New volunteer application', $this->htmlTable([
            'Name' => $a->name,
            'Email' => $a->email,
            'Phone' => $a->phone,
            'Category' => $a->category?->name,
            'Notes' => $a->notes,
            'Submitted' => $a->created_at?->format('d M Y, H:i'),
        ]));

        return new Content(htmlString: $html);
    }
}
