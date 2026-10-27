<?php

namespace Tests\Feature;

use App\Models\People\Member;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LiveSitLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_live_session_sit_is_logged_with_where_it_happened(): void
    {
        $member = Member::create(['name' => 'Asha Rao', 'email' => 'asha@example.com', 'password' => 'secret-pass', 'category' => 'meditation', 'join_date' => now()]);
        Sanctum::actingAs($member, [], 'sanctum');

        $this->postJson('/api/v1/member/practice-sessions', ['duration_minutes' => 45, 'via' => 'zoom'])
            ->assertCreated()
            ->assertJsonPath('session.via', 'zoom')
            ->assertJsonPath('session.duration_minutes', 45);
        $this->postJson('/api/v1/member/practice-sessions', ['duration_minutes' => 20])->assertCreated()->assertJsonPath('session.via', null);
        $this->postJson('/api/v1/member/practice-sessions', ['duration_minutes' => 20, 'via' => 'somewhere'])->assertUnprocessable();

        $this->assertEqualsCanonicalizing(['zoom', null], array_column($this->getJson('/api/v1/member/practice-sessions')->assertOk()->json(), 'via'));
    }

    public function test_a_missed_sit_can_be_added_for_the_last_two_days_only(): void
    {
        $this->travelTo(now()->setDate(2026, 10, 22)->setTime(9, 30));
        $member = Member::create(['name' => 'Ravi', 'email' => 'ravi@example.com', 'password' => 'secret-pass', 'category' => 'meditation', 'join_date' => now()]);
        Sanctum::actingAs($member, [], 'sanctum');

        $this->postJson('/api/v1/member/practice-sessions', ['duration_minutes' => 60, 'via' => 'zoom', 'completed_on' => '2026-10-21'])
            ->assertCreated()
            ->assertJsonPath('session.via', 'zoom')
            ->assertJsonPath('challenge.day', 1);
        $this->postJson('/api/v1/member/practice-sessions', ['duration_minutes' => 20, 'via' => 'own', 'completed_on' => '2026-10-20'])->assertCreated();
        $today = $this->postJson('/api/v1/member/practice-sessions', ['duration_minutes' => 15, 'completed_on' => '2026-10-22'])->assertCreated();

        // Three days in a row now: the streak and the challenge both count them on their own dates.
        $today->assertJsonPath('streak_days', 3)->assertJsonPath('challenge.day', 3);
        // Noon on that day in the member's time zone (IST when the dashboard doesn't say).
        $this->assertSame('2026-10-21 06:30:00', $member->practiceSessions()->where('duration_minutes', 60)->value('completed_at')->format('Y-m-d H:i:s'));

        $this->postJson('/api/v1/member/practice-sessions', ['duration_minutes' => 20, 'completed_on' => '2026-10-15'])->assertUnprocessable();
        $this->postJson('/api/v1/member/practice-sessions', ['duration_minutes' => 20, 'completed_on' => '2026-10-30'])->assertUnprocessable();
    }

    public function test_days_are_counted_on_the_members_own_calendar(): void
    {
        // 23:40 UTC on the 21st = 5:10 AM IST on the 22nd (the Brahma Muhurtham sit).
        $this->travelTo(now()->setDate(2026, 10, 21)->setTime(23, 40));
        $member = Member::create(['name' => 'Ravi', 'email' => 'ravi@example.com', 'password' => 'secret-pass', 'category' => 'meditation', 'join_date' => now()]);
        Sanctum::actingAs($member, [], 'sanctum');
        $member->practiceSessions()->create(['duration_minutes' => 30, 'completed_at' => now()->subHours(8)]); // 21st, evening IST

        $res = $this->withHeader('X-Timezone', 'Asia/Kolkata')->postJson('/api/v1/member/practice-sessions', ['duration_minutes' => 60, 'via' => 'zoom']);
        $res->assertCreated()->assertJsonPath('challenge.day', 2)->assertJsonPath('streak_days', 2);
        $this->assertSame('2026-10-22', collect($res->json('daily_log'))->last()['date']);

        // The same sits seen from Chicago fall on one day there (the 21st).
        $this->withHeader('X-Timezone', 'America/Chicago')->getJson('/api/v1/member/overview')->assertJsonPath('challenge.day', 1);
        // A bad header falls back to IST.
        $this->withHeader('X-Timezone', 'Not/AZone')->getJson('/api/v1/member/overview')->assertJsonPath('challenge.day', 2);
    }
}
