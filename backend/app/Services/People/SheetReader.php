<?php

namespace App\Services\People;

use Anthropic\Client;
use Anthropic\Core\Exceptions\APIConnectionException;
use Anthropic\Core\Exceptions\APIStatusException;
use Anthropic\Core\Exceptions\RateLimitException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Turns an uploaded sign-up list into people [{name, phone, email}] for review before registering:
 *  - CSV / TSV / TXT: read here (a header row with name / phone / email columns is used if present);
 *  - photo (JPG, PNG, WEBP) or PDF of a sheet, handwritten or printed: read by Claude.
 *
 * Nothing is saved here — the rows go back to the screen, a person checks them, then registers.
 */
class SheetReader
{
    public const MAX_PEOPLE = 2000;

    private const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    public static function photosEnabled(): bool
    {
        return filled(config('services.anthropic.key'));
    }

    /** @return array{people: list<array{name: string, phone: string, email: string}>, source: string, note: ?string} */
    public static function read(UploadedFile $file): array
    {
        $mime = $file->getMimeType() ?: '';
        $ext = strtolower($file->getClientOriginalExtension());

        if (in_array($ext, ['csv', 'tsv', 'txt'], true) || str_starts_with($mime, 'text/')) {
            return ['people' => self::fromCsv((string) file_get_contents($file->getRealPath())), 'source' => 'csv', 'note' => null];
        }
        if (in_array($mime, self::IMAGE_TYPES, true) || $mime === 'application/pdf') {
            return self::fromPhoto($file, $mime);
        }
        if (in_array($ext, ['xlsx', 'xls', 'numbers'], true)) {
            throw new RuntimeException('Save the spreadsheet as CSV first (File → Save as / Download → CSV), then upload that.');
        }

        throw new RuntimeException('Upload a CSV file, or a photo (JPG/PNG) or PDF of the list.');
    }

    /** @return list<array{name: string, phone: string, email: string}> */
    public static function fromCsv(string $text): array
    {
        $text = preg_replace('/^\xEF\xBB\xBF/', '', $text); // Excel's BOM
        $lines = array_values(array_filter(preg_split('/\r\n|\r|\n/', $text), fn ($l) => trim($l) !== ''));
        if (! $lines) {
            return [];
        }
        $delimiter = collect([',', ';', "\t", '|'])->sortByDesc(fn ($d) => substr_count($lines[0], $d))->first();
        $rows = array_map(fn ($l) => array_map('trim', str_getcsv($l, $delimiter, '"', '')), $lines);

        // Header row? Find the name / phone / email columns by their titles.
        $col = ['name' => null, 'phone' => null, 'email' => null];
        foreach ($rows[0] as $i => $title) {
            $t = strtolower($title);
            if ($col['email'] === null && preg_match('/e-?mail/', $t)) {
                $col['email'] = $i;
            } elseif ($col['phone'] === null && preg_match('/phone|mobile|whats ?app|contact|number|cell|ph\.?\b/', $t)) {
                $col['phone'] = $i;
            } elseif ($col['name'] === null && preg_match('/name/', $t)) {
                $col['name'] = $i;
            }
        }
        $hasHeader = $col['phone'] !== null || $col['email'] !== null;
        if ($hasHeader) {
            array_shift($rows);
        }

        $people = [];
        foreach ($rows as $cells) {
            if ($hasHeader) {
                $p = ['name' => $cells[$col['name'] ?? -1] ?? '', 'phone' => $cells[$col['phone'] ?? -1] ?? '', 'email' => $cells[$col['email'] ?? -1] ?? ''];
            } else {
                // No header: the cell that looks like a phone / email, the rest is the name.
                $p = ['name' => '', 'phone' => '', 'email' => ''];
                $name = [];
                foreach ($cells as $c) {
                    if ($p['email'] === '' && str_contains($c, '@')) {
                        $p['email'] = $c;
                    } elseif ($p['phone'] === '' && preg_match('/^[+\d][\d\s\-().]{6,}$/', $c)) {
                        $p['phone'] = $c;
                    } elseif ($c !== '') {
                        $name[] = $c;
                    }
                }
                $p['name'] = implode(' ', $name);
            }
            if (trim($p['name'].$p['phone'].$p['email']) !== '') {
                $people[] = array_map(fn ($v) => trim((string) $v), $p);
            }
        }

        return array_slice($people, 0, self::MAX_PEOPLE);
    }

