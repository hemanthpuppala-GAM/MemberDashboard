<?php

namespace App\Mail\Admin;

use App\Mail\Admin\Concerns\BuildsNotificationHtml;
use App\Models\Engage\RegistrationFormSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewRegistrationFormSubmissionMail extends Mailable
{
    use BuildsNotificationHtml, Queueable, SerializesModels;

    public function __construct(public RegistrationFormSubmission $submission)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: "New submission — {$this->submission->form->title}");
    }

    public function content(): Content
    {
        $rows = [];
        foreach ($this->submission->form->fields as $field) {
            $value = $this->submission->data[$field->field_key] ?? null;
            $rows[$field->label] = is_bool($value) ? ($value ? 'Yes' : 'No') : $value;
        }
        $rows['Submitted'] = $this->submission->created_at?->format('d M Y, H:i');

        $html = $this->wrap("New submission — {$this->submission->form->title}", $this->htmlTable($rows));

        return new Content(htmlString: $html);
    }
}
