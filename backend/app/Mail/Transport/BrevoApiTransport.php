<?php

namespace App\Mail\Transport;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Symfony\Component\Mailer\Exception\TransportException;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\MessageConverter;

/**
 * Sends mail through Brevo's transactional email API
 * (https://api.brevo.com/v3/smtp/email) instead of SMTP.
 */
class BrevoApiTransport extends AbstractTransport
{
    private Client $client;

    public function __construct(private readonly string $apiKey, ?Client $client = null)
    {
        parent::__construct();

        $this->client = $client ?? new Client();
    }

    protected function doSend(SentMessage $message): void
    {
        $email = MessageConverter::toEmail($message->getOriginalMessage());

        $from = $email->getFrom()[0] ?? throw new TransportException('Brevo: message has no "from" address.');

        $payload = [
            'sender' => $this->formatAddress($from),
            'to' => $this->formatAddresses($email->getTo()),
            'subject' => (string) $email->getSubject(),
        ];

        if ($cc = $email->getCc()) {
            $payload['cc'] = $this->formatAddresses($cc);
        }

        if ($bcc = $email->getBcc()) {
            $payload['bcc'] = $this->formatAddresses($bcc);
        }

        if ($replyTo = $email->getReplyTo()) {
            $payload['replyTo'] = $this->formatAddress($replyTo[0]);
        }

        $html = $email->getHtmlBody();
        $text = $email->getTextBody();
        $payload['htmlContent'] = $html ?: nl2br(e((string) $text));
        if ($text) {
            $payload['textContent'] = $text;
        }

        $attachments = $this->formatAttachments($email);
        if ($attachments) {
            $payload['attachment'] = $attachments;
        }

        try {
            $response = $this->client->post('https://api.brevo.com/v3/smtp/email', [
                'headers' => [
                    'api-key' => $this->apiKey,
                    'accept' => 'application/json',
                    'content-type' => 'application/json',
                ],
                'json' => $payload,
                'http_errors' => false,
            ]);
        } catch (GuzzleException $e) {
            throw new TransportException('Brevo API request failed: '.$e->getMessage(), 0, $e);
        }

        $status = $response->getStatusCode();

        if ($status >= 300) {
            throw new TransportException("Brevo API error ({$status}): ".$response->getBody());
        }
    }

    private function formatAddress(Address $address): array
    {
        $formatted = ['email' => $address->getAddress()];

        if ($name = $address->getName()) {
            $formatted['name'] = $name;
        }

        return $formatted;
    }

    /** @param Address[] $addresses */
    private function formatAddresses(array $addresses): array
    {
        return array_map($this->formatAddress(...), $addresses);
    }

    private function formatAttachments(\Symfony\Component\Mime\Email $email): array
    {
        $attachments = [];

        foreach ($email->getAttachments() as $attachment) {
            $headers = $attachment->getPreparedHeaders();
            $filename = $headers->getHeaderParameter('Content-Disposition', 'filename') ?? 'attachment';

            $attachments[] = [
                'content' => base64_encode($attachment->getBody()),
                'name' => $filename,
            ];
        }

        return $attachments;
    }

    public function __toString(): string
    {
        return 'brevo+api://api.brevo.com';
    }
}
