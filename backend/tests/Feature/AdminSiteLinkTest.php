<?php

namespace Tests\Feature;

use App\Models\Auth\Role;
use App\Models\Auth\User;
use App\Models\Cms\Event;
use App\Models\People\ContactSubmission;
use App\Models\Settings\Setting;
use App\Models\Support\SupportAgent;
use App\Models\Support\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/** The admin panel's modules feeding the site and the support desk. */
class AdminSiteLinkTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $role = Role::create(['name' => Role::SUPER_ADMIN, 'display_name' => 'Super admin']);
        $user = User::create(['name' => 'Priya Admin', 'email' => 'priya@example.com', 'password' => 'secret-pass']);
        $user->roles()->attach($role);

        return $user;
    }

    private function question(): array
    {
        Mail::fake();
        $this->postJson('/api/v1/contact', ['name' => 'Asha', 'email' => 'asha@example.com', 'category' => 'general', 'message' => 'How long should I sit?', 'source' => 'qr_web'])->assertCreated();

        return [ContactSubmission::sole(), Ticket::sole()];
    }

    public function test_admin_query_changes_reach_the_desk(): void
    {
        [$s, $t] = $this->question();
        $admin = $this->admin();
        Sanctum::actingAs($admin, [], 'sanctum');

        $this->patchJson("/api/v1/admin/queries/{$s->id}/assign", ['assigned_to' => $admin->id])->assertOk();
        $t->refresh();
        $agent = SupportAgent::where('user_id', $admin->id)->sole();
        $this->assertSame('staff', $agent->kind);
        $this->assertSame($agent->id, $t->assigned_agent_id);
        $this->assertSame('open', $t->status);

        $this->patchJson("/api/v1/admin/queries/{$s->id}/status", ['status' => 'resolved'])->assertOk();
        $this->assertSame('resolved', $t->refresh()->status);
        $this->assertNotNull($t->resolved_at);

        $this->getJson("/api/v1/admin/queries/{$s->id}")->assertOk()->assertJsonPath('ticket.ref', $t->ref);
    }

    public function test_desk_changes_reach_admin_queries_and_staff_can_work_the_desk(): void
    {
        [$s, $t] = $this->question();
        $admin = $this->admin();
        Sanctum::actingAs($admin, [], 'sanctum');

        // Admin sign-in opens the desk directly.
        $this->getJson('/api/v1/support/dashboard')->assertOk()->assertJsonPath('me.kind', 'staff');
        $agent = SupportAgent::where('user_id', $admin->id)->sole();

        $this->patchJson("/api/v1/support/tickets/{$t->id}", ['status' => 'waiting', 'assigned_agent_id' => $agent->id])->assertOk();
        $s->refresh();
        $this->assertSame('in_progress', $s->status);
        $this->assertSame($admin->id, $s->assigned_to);

        $this->patchJson("/api/v1/support/tickets/{$t->id}", ['status' => 'closed'])->assertOk();
        $this->assertSame('archived', $s->refresh()->status);
    }

    public function test_daily_session_rolls_to_the_next_sitting_and_falls_back_to_settings_zoom(): void
    {
        Setting::create(['key' => 'zoom.url', 'value' => 'https://zoom.us/j/123']);
        // 6:00 am India time, every day.
        Event::create(['title' => 'Morning sit', 'starts_at' => '2026-10-01 00:30:00', 'ends_at' => '2026-10-01 01:30:00', 'recurrence' => 'daily', 'timezone' => 'Asia/Kolkata', 'is_published' => true]);
        Event::create(['title' => 'Full moon', 'starts_at' => '2026-10-20 13:00:00', 'join_url' => 'https://meet.example/x', 'is_published' => true]);

        Carbon::setTestNow('2026-10-10 03:00:00'); // 8:30 am IST — today's sit is over
        $rows = collect($this->getJson('/api/v1/events')->assertOk()->json())->keyBy('title');
        $this->assertSame('2026-10-11T00:30:00+00:00', $rows['Morning sit']['next_starts_at']);
        $this->assertSame('06:00', $rows['Morning sit']['local_time']);
        $this->assertSame('https://zoom.us/j/123', $rows['Morning sit']['join_url']);
        $this->assertSame('https://meet.example/x', $rows['Full moon']['join_url']);
        $this->assertFalse($rows['Full moon']['is_past']);

        $this->assertSame('https://zoom.us/j/123', $this->getJson('/api/v1/settings')->json()['zoom.url']);
        Carbon::setTestNow();
    }

    public function test_support_numbers_come_from_settings_then_env(): void
    {
        config(['services.support.primary' => '+91 73961 12111']);
        $this->assertSame('917396112111', $this->getJson('/api/v1/settings')->json()['support.primary']);

        Setting::create(['key' => 'support.primary', 'value' => '+91 90000 00001']);
        $this->assertSame('919000000001', $this->getJson('/api/v1/settings')->json()['support.primary']);
    }

    public function test_site_quotes_are_seeded_into_testimonials(): void
    {
        $this->assertGreaterThanOrEqual(12, DB::table('testimonials')->where('status', 'published')->where('is_featured', true)->count());
        $this->getJson('/api/v1/testimonials/featured')->assertOk()->assertJsonFragment(['name' => 'Kalyani']);
    }
}
