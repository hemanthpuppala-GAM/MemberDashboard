<?php

namespace App\Services\People;

use App\Models\People\Member;
use App\Models\People\MemberJournalEntry;
use App\Models\People\PracticeSession;
use App\Models\People\VolunteerApplication;
use App\Models\Content\VolunteerCategory;
use App\Models\Support\SupportAgent;
use App\Models\Support\Ticket;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * Copies the live site's Supabase data into this database — safe to run again and again.
 *
 *  reserved_numbers → reserved_member_numbers
 *  members          → members           (matched by email; the live site's GAW number wins)
 *  volunteers       → volunteer_applications (matched by email, linked to the member)
 *  practice         → practice_sessions + member_journal_entries (each sit / entry once)
 *  support_agents   → support_agents    (core team; their desk password keeps working as PIN)
 *  support_calls    → tickets (source "call"), one per call
 *
 * Nothing is ever deleted here. A dry run does all the work inside a transaction and rolls it
 * back, so the report shows exactly what a real run would change.
 */
class SupabaseSync
{
    public const TABLES = ['reserved_numbers', 'members', 'volunteers', 'practice', 'support_agents', 'support_calls'];

    private const ORDER = [
        'reserved_numbers' => 'member_num', 'members' => 'id', 'volunteers' => 'email',
        'practice' => 'email', 'support_agents' => 'phone', 'support_calls' => 'id',
    ];

    /** @var array<string, array<string, int>> */
    private array $counts = [];

    /** @var list<string> */
    private array $notes = [];

    /** @param  ?string  $dir  Folder of exported files (members.json / members.csv …) instead of the Supabase API. */
    public function __construct(private ?string $dir = null) {}

    public static function configured(): bool
    {
        return filled(config('services.supabase.url')) && filled(config('services.supabase.service_key'));
    }

    /** @return array{dry_run: bool, ran_at: string, source: string, counts: array, notes: list<string>} */
    public function run(bool $dryRun, ?array $only = null): array
    {
        $tables = $only ? array_values(array_intersect(self::TABLES, $only)) : self::TABLES;
        $data = [];
        foreach ($tables as $table) {
            $data[$table] = $this->fetch($table);
        }

        DB::beginTransaction();
        try {
            foreach ($tables as $table) {
                $this->counts[$table] = ['rows' => count($data[$table]), 'created' => 0, 'updated' => 0, 'unchanged' => 0, 'skipped' => 0];
                $this->{'sync'.Str::studly($table)}($data[$table]);
            }
            $dryRun ? DB::rollBack() : DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }

        return [
            'dry_run' => $dryRun,
            'ran_at' => now()->toIso8601String(),
            'source' => $this->dir ? 'files' : 'supabase',
            'counts' => $this->counts,
            'notes' => array_slice($this->notes, 0, 200),
        ];
    }

    // ---- Reading ----

    /** @return list<array<string, mixed>> */
    private function fetch(string $table): array
    {
        if ($this->dir) {
            return $this->readFile($table);
        }

        $url = rtrim((string) config('services.supabase.url'), '/').'/rest/v1/'.$table;
        $key = (string) config('services.supabase.service_key');
        $rows = [];
        for ($offset = 0; ; $offset += 1000) {
            $res = Http::withHeaders(['apikey' => $key, 'Authorization' => 'Bearer '.$key])
                ->timeout(30)
                ->get($url, ['select' => '*', 'order' => self::ORDER[$table].'.asc', 'limit' => 1000, 'offset' => $offset]);
            if ($res->status() === 404) {
                $this->notes[] = "Supabase has no `{$table}` table — skipped.";

                return [];
            }
            if (! $res->successful()) {
                throw new \RuntimeException("Supabase `{$table}`: HTTP {$res->status()} ".Str::limit($res->body(), 200));
            }
            $page = $res->json() ?? [];
            array_push($rows, ...$page);
            if (count($page) < 1000) {
                return $rows;
            }
        }
    }

    private function readFile(string $table): array
    {
        $json = $this->dir.'/'.$table.'.json';
        $csv = $this->dir.'/'.$table.'.csv';
        if (is_file($json)) {
            return json_decode((string) file_get_contents($json), true) ?: [];
        }
        if (! is_file($csv)) {
            $this->notes[] = "No {$table}.json or {$table}.csv in the folder — skipped.";

            return [];
        }
        $fh = fopen($csv, 'r');
        $head = fgetcsv($fh, escape: '') ?: [];
        $rows = [];
        while (($line = fgetcsv($fh, escape: '')) !== false) {
            if ($line === [null]) {
                continue;
            }
            $rows[] = array_combine($head, array_pad($line, count($head), null));
        }
        fclose($fh);

        return $rows;
    }

    // ---- Tables ----

    private function syncReservedNumbers(array $rows): void
    {
        foreach ($rows as $r) {
            $num = (int) ($r['member_num'] ?? 0);
            if (! $num) {
                $this->count('reserved_numbers', 'skipped');

                continue;
            }
            $values = ['name' => self::cut($r['name'] ?? '', 120), 'email' => self::email($r['email'] ?? null), 'role' => self::cut($r['role'] ?? '', 60)];
            $existing = DB::table('reserved_member_numbers')->where('member_num', $num)->first();
            if (! $existing) {
                DB::table('reserved_member_numbers')->insert(['member_num' => $num, ...$values, 'created_at' => now(), 'updated_at' => now()]);
                $this->count('reserved_numbers', 'created');
            } elseif ($existing->name !== $values['name'] || $existing->email !== $values['email'] || $existing->role !== $values['role']) {
                DB::table('reserved_member_numbers')->where('member_num', $num)->update([...$values, 'updated_at' => now()]);
                $this->count('reserved_numbers', 'updated');
            } else {
                $this->count('reserved_numbers', 'unchanged');
            }
        }
    }

    private function syncMembers(array $rows): void
    {
        $bumped = [];
        foreach ($rows as $r) {
            $email = self::email($r['email'] ?? null);
            $num = (int) ($r['member_num'] ?? 0);
            if (! $email || ! $num) {
                $this->count('members', 'skipped');

                continue;
            }

            $member = Member::withTrashed()->whereRaw('lower(email) = ?', [$email])->first();

            // The live site already gave this number to this person: whoever holds it here moves.
            $holder = Member::withTrashed()->where('member_num', $num)->when($member, fn ($q) => $q->where('id', '!=', $member->id))->first();
            if ($holder) {
                $bumped[$holder->id] = $holder->member_num;
                $holder->forceFill(['member_num' => null])->saveQuietly();
            }

            $joined = self::date($r['created_at'] ?? null);
            if (! $member) {
                $member = new Member([
                    'name' => self::cut($r['name'] ?? '', 255),
                    'email' => $email,
                    'category' => 'general',
                    'status' => 'active',
                    'source' => 'import',
                    'join_date' => $joined?->toDateString() ?? now()->toDateString(),
                    'role_title' => self::cut($r['role'] ?? '', 60) ?: null,
                ]);
                $member->forceFill(['member_num' => $num])->save();
                $this->count('members', 'created');

                continue;
            }

            $changes = array_filter([
                'member_num' => $member->member_num !== $num ? $num : null,
                'name' => ! $member->name && ($r['name'] ?? '') ? self::cut($r['name'], 255) : null,
                'role_title' => ! $member->role_title && ($r['role'] ?? '') ? self::cut($r['role'], 60) : null,
                'join_date' => $joined && (! $member->join_date || $joined->lt($member->join_date)) && $joined->toDateString() !== $member->join_date?->toDateString() ? $joined->toDateString() : null,
            ]);
            if (isset($changes['member_num']) && $member->member_num) {
                $this->notes[] = "{$email}: member number GAW-{$member->member_num} → GAW-{$num} (the live site's number).";
            }
            if ($changes) {
                $member->forceFill($changes)->save();
                VolunteerApplication::where('member_id', $member->id)->update(['member_num' => $member->member_num]);
                $this->count('members', 'updated');
            } else {
                $this->count('members', 'unchanged');
            }
        }

        // Members created here whose number the live site had already used get the next free one.
        foreach ($bumped as $id => $old) {
            $m = Member::withTrashed()->find($id);
            if ($m->member_num) {
                continue; // got their own live number later in the list
            }
            $m->forceFill(['member_num' => MemberNumbers::next()])->saveQuietly();
            VolunteerApplication::where('member_id', $m->id)->update(['member_num' => $m->member_num]);
            $this->notes[] = ($m->email ?: $m->phone ?: "Member #{$m->id}").": GAW-{$old} → GAW-{$m->member_num} (GAW-{$old} belongs to a live-site member).";
        }
    }

    private function syncVolunteers(array $rows): void
    {
        $slugs = VolunteerCategory::whereNotNull('slug')->pluck('id', 'slug');
        foreach ($rows as $r) {
            $email = self::email($r['email'] ?? null);
            if (! $email) {
                $this->count('volunteers', 'skipped');

                continue;
            }
            $teams = array_values(array_filter(self::list($r['teams'] ?? []), fn ($t) => $slugs->has($t)));
            $num = (int) ($r['member_num'] ?? 0) ?: null;

            $member = ($num ? Member::where('member_num', $num)->first() : null)
                ?? MemberLinker::findOrCreate(['email' => $email, 'name' => self::cut($r['name'] ?? '', 255), 'phone' => self::cut($r['phone'] ?? '', 50)], 'volunteer')[0];
            if (! $member->phone && ($r['phone'] ?? '')) {
                $member->fill(['phone' => self::cut($r['phone'], 50)])->save();
            }

            $values = [
                'name' => self::cut($r['name'] ?? '', 255) ?: $member->name,
                'phone' => self::cut($r['phone'] ?? '', 50),
                'occupation' => self::cut($r['occupation'] ?? '', 120),
                'city' => self::cut($r['city'] ?? '', 120),
                'lang' => strtoupper(self::cut($r['lang'] ?? 'EN', 20)) ?: 'EN',
                'availability' => self::cut($r['avail'] ?? '', 120),
                'notes' => ($r['note'] ?? '') ?: null,
            ];

            $app = VolunteerApplication::whereRaw('lower(email) = ?', [$email])->latest('id')->first();
            if (! $app) {
                // No desk ticket here (saveQuietly skips the "created" hook): only recent ones get one, below.
                $app = new VolunteerApplication([
                    ...$values, 'email' => $email, 'teams' => $teams, 'status' => 'new',
                    'category_id' => $teams ? $slugs[$teams[0]] : null,
                    'member_id' => $member->id, 'member_num' => $member->member_num,
                ]);
                if ($at = self::date($r['created_at'] ?? null)) {
                    $app->created_at = $at;
                }
                $app->saveQuietly();
                $this->count('volunteers', 'created');

                continue;
            }

            $fill = ['member_id' => $member->id, 'member_num' => $member->member_num];
            foreach ($values as $k => $v) {
                if (($app->{$k} === null || $app->{$k} === '') && $v !== null && $v !== '') {
                    $fill[$k] = $v;
                }
            }
            $merged = array_values(array_unique([...(array) $app->teams, ...$teams]));
            if ($merged !== array_values((array) $app->teams)) {
                $fill['teams'] = $merged;
            }
            $app->fill($fill);
            if ($app->isDirty()) {
                $app->save();
                $this->count('volunteers', 'updated');
            } else {
                $this->count('volunteers', 'unchanged');
            }
        }

        // Sign-ups from the last two weeks still need a reply: put them on the support desk.
        $this->counts['volunteers']['desk_tickets'] = Ticket::backfillVolunteerTickets();
    }

    private function syncPractice(array $rows): void
    {
        foreach ($rows as $r) {
            $email = self::email($r['email'] ?? null);
            $data = is_string($r['data'] ?? null) ? json_decode($r['data'], true) : ($r['data'] ?? null);
            if (! $email || ! is_array($data)) {
                $this->count('practice', 'skipped');

                continue;
            }
            [$member] = MemberLinker::findOrCreate(['email' => $email], 'import');
            $added = 0;

            $seen = [];
            foreach ((array) ($data['sits'] ?? []) as $sit) {
                $id = implode('|', [$sit['ts'] ?? '', $sit['date'] ?? '', $sit['mins'] ?? 0, $sit['via'] ?? '']);
                $n = $seen[$id] = ($seen[$id] ?? 0) + 1; // two identical sits on a day are two sits
                $key = sha1("sit|{$email}|{$id}|{$n}");
                if (PracticeSession::where('import_key', $key)->exists()) {
                    continue;
                }
                $at = self::date($sit['ts'] ?? null) ?? self::date(($sit['date'] ?? '').' 12:00', 'Asia/Kolkata');
                if (! $at) {
                    continue;
                }
                $s = new PracticeSession(['member_id' => $member->id, 'duration_minutes' => min(600, max(1, (int) ($sit['mins'] ?? 1))), 'completed_at' => $at]);
                $s->forceFill(['via' => self::cut($sit['via'] ?? '', 20) ?: null, 'import_key' => $key])->save();
                $added++;
            }

            $seen = [];
            foreach ((array) ($data['journal'] ?? []) as $j) {
                $text = trim((string) ($j['text'] ?? ''));
                if ($text === '') {
                    continue;
                }
                $id = ($j['date'] ?? '').'|'.$text;
                $n = $seen[$id] = ($seen[$id] ?? 0) + 1;
                $key = sha1("journal|{$email}|{$id}|{$n}");
                if (MemberJournalEntry::where('import_key', $key)->exists()) {
                    continue;
                }
                $e = new MemberJournalEntry(['member_id' => $member->id, 'content' => $text]);
                $at = self::date(($j['date'] ?? '').' 12:00', 'Asia/Kolkata') ?? now();
                $e->forceFill(['import_key' => $key, 'created_at' => $at, 'updated_at' => $at])->save();
                $added++;
            }

            $this->count('practice', $added ? 'updated' : 'unchanged');
        }
    }

    private function syncSupportAgents(array $rows): void
    {
        foreach ($rows as $r) {
            $phone = SupportAgent::normalizePhone($r['phone'] ?? null);
            if (! $phone) {
                $this->count('support_agents', 'skipped');

                continue;
            }
            $agent = SupportAgent::where('phone', $phone)->first();
            $active = filter_var($r['active'] ?? true, FILTER_VALIDATE_BOOLEAN);
            // pgcrypto writes "$2a$" bcrypt; PHP checks the same hash as "$2y$".
            $hash = ($r['pass_hash'] ?? '') ? preg_replace('/^\$2a\$/', '\$2y\$', $r['pass_hash']) : null;
            $email = self::email($r['email'] ?? null);
            if ($email && SupportAgent::where('email', $email)->when($agent, fn ($q) => $q->where('id', '!=', $agent->id))->exists()) {
                $email = null; // already used by another desk login
            }

            if (! $agent) {
                $agent = new SupportAgent(['kind' => 'core', 'name' => self::cut($r['name'] ?? $phone, 120) ?: $phone, 'phone' => $phone, 'email' => $email, 'is_active' => $active]);
                $agent->pin_hash = $hash;
                $agent->save();
                $this->count('support_agents', 'created');

                continue;
            }
            $agent->fill(array_filter(['name' => $agent->name ? null : (self::cut($r['name'] ?? '', 120) ?: null), 'email' => $agent->email ? null : $email]));
            if (! $agent->pin_hash && $hash) {
                $agent->pin_hash = $hash;
            }
            if ($agent->isDirty()) {
                $agent->save();
                $this->count('support_agents', 'updated');
            } else {
                $this->count('support_agents', 'unchanged');
            }
        }
    }

    private function syncSupportCalls(array $rows): void
    {
        foreach ($rows as $r) {
            $id = $r['id'] ?? null;
            if (! $id || ! ($r['asked'] ?? $r['topic'] ?? null)) {
                $this->count('support_calls', 'skipped');

                continue;
            }
            $key = 'sb-call-'.$id;
            $done = filter_var($r['follow_done'] ?? false, FILTER_VALIDATE_BOOLEAN) || stripos((string) ($r['outcome'] ?? ''), 'resolv') !== false;
            $status = $done || empty($r['follow_date']) ? 'resolved' : 'waiting';

            $ticket = Ticket::where('import_key', $key)->first();
            if ($ticket) {
                if ($status === 'resolved' && $ticket->isOpen()) {
                    $ticket->moveTo('resolved');
                    $ticket->save();
                    $this->count('support_calls', 'updated');
                } else {
                    $this->count('support_calls', 'unchanged');
                }

                continue;
            }

            $at = self::date($r['called_at'] ?? null) ?? self::date($r['created_at'] ?? null) ?? now();
            $phone = SupportAgent::normalizePhone($r['phone'] ?? null);
            $num = MemberNumbers::parse($r['member'] ?? null);
            $topic = trim((string) ($r['topic'] ?? '')) ?: 'Call';
            $agent = SupportAgent::where('phone', SupportAgent::normalizePhone($r['by_phone'] ?? null))->first();

            $ticket = new Ticket([
                'source' => 'call',
                'member_id' => $num ? Member::where('member_num', $num)->value('id') : null,
                'requester_name' => self::cut($r['name'] ?? '', 120) ?: null,
                'requester_phone' => $phone ? '+'.$phone : null,
                'subject' => self::cut(preg_replace('/\s+/u', ' ', $topic.': '.($r['asked'] ?? '')), 200),
                'body' => trim("Asked: ".($r['asked'] ?? '')."\n\nHow we helped: ".($r['helped'] ?? '')),
                'category' => self::cut(Str::slug($topic), 40) ?: 'general',
                'lang' => ($r['lang'] ?? '') ? self::cut(strtolower($r['lang']), 10) : null,
                'created_by_agent_id' => $agent?->id,
                'assigned_agent_id' => $agent?->id,
            ]);
            $ticket->status = $status;
            $ticket->first_response_at = $at;
            $ticket->resolved_at = $status === 'resolved' ? $at : null;
            $ticket->created_at = $at;
            $ticket->import_key = $key;
            $ticket->save();

            $details = array_filter([
                'Logged on the live Support Desk by '.($r['by_name'] ?? 'the core team').'.',
                ($r['place'] ?? '') ? 'Place: '.$r['place'] : null,
                ($r['member'] ?? '') ? 'Member: '.$r['member'] : null,
                ($r['mins'] ?? '') ? 'Call length: '.$r['mins'].' min' : null,
                ($r['outcome'] ?? '') ? 'Outcome: '.$r['outcome'] : null,
                ($r['helper'] ?? '') === 'volunteer' ? 'Passed to volunteer: '.trim(($r['vol_name'] ?? '').' '.($r['vol_phone'] ?? '').' '.($r['vol_email'] ?? '')) : null,
                ($r['follow_date'] ?? '') ? 'Follow up on '.$r['follow_date'].(($r['follow_note'] ?? '') ? ': '.$r['follow_note'] : '') : null,
            ]);
            $ticket->comments()->make(['author_type' => 'system', 'body' => implode("\n", $details), 'internal' => true])
                ->forceFill(['created_at' => $at, 'updated_at' => $at])->save();
            $this->count('support_calls', 'created');
        }
    }

    // ---- Helpers ----

    private function count(string $table, string $what): void
    {
        $this->counts[$table][$what]++;
    }

    /**
     * Trim to at most $max characters (MySQL varchar counts characters). Str::limit measures
     * display width, so Telugu/Kannada text with zero-width marks could still overflow.
     */
    private static function cut(mixed $value, int $max): string
    {
        $v = trim((string) $value);

        return mb_strlen($v) <= $max ? $v : rtrim(mb_substr($v, 0, $max - 1)).'…';
    }

    private static function email(mixed $value): ?string
    {
        $e = strtolower(trim((string) $value));

        return $e !== '' && str_contains($e, '@') && mb_strlen($e) <= 190 ? $e : null;
    }

    private static function date(mixed $value, ?string $tz = null): ?Carbon
    {
        if (! $value || ! is_string($value) || trim($value) === '' || trim($value) === '12:00') {
            return null;
        }
        try {
            return Carbon::parse($value, $tz)->utc();
        } catch (\Throwable) {
            return null;
        }
    }

    /** Postgres text[] arrives as a JSON array from the API, or "{a,b}" / '["a","b"]' from a CSV export. */
    private static function list(mixed $value): array
    {
        if (is_array($value)) {
            return array_values(array_filter(array_map('strval', $value)));
        }
        $s = trim((string) $value);
        if ($s === '') {
            return [];
        }
        if (str_starts_with($s, '[')) {
            return array_values(array_filter((array) json_decode($s, true)));
        }

        return array_values(array_filter(array_map(fn ($t) => trim($t, " \"'"), explode(',', trim($s, '{}')))));
    }
}
