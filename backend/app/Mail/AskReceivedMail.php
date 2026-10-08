<?php

namespace App\Mail;

use App\Models\People\Member;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Acknowledgement sent to a member after they ask a question (Ask page / dashboard tab). */
class AskReceivedMail extends Mailable
{
    use Queueable, SerializesModels;

    public const LANGS = ['en', 'te', 'kn'];

    private const COPY = [
        'en' => [
            'subject' => 'We received your question — Golden Age Wisdom',
            'greeting' => 'Namaste :name,',
            'body' => 'We have received your question. Thank you. A volunteer will get back to you as soon as possible.',
            'signoff' => 'Golden Age Wisdom seva team',
        ],
        'te' => [
            'subject' => 'మీ ప్రశ్న అందింది — Golden Age Wisdom',
            'greeting' => 'నమస్కారం :name,',
            'body' => 'మీ ప్రశ్న మాకు అందింది. ధన్యవాదాలు. మా స్వచ్ఛంద సేవకుడు వీలైనంత త్వరగా జవాబు ఇస్తారు.',
            'signoff' => 'Golden Age Wisdom సేవా బృందం',
        ],
        'kn' => [
            'subject' => 'ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಸ್ವೀಕರಿಸಲಾಗಿದೆ — Golden Age Wisdom',
            'greeting' => 'ನಮಸ್ಕಾರ :name,',
            'body' => 'ನಿಮ್ಮ ಪ್ರಶ್ನೆ ನಮಗೆ ತಲುಪಿದೆ. ಧನ್ಯವಾದಗಳು. ನಮ್ಮ ಸ್ವಯಂಸೇವಕರು ಆದಷ್ಟು ಬೇಗ ಉತ್ತರಿಸುತ್ತಾರೆ.',
            'signoff' => 'Golden Age Wisdom ಸೇವಾ ತಂಡ',
        ],
    ];

    public function __construct(public Member $member, public string $lang = 'en')
    {
        if (! in_array($this->lang, self::LANGS, true)) {
            $this->lang = 'en';
        }
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: self::COPY[$this->lang]['subject']);
    }

    public function content(): Content
    {
        $copy = self::COPY[$this->lang];
        $name = trim((string) $this->member->name);

        return new Content(
            html: 'emails.ask-received',
            text: 'emails.ask-received-text',
            with: [
                'greeting' => str_replace(':name', $name, $copy['greeting']),
                'bodyLine' => $copy['body'],
                'signoff' => $copy['signoff'],
            ],
        );
    }
}