    /** @return array{people: list<array{name: string, phone: string, email: string}>, source: string, note: ?string} */
    private static function fromPhoto(UploadedFile $file, string $mime): array
    {
        if (! self::photosEnabled()) {
            throw new RuntimeException('Reading photos isn’t switched on yet (the server needs ANTHROPIC_API_KEY). Upload a CSV, or type the names in.');
        }

        if ($mime === 'application/pdf') {
            $block = ['type' => 'document', 'source' => ['type' => 'base64', 'mediaType' => 'application/pdf', 'data' => base64_encode((string) file_get_contents($file->getRealPath()))]];
        } else {
            [$data, $mime] = self::shrinkImage($file->getRealPath(), $mime);
            $block = ['type' => 'image', 'source' => ['type' => 'base64', 'mediaType' => $mime, 'data' => base64_encode($data)]];
        }

        $client = new Client(apiKey: (string) config('services.anthropic.key'), baseUrl: config('services.anthropic.base_url') ?: null);
        try {
            $message = $client->beta->messages->create(
                model: (string) config('services.anthropic.model', 'claude-opus-5-5'),
                maxTokens: 16000,
                // If a safety classifier declines, the server retries on a suitable model.
                betas: ['server-side-fallback-2026-07-01'],
                fallbacks: 'default',
                outputConfig: [
                    'effort' => 'medium',
                    'format' => [
                        'type' => 'json_schema',
                        'schema' => [
                            'type' => 'object',
                            'properties' => [
                                'people' => [
                                    'type' => 'array',
                                    'items' => [
                                        'type' => 'object',
                                        'properties' => [
                                            'name' => ['type' => 'string'],
                                            'phone' => ['type' => 'string'],
                                            'email' => ['type' => 'string'],
                                        ],
                                        'required' => ['name', 'phone', 'email'],
                                        'additionalProperties' => false,
                                    ],
                                ],
                                'unclear' => ['type' => 'integer'],
                            ],
                            'required' => ['people', 'unclear'],
                            'additionalProperties' => false,
                        ],
                    ],
                ],
                messages: [[
                    'role' => 'user',
                    'content' => [
                        $block,
                        ['type' => 'text', 'text' => <<<'PROMPT'
                        This is a sign-up sheet from a meditation gathering in India (handwritten or printed; it may be a table, a notebook page or a printed spreadsheet). List every person on it, one entry per row, top to bottom.

                        For each person give:
                        - name: as written (transliterate to English letters if it is in another script; keep initials like "K." as written)
                        - phone: the digits exactly as written, including any +91 / 0 prefix; "" if none
                        - email: lower-case; "" if none

                        Skip header rows, column titles, totals and crossed-out entries. Never guess a digit: if a phone number is partly unreadable, write the digits you can read and put "?" for each unreadable one. Count in "unclear" how many entries had anything you could not read with confidence.
                        PROMPT],
                    ],
                ]],
            );
        } catch (RateLimitException|APIConnectionException $e) {
            Log::warning('Sheet photo read failed (retryable): '.$e->getMessage());
            throw new RuntimeException('The photo reader is busy right now — try again in a minute.');
        } catch (APIStatusException $e) {
            Log::error('Sheet photo read failed: '.$e->getMessage());
            throw new RuntimeException('Could not read that photo. Try a clearer, straight-on picture, or upload a CSV.');
        }

        if ($message->stopReason === 'refusal') {
            throw new RuntimeException('Could not read that photo. Try a clearer, straight-on picture, or upload a CSV.');
        }
        $json = null;
        foreach ($message->content as $b) {
            if ($b->type === 'text') {
                $json = json_decode($b->text, true);
                break;
            }
        }
        if (! is_array($json) || ! isset($json['people']) || $message->stopReason === 'max_tokens') {
            throw new RuntimeException('Could not read the whole list from that photo. Try one page at a time.');
        }

        $people = collect($json['people'])
            ->map(fn ($p) => ['name' => trim((string) ($p['name'] ?? '')), 'phone' => trim((string) ($p['phone'] ?? '')), 'email' => strtolower(trim((string) ($p['email'] ?? '')))])
            ->filter(fn ($p) => $p['name'].$p['phone'].$p['email'] !== '')
            ->take(self::MAX_PEOPLE)->values()->all();
        $unclear = (int) ($json['unclear'] ?? 0);

        return [
            'people' => $people,
            'source' => 'photo',
            'note' => $unclear > 0 ? "{$unclear} ".($unclear === 1 ? 'entry was' : 'entries were').' hard to read (marked with ?). Please check them against the sheet.' : null,
        ];
    }

    /**
     * Phone photos are often 4–10 MB; the API takes up to 5 MB per image and reads text fine at
     * ~2000px. Scale down and re-encode as JPEG when GD is available.
     *
     * @return array{0: string, 1: string} [bytes, mime]
     */
    private static function shrinkImage(string $path, string $mime): array
    {
        $bytes = (string) file_get_contents($path);
        if (! function_exists('imagecreatefromstring') || ($img = @imagecreatefromstring($bytes)) === false) {
            if (strlen($bytes) > 5 * 1024 * 1024) {
                throw new RuntimeException('That photo is too large. Take it at a lower resolution (under 5 MB) and try again.');
            }

            return [$bytes, $mime];
        }
        $w = imagesx($img);
        $h = imagesy($img);
        $max = 2000;
        if (max($w, $h) > $max || strlen($bytes) > 4 * 1024 * 1024) {
            $scale = min(1, $max / max($w, $h));
            $img = imagescale($img, (int) round($w * $scale), (int) round($h * $scale));
        } elseif ($mime !== 'image/gif') {
            return [$bytes, $mime];
        }
        ob_start();
        imagejpeg($img, null, 85);

        return [(string) ob_get_clean(), 'image/jpeg'];
    }
}
