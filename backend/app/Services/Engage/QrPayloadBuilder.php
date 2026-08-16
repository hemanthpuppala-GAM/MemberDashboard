<?php

namespace App\Services\Engage;

class QrPayloadBuilder
{
    public static function build(string $type, array $data): string
    {
        return match ($type) {
            'url', 'text' => (string) ($data['url'] ?? $data['text'] ?? ''),
            'email' => sprintf('mailto:%s?subject=%s&body=%s', $data['address'] ?? '', rawurlencode($data['subject'] ?? ''), rawurlencode($data['body'] ?? '')),
            'phone' => 'tel:'.($data['phone'] ?? ''),
            'sms' => sprintf('smsto:%s:%s', $data['phone'] ?? '', $data['message'] ?? ''),
            'vcard' => self::vcard($data),
            'wifi' => sprintf('WIFI:T:%s;S:%s;P:%s;;', $data['encryption'] ?? 'WPA', $data['ssid'] ?? '', $data['password'] ?? ''),
            'location' => $data['mapsUrl'] ?? sprintf('geo:%s,%s', $data['lat'] ?? 0, $data['lng'] ?? 0),
            default => '',
        };
    }

    private static function vcard(array $data): string
    {
        return implode("\n", array_filter([
            'BEGIN:VCARD',
            'VERSION:3.0',
            'N:'.($data['name'] ?? ''),
            isset($data['email']) ? 'EMAIL:'.$data['email'] : null,
            isset($data['phone']) ? 'TEL:'.$data['phone'] : null,
            isset($data['address']) ? 'ADR:;;'.$data['address'] : null,
            isset($data['website']) ? 'URL:'.$data['website'] : null,
            'END:VCARD',
        ]));
    }
}
