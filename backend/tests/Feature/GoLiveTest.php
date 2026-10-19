<?php

namespace Tests\Feature;

use App\Models\Auth\Role;
use App\Models\Auth\User;
use App\Models\Support\SupportAgent;
use App\Services\Site\GoLive;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GoLiveTest extends TestCase
{
    use RefreshDatabase;

    private string $site;

    private const OLD = "Options -Indexes\nRewriteEngine On\n# the old site\n";

    protected function setUp(): void
    {
        parent::setUp();
        $this->site = sys_get_temp_dir().'/golive-'.uniqid();
        File::ensureDirectoryExists($this->site.'/app');
        file_put_contents($this->site.'/.htaccess', self::OLD);
        config(['golive.site_root' => $this->site, 'golive.live_url' => 'https://goldenagewisdom.org', 'app.frontend_url' => 'https://goldenagewisdom.org/staging/preview', 'services.supabase.url' => null]);
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->site);
        parent::tearDown();
    }

    private function build(string $sha = 'abc1234'): void
    {
        file_put_contents($this->site.'/app/index.html', '<script type="module" src="/assets/index-x.js"></script>');
        file_put_contents($this->site.'/app/version.json', json_encode(['sha' => $sha, 'built_at' => '2026-10-20T10:00:00Z']));
    }

    /** Any admin-panel user — not only super admins. */
    private function staff(): User
    {
        $role = Role::create(['name' => 'editor', 'display_name' => 'Editor']);
        $user = User::create(['name' => 'Meera', 'email' => 'meera@example.com', 'password' => 'secret-pass']);
        $user->roles()->attach($role);
        Sanctum::actingAs($user, [], 'sanctum');

        return $user;
    }

    public function test_going_live_swaps_the_routing_and_rollback_restores_it(): void
    {
        $this->staff();
        $this->build();

        $this->postJson('/api/v1/admin/go-live/now')->assertOk()
            ->assertJsonPath('status', 'live')->assertJsonPath('live_by', 'Meera');

        $live = file_get_contents($this->site.'/.htaccess');
        $this->assertStringStartsWith(GoLive::MARKER, $live);
        $this->assertStringContainsString('RewriteRule ^(.*)$ app/$1 [L]', $live);
        $this->assertSame(self::OLD, file_get_contents($this->site.'/.htaccess.before-live'));

        // Sign-in and email links now point at the main site.
        $this->assertSame('https://goldenagewisdom.org', GoLive::frontendUrl());
        $this->postJson('/api/v1/admin/go-live/now')->assertStatus(422);

        $this->postJson('/api/v1/admin/go-live/rollback')->assertOk()->assertJsonPath('status', 'staging');
        $this->assertSame(self::OLD, file_get_contents($this->site.'/.htaccess'));
        $this->assertSame('https://goldenagewisdom.org/staging/preview', GoLive::frontendUrl());

        // Going live a second time keeps the original old file as the backup.
        $this->postJson('/api/v1/admin/go-live/now')->assertOk();
        $this->assertSame(self::OLD, file_get_contents($this->site.'/.htaccess.before-live'));
    }

    public function test_it_refuses_without_a_production_build(): void
    {
        $this->staff();
        $this->postJson('/api/v1/admin/go-live/now')->assertStatus(422)
            ->assertJsonFragment(['message' => 'Not ready: Production build uploaded to app/ — Not found. In GitHub → Actions → Build deploy zips → Run workflow, choose "production".']);
        $this->assertSame(self::OLD, file_get_contents($this->site.'/.htaccess'));

        // A build made for the staging address doesn't count either.
        file_put_contents($this->site.'/app/index.html', '<script src="/staging/preview/assets/index-x.js"></script>');
        $this->postJson('/api/v1/admin/go-live/now')->assertStatus(422);
    }

    public function test_a_scheduled_time_goes_live_by_itself(): void
    {
        $this->staff();
        $this->build();
        $this->travelTo(now()->setTimezone('Asia/Kolkata')->setTime(9, 0));

        $this->postJson('/api/v1/admin/go-live/schedule', ['at' => now()->setTimezone('Asia/Kolkata')->subHour()->format('Y-m-d\TH:i')])->assertStatus(422);
        $this->postJson('/api/v1/admin/go-live/schedule', ['at' => now()->setTimezone('Asia/Kolkata')->setTime(18, 30)->format('Y-m-d\TH:i')])
            ->assertOk()->assertJsonPath('status', 'scheduled');

        $this->artisan('site:go-live --due')->assertSuccessful();
        $this->assertSame(self::OLD, file_get_contents($this->site.'/.htaccess'), 'not yet');

        $this->travel(10)->hours();
        $this->artisan('site:go-live --due')->assertSuccessful();
        $this->assertTrue(GoLive::isLive());
        $this->assertSame('Meera (scheduled)', GoLive::state()['live_by']);
        $this->assertStringStartsWith(GoLive::MARKER, file_get_contents($this->site.'/.htaccess'));

        // The scheduler heartbeat shows on the checklist.
        $cron = collect($this->getJson('/api/v1/admin/go-live')->json('checks'))->firstWhere('key', 'cron');
        $this->assertTrue($cron['ok']);
    }

    public function test_a_scheduled_switch_that_is_not_ready_is_reported_not_forced(): void
    {
        $this->staff();
        $this->postJson('/api/v1/admin/go-live/schedule', ['at' => now()->addMinutes(5)->setTimezone('Asia/Kolkata')->format('Y-m-d\TH:i')])->assertOk();
        $this->travel(10)->minutes();
        $this->artisan('site:go-live --due')->assertSuccessful();

        $state = $this->getJson('/api/v1/admin/go-live')->json();
        $this->assertSame('failed', $state['status']);
        $this->assertStringContainsString('Production build', $state['error']);
        $this->assertSame(self::OLD, file_get_contents($this->site.'/.htaccess'));

        $this->deleteJson('/api/v1/admin/go-live/schedule')->assertOk()->assertJsonPath('status', 'staging');
    }

    public function test_the_go_live_state_is_hidden_from_settings_and_desk_logins(): void
    {
        $this->staff();
        $this->build();
        $this->postJson('/api/v1/admin/go-live/now')->assertOk();

        // Plain settings can't flip it back, even for a super admin.
        $super = User::create(['name' => 'Root', 'email' => 'root@example.com', 'password' => 'secret-pass']);
        $super->roles()->attach(Role::create(['name' => Role::SUPER_ADMIN, 'display_name' => 'Super admin']));
        Sanctum::actingAs($super, [], 'sanctum');
        $this->putJson('/api/v1/admin/settings', ['settings' => ['golive' => ['status' => 'staging']]])->assertOk()
            ->assertJsonMissingPath('golive');
        $this->assertTrue(GoLive::isLive());

        $desk = new SupportAgent(['kind' => 'core', 'name' => 'Desk', 'phone' => SupportAgent::normalizePhone('+91 90000 00001')]);
        $desk->setPin('246810');
        $desk->save();
        Sanctum::actingAs($desk, [], 'sanctum');
        $this->getJson('/api/v1/admin/go-live')->assertForbidden();
        $this->postJson('/api/v1/admin/go-live/rollback')->assertForbidden();
    }
}
