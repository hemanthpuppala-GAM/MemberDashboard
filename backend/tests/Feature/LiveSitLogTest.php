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
}
