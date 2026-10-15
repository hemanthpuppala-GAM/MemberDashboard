<?php

namespace App\Services\People;

use App\Models\People\MembershipDrive;
use Illuminate\Support\Facades\DB;

/**
 * Bulk sign-up for a membership drive. Each pasted line is one person:
 *
 *   9876543210
 *   9876543210, Asha Rao
 *   Asha Rao, +91 98765 43210, asha@example.com
 *
 * A line of only numbers may hold several phones ("98765 43210 / 98765 43211" is read as
 * one phone; "9876543210 9876543211" as two). Existing members (same phone or email) are
 * reported with their member ID and left as they are.
 */
class DriveSignup
{
    public const MAX_LINES = 2000;

    /** @return array<int, array{name: string, phone: ?string, email: ?string, line: string}> */
    public static function parse(string $text): array
    {
        $people = [];
        foreach (preg_split('/\r\n|\r|\n/', $text) as $raw) {
            $line = trim($raw);
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            // Only digits and separators: one or more bare phone numbers.
            if (! preg_match('/[\p{L}@]/u', $line)) {
                if (MemberNumbers::phoneKey($line) && strlen(preg_replace('/\D+/', '', $line)) <= 13) {
                    $people[] = ['name' => '', 'phone' => $line, 'email' => null, 'line' => $line];
                } else {
                    foreach (preg_split('/[\s,;|\/]+/', $line) as $token) {
                        if ($token !== '') {
                            $people[] = ['name' => '', 'phone' => $token, 'email' => null, 'line' => $token];
                        }
                    }
                }

                continue;
            }

            $phone = null;
            $email = null;
            $name = [];
            foreach (preg_split('/\s*[,;\t|]\s*/', $line) as $part) {
                if ($part === '') {
                    continue;
                }
                if (! $email && str_contains($part, '@')) {
                    $email = strtolower($part);
                } elseif (! $phone && preg_match('/^[+\d?][\d\s\-().?]{6,}$/', $part)) {
                    $phone = $part;
                } else {
                    $name[] = $part;
                }
            }
            $people[] = ['name' => trim(implode(' ', $name)), 'phone' => $phone, 'email' => $email, 'line' => $line];
        }

        return array_slice($people, 0, self::MAX_LINES);
    }

    /**
     * @return array{rows: array<int, array<string, mixed>>, summary: array<string, int>}
     */
    public static function run(MembershipDrive $drive, string $text, bool $dryRun): array
    {
        $rows = [];
        $seen = [];

        $work = function () use ($drive, $text, $dryRun, &$rows, &$seen) {
            foreach (self::parse($text) as $p) {
                // "98765 4??10": digits a photo reader couldn't make out — never register a guessed number.
                if (str_contains((string) $p['phone'], '?')) {
                    $rows[] = ['line' => $p['line'], 'name' => $p['name'], 'phone' => $p['phone'], 'email' => $p['email'], 'member_id' => null, 'member_code' => null,
                        'status' => 'invalid', 'message' => 'Some digits unreadable — fix the number'];

                    continue;
                }
                $key = MemberNumbers::phoneKey($p['phone']);
                $email = $p['email'] && filter_var($p['email'], FILTER_VALIDATE_EMAIL) ? $p['email'] : null;
                $row = ['line' => $p['line'], 'name' => $p['name'], 'phone' => $key ? '+'.$key : $p['phone'], 'email' => $email, 'member_id' => null, 'member_code' => null];

                if (! $key && ! $email) {
                    $rows[] = $row + ['status' => 'invalid', 'message' => $p['phone'] ? 'Not a valid phone number' : 'No phone number or email'];

                    continue;
                }
                $dupe = $key ?: $email;
                if (isset($seen[$dupe])) {
                    $rows[] = $row + ['status' => 'repeat', 'message' => 'Same as an earlier line'];

                    continue;
                }
                $seen[$dupe] = true;

                $existing = MemberLinker::find($email, $key);
                if ($existing) {
                    $rows[] = array_merge($row, ['member_id' => $existing->id, 'member_code' => $existing->member_code, 'name' => $existing->name ?: $p['name'], 'status' => 'existing', 'message' => 'Already a member']);

                    continue;
                }
                if ($dryRun) {
                    $rows[] = $row + ['status' => 'new', 'message' => 'Will be added'];

                    continue;
                }

                [$member] = MemberLinker::findOrCreate(['name' => $p['name'], 'phone' => $key ? '+'.$key : null, 'email' => $email, 'join_date' => $drive->held_on?->toDateString()], 'drive', $drive->id);
                $rows[] = array_merge($row, ['member_id' => $member->id, 'member_code' => $member->member_code, 'status' => 'created', 'message' => 'Added']);
            }
        };

        $dryRun ? $work() : DB::transaction($work);

        $summary = array_count_values(array_column($rows, 'status')) + ['new' => 0, 'created' => 0, 'existing' => 0, 'repeat' => 0, 'invalid' => 0];

        return ['rows' => $rows, 'summary' => $summary];
    }
}
