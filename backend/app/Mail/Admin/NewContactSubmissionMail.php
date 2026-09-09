<?php

namespace App\Mail\Admin;

use App\Mail\Admin\Concerns\BuildsNotificationHtml;
use App\Models\People\ContactSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewContactSubmissionMail extends Mailable
{
    use BuildsNotificationHtml, Queueable, SerializesModels;

    public function __construct(public ContactSubmission $submission)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: "New contact submission — {$this->submission->name}");
    }

    public function content(): Content
    {
        $s = $this->submission;

        $html = $this->wrap('New contact form submission', $this->htmlTable([
            'Name' => $s->name,
            'Email' => $s->email,
            'Phone' => $s->phone,
            'Category' => $s->category,
            'Source' => $s->source === 'member_portal' ? 'Member portal' : 'Website',
            'Message' => $s->message,
            'Submitted' => $s->created_at?->format('d M Y, H:i'),
        ]));

        return new Content(htmlString: $html);
    }
}
