<?php

namespace Tests\Feature;

use App\Models\Auth\Role;
use App\Models\Auth\User;
use App\Models\People\Member;
use App\Models\People\MembershipDrive;
use App\Models\People\MemberJournalEntry;
use App\Models\People\PracticeSession;
use App\Models\People\VolunteerApplication;
use App\Models\Support\SupportAgent;
use App\Models\Support\Ticket;
use App\Services\People\SupabaseSync;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MemberSyncTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $role = Role::create(['name' => Role::SUPER_ADMIN, 'display_name' => 'Super admin']);
        $user = User::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => 'secret-pass']);
        $user->roles()->attach($role);
        Sanctum::actingAs($user, [], 'sanctum');

        return $user;
    }

    private function member(array $attrs = []): Member
    {
        return Member::create($attrs + ['name' => 'Asha', 'category' => 'general', 'join_date' => now()]);
    }

    public function test_live_data_sync_is_scheduled_daily_at_3am_ist_after_the_backup(): void
    {
        $events = collect(app(\Illuminate\Console\Scheduling\Schedule::class)->events());
        $sync = $events->first(fn ($e) => str_contains($e->command, 'supabase:sync --write --scheduled'));
        $backup = $events->first(fn ($e) => str_contains($e->command, 'db:backup'));

        $this->assertSame('0 3 * * *', $sync->expression);
        $this->assertSame('Asia/Kolkata', $sync->timezone);
        $this->assertSame('45 2 * * *', $backup->expression);
    }

    public function test_sign_up_still_works_before_the_migration_has_run(): void
    {
        \App\Services\People\MemberNumbers::assumeReady(false);
        try {
            $m = Member::create(['name' => 'Early', 'email' => 'early@example.com', 'category' => 'general', 'join_date' => now(), 'source' => 'google']);
            $this->assertTrue($m->exists);
            $this->assertNull($m->fresh()->source); // not written while the column "doesn't exist"
        } finally {
            \App\Services\People\MemberNumbers::assumeReady(null);
        }
    }

    public function test_members_get_sequential_gaw_numbers_and_reserved_seats(): void
    {
        $a = $this->member(['email' => 'a@example.com']);
        $b = $this->member(['email' => 'b@example.com']);
        $h = $this->member(['email' => 'HemanthPuppala@gmail.com']); // reserved 100001

        // 100001 is reserved, so the sequence starts at 100002.
        $this->assertSame('GAW-100002', $a->member_code);
        $this->assertSame('GAW-100003', $b->member_code);
        $this->assertSame(100001, $h->member_num);
        $this->assertSame('Core team', $h->role_title);
    }

    public function test_desk_call_by_phone_links_to_the_member_and_later_members_adopt_old_tickets(): void
    {
        $m = $this->member(['phone' => '073961 12345']); // phone-only, e.g. from a drive
        $this->assertSame('917396112345', $m->phone_key);

        $call = Ticket::create(['source' => 'call', 'requester_phone' => '+91 73961-12345', 'subject' => 'x']);
        $this->assertSame($m->id, $call->member_id);

        $earlier = Ticket::create(['source' => 'ask_web', 'requester_email' => 'new@example.com', 'subject' => 'y']);
        $this->assertNull($earlier->member_id);
        $n = $this->member(['email' => 'New@example.com']);
        $this->assertSame($n->id, $earlier->fresh()->member_id);
    }

    public function test_volunteer_sign_up_reuses_the_drive_member_with_the_same_phone(): void
    {
        $m = $this->member(['phone' => '9876543210', 'name' => '']);

        $this->postJson('/api/v1/volunteer-applications', [
            'name' => 'Ravi', 'email' => 'ravi@example.com', 'phone' => '+91 98765 43210',
            'teams' => ['tech'], 'availability' => 'Events only',
        ])->assertCreated()->assertJsonPath('member_code', $m->member_code);

        $m->refresh();
        $this->assertSame('ravi@example.com', $m->email);
        $this->assertSame('Ravi', $m->name);
        $this->assertSame(1, Member::count());
    }

    public function test_membership_drive_preview_then_create(): void
    {
        $this->admin();
        $existing = $this->member(['phone' => '9000000001', 'name' => 'Old friend']);
        $drive = $this->postJson('/api/v1/admin/membership-drives', ['name' => 'Vizag satsang', 'held_on' => '2026-10-12'])->assertCreated()->json();

        $lines = "9876500001\n9876500002, Lakshmi\nSita Devi, +91 98765 00003, sita@example.com\n9000000001\n98765 00001\nhello\n9876500004 9876500005";
        $preview = $this->postJson("/api/v1/admin/membership-drives/{$drive['id']}/members", ['lines' => $lines, 'preview' => true])->assertOk()->json();
        $this->assertEquals(['new' => 5, 'created' => 0, 'existing' => 1, 'repeat' => 1, 'invalid' => 1], array_intersect_key($preview['summary'], array_flip(['new', 'created', 'existing', 'repeat', 'invalid'])));
        $this->assertSame(1, Member::count());

        $done = $this->postJson("/api/v1/admin/membership-drives/{$drive['id']}/members", ['lines' => $lines])->assertOk()->json();
        $this->assertSame(5, $done['summary']['created']);
        $this->assertSame($existing->member_code, collect($done['rows'])->firstWhere('status', 'existing')['member_code']);

        $sita = Member::where('email', 'sita@example.com')->first();
        $this->assertSame('Sita Devi', $sita->name);
        $this->assertSame('drive', $sita->source);
        $this->assertSame('2026-10-12', $sita->join_date->toDateString());

        $show = $this->getJson("/api/v1/admin/membership-drives/{$drive['id']}")->assertOk();
        $this->assertSame(5, $show->json('members_count'));
        $this->assertStringContainsString($sita->member_code, $this->get("/api/v1/admin/membership-drives/{$drive['id']}/export")->getContent());

        // Same list again: everyone is already a member, nobody is added twice.
        $again = $this->postJson("/api/v1/admin/membership-drives/{$drive['id']}/members", ['lines' => $lines])->json();
        $this->assertSame(0, $again['summary']['created']);
        $this->assertSame(6, Member::count());
    }

    public function test_support_desk_registers_people_at_an_event_by_name_and_phone(): void
    {
        $agent = new SupportAgent(['kind' => 'core', 'name' => 'Lakshmi', 'phone' => SupportAgent::normalizePhone('7396112111')]);
        $agent->save();
        $existing = $this->member(['phone' => '9876511111', 'name' => 'Old']);
        Sanctum::actingAs($agent, [], 'sanctum');

        $this->postJson('/api/v1/support/events/check', ['people' => [['name' => 'A', 'phone' => '9876544444']]])->assertOk()->assertJsonPath('summary.new', 1);
        $this->assertSame(1, Member::count()); // checking saves nothing
        $event = $this->postJson('/api/v1/support/events', ['name' => 'Guntur satsang'])->assertCreated()->json();
        $this->assertSame(now()->toDateString(), substr($event['held_on'], 0, 10));

        $people = [
            ['name' => 'Ravi, Kumar', 'phone' => '98765 22222'],
            ['name' => 'Old friend', 'phone' => '+91 98765 11111'],
            ['name' => 'No phone', 'phone' => ''],
            ['name' => 'Asha', 'phone' => '9876533333', 'email' => 'asha@example.com'],
        ];
        $preview = $this->postJson("/api/v1/support/events/{$event['id']}/register", ['people' => $people, 'preview' => true])->assertOk()->json();
        $this->assertSame(2, $preview['summary']['new']);
        $this->assertSame(1, $preview['summary']['existing']);
        $this->assertSame(1, $preview['summary']['invalid']);

        $done = $this->postJson("/api/v1/support/events/{$event['id']}/register", ['people' => $people])->assertOk()->json();
        $this->assertSame(2, $done['summary']['created']);
        $ravi = Member::where('phone_key', '919876522222')->first();
        $this->assertSame('Ravi Kumar', $ravi->name);
        $this->assertNull($ravi->email); // no made-up emails: phone alone identifies them
        $this->assertSame($event['id'], $ravi->drive_id);
        $this->assertSame($existing->member_code, collect($done['rows'])->firstWhere('status', 'existing')['member_code']);

        // Registering the same phones again never creates a second member.
        $this->postJson("/api/v1/support/events/{$event['id']}/register", ['people' => $people])->assertJsonPath('summary.created', 0);
        $this->getJson('/api/v1/support/events')->assertJsonPath('0.members_count', 2);
    }

    public function test_admin_members_can_be_filtered_to_volunteers(): void
    {
        $this->admin();
        $vol = $this->member(['email' => 'vol@example.com']);
        $this->member(['email' => 'plain@example.com']);
        VolunteerApplication::create(['name' => 'Vol', 'email' => 'vol@example.com', 'phone' => '1', 'occupation' => '', 'city' => '', 'availability' => '', 'teams' => ['tech']]);

        $res = $this->getJson('/api/v1/admin/members?volunteer=1')->assertOk();
        $this->assertSame([$vol->id], array_column($res->json('data'), 'id'));
        $this->assertSame(['tech'], $res->json('data.0.volunteer_applications.0.teams'));
        $this->assertCount(1, $this->getJson('/api/v1/admin/members?volunteer=0')->json('data'));
    }

    public function test_google_member_adding_the_drive_phone_merges_and_keeps_the_drive_number(): void
    {
        $drive = MembershipDrive::create(['name' => 'Camp']);
        $twin = $this->member(['phone' => '9876500009', 'name' => '', 'drive_id' => $drive->id, 'source' => 'drive']);
        $google = $this->member(['email' => 'g@example.com', 'oauth_provider' => 'google', 'oauth_provider_id' => '1']);
        Ticket::create(['source' => 'call', 'requester_phone' => '9876500009', 'subject' => 'call']);
        $twinNum = $twin->member_num;

        Sanctum::actingAs($google, [], 'sanctum');
        $this->putJson('/api/v1/member/profile', ['name' => 'Gita', 'email' => 'g@example.com', 'phone' => '+91 98765 00009'])
            ->assertOk()->assertJsonPath('user.member_id', 'GAW-'.$twinNum);

        $google->refresh();
        $this->assertSame($twinNum, $google->member_num);
        $this->assertSame($drive->id, $google->drive_id);
        $this->assertSame(1, $google->tickets()->count());
        $this->assertSoftDeleted($twin);
    }

    public function test_admin_member_profile_lists_everything_linked(): void
    {
        $this->admin();
        $m = $this->member(['email' => 'link@example.com']);
        VolunteerApplication::create(['name' => 'Link', 'email' => 'link@example.com', 'phone' => '1', 'occupation' => '', 'city' => '', 'availability' => '']);
        PracticeSession::create(['member_id' => $m->id, 'duration_minutes' => 20, 'completed_at' => now()]);
        MemberJournalEntry::create(['member_id' => $m->id, 'content' => 'Calm today']);

        $res = $this->getJson("/api/v1/admin/members/{$m->id}")->assertOk();
        $res->assertJsonPath('member_code', $m->member_code)
            ->assertJsonPath('linked.practice.minutes', 20)
            ->assertJsonPath('linked.journal_count', 1)
            ->assertJsonPath('linked.tickets_count', 1); // the volunteer sign-up ticket
        $this->assertCount(1, $res->json('linked.volunteer_applications'));

        $this->getJson('/api/v1/admin/members?search='.$m->member_code)->assertJsonPath('data.0.id', $m->id);
    }

    public function test_supabase_sync_from_exports_is_repeatable_and_live_numbers_win(): void
    {
        $local = $this->member(['email' => 'local@example.com']); // got 100002 here
        $this->assertSame(100002, $local->member_num);

        $dir = sys_get_temp_dir().'/sb-'.uniqid();
        mkdir($dir);
        $hash = preg_replace('/^\$2y\$/', '\$2a\$', password_hash('desk-pass-1', PASSWORD_BCRYPT));
        file_put_contents("$dir/members.json", json_encode([
            ['id' => 1, 'member_num' => 100002, 'name' => 'Live Lata', 'email' => 'lata@example.com', 'role' => '', 'created_at' => '2026-09-01T10:00:00Z'],
            ['id' => 2, 'member_num' => 111111, 'name' => 'Dr. Hari Krishna', 'email' => 'guru@example.com', 'role' => 'Founder', 'created_at' => '2026-09-02T10:00:00Z'],
        ]));
        file_put_contents("$dir/volunteers.csv", "email,name,phone,city,lang,teams,avail,note,member_num,occupation,created_at\nlata@example.com,Live Lata,9876511111,Pune,MR,\"{tech,helpline}\",Events only,,100002,Nurse,2026-09-03T10:00:00Z\n");
        file_put_contents("$dir/practice.json", json_encode([
            ['email' => 'lata@example.com', 'data' => ['sits' => [
                ['date' => '2026-10-01', 'mins' => 2], ['date' => '2026-10-01', 'mins' => 2], // two real sits
                ['date' => '2026-10-02', 'mins' => 20, 'via' => 'live', 'ts' => '2026-10-02T00:40:00Z'],
            ], 'journal' => [['date' => '2026-10-02', 'text' => 'Felt light']], 'events' => []]],
        ]));
        file_put_contents("$dir/support_agents.json", json_encode([['phone' => '7396112111', 'name' => 'Raman Kumar', 'email' => null, 'pass_hash' => $hash, 'active' => true]]));
        file_put_contents("$dir/support_calls.json", json_encode([
            ['id' => 7, 'called_at' => '2026-10-05T05:00:00Z', 'name' => 'Caller', 'phone' => '9876511111', 'topic' => 'Meditation', 'asked' => 'How long to sit?', 'helped' => 'Explained 20 min', 'outcome' => 'Resolved', 'follow_done' => false, 'by_phone' => '7396112111', 'by_name' => 'Raman Kumar', 'helper' => 'self'],
            ['id' => 9, 'called_at' => '2026-10-07T05:00:00Z', 'name' => str_repeat('సీత ', 60), 'phone' => '9000022222', 'topic' => 'Experiences during meditation', 'asked' => str_repeat('ధ్యానంలో శరీరం తిరుగుతున్నట్లు అనిపించింది. ', 40), 'helped' => 'Shared in the group', 'outcome' => 'Resolved', 'lang' => 'telugu', 'by_phone' => '7396112111', 'by_name' => 'Raman Kumar'],
            ['id' => 8, 'called_at' => '2026-10-06T05:00:00Z', 'name' => 'Caller 2', 'phone' => '9000011111', 'topic' => 'Health', 'asked' => 'Back pain', 'helped' => 'Will call back', 'outcome' => 'Follow-up', 'follow_date' => '2026-10-20', 'follow_done' => false, 'by_phone' => '7396112111', 'by_name' => 'Raman Kumar'],
        ]));

        $preview = (new SupabaseSync($dir))->run(true);
        $this->assertSame(2, $preview['counts']['members']['created']);
        $this->assertSame(1, Member::count()); // dry run saved nothing

        (new SupabaseSync($dir))->run(false);
        (new SupabaseSync($dir))->run(false); // again: nothing duplicated

        $lata = Member::where('email', 'lata@example.com')->first();
        $this->assertSame(100002, $lata->member_num);
        $this->assertSame(100003, $local->fresh()->member_num); // moved aside for the live number
        $this->assertSame('Founder', Member::where('member_num', 111111)->value('role_title'));
        $this->assertSame(3, $lata->practiceSessions()->count());
        $this->assertSame(1, $lata->journalEntries()->count());

        $vol = VolunteerApplication::sole();
        $this->assertSame($lata->id, $vol->member_id);
        $this->assertSame(['tech', 'helpline'], $vol->teams);
        $this->assertSame(0, Ticket::where('source', 'volunteer')->count()); // past sign-ups don't flood the desk

        $this->assertSame(3, Ticket::where('source', 'call')->count());
        // MySQL varchar(200)/(120) count characters; long Telugu text must fit.
        $long = Ticket::where('import_key', 'sb-call-9')->first();
        $this->assertLessThanOrEqual(200, mb_strlen($long->subject));
        $this->assertLessThanOrEqual(120, mb_strlen($long->requester_name));
        $this->assertStringEndsWith('…', $long->subject);
        $resolved = Ticket::where('import_key', 'sb-call-7')->first();
        $this->assertSame('resolved', $resolved->status);
        $this->assertSame($lata->id, $resolved->member_id); // the call came from her (volunteer) phone
        $this->assertSame('waiting', Ticket::where('import_key', 'sb-call-8')->value('status'));

        // The core team keeps their desk password.
        $this->postJson('/api/v1/support/login', ['phone' => '7396112111', 'pin' => 'desk-pass-1'])->assertOk();
    }
}
