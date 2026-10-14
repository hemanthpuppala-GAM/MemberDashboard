<?php

namespace Tests\Feature;

use App\Models\Auth\Role;
use App\Models\Auth\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SiteContentTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsSuperAdmin(): User
    {
        $role = Role::create(['name' => Role::SUPER_ADMIN, 'display_name' => 'Super admin']);
        $user = User::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => 'secret-pass']);
        $user->roles()->attach($role);
        Sanctum::actingAs($user, [], 'sanctum');

        return $user;
    }

    public function test_unedited_page_serves_the_backend_defaults(): void
    {
        $defaults = json_decode(file_get_contents(resource_path('site-content/about.json')), true);

        $this->getJson('/api/v1/site-content/about')->assertOk()
            ->assertJson(['page' => 'about', 'customized' => false])
            ->assertJsonPath('data.title', $defaults['title']);
        $this->getJson('/api/v1/site-content/nope')->assertNotFound();
    }

    public function test_backend_defaults_match_the_websites_offline_copy(): void
    {
        $frontend = base_path('../frontend/src/site/content');
        if (! is_dir($frontend)) {
            $this->markTestSkipped('frontend/ not checked out next to backend/');
        }
        foreach (\App\Models\Site\SiteContent::PAGES as $page) {
            $this->assertSame(
                json_decode(file_get_contents("{$frontend}/{$page}.json"), true),
                json_decode(file_get_contents(resource_path("site-content/{$page}.json")), true),
                "backend/resources/site-content/{$page}.json differs from frontend/src/site/content/{$page}.json",
            );
        }
    }

    public function test_sync_command_stores_full_copy_without_touching_admin_edits(): void
    {
        \App\Models\Site\SiteContent::create(['page' => 'wisdom', 'data' => ['title' => 'Edited by admin']]);

        $this->artisan('site-content:sync')->assertSuccessful();

        $wisdom = \App\Models\Site\SiteContent::where('page', 'wisdom')->first()->data;
        $this->assertSame('Edited by admin', $wisdom['title']);
        $this->assertArrayHasKey('stages', $wisdom);
        $this->assertSame(count(\App\Models\Site\SiteContent::PAGES), \App\Models\Site\SiteContent::count());
    }

    public function test_admin_can_publish_and_reset_a_page(): void
    {
        $this->actingAsSuperAdmin();

        $this->putJson('/api/v1/admin/site-content/home', ['data' => ['headline' => 'Sit with us', 'sessions' => [['time' => '6 AM']]]])
            ->assertOk();

        $this->getJson('/api/v1/site-content/home')->assertOk()
            ->assertJson(['customized' => true])
            ->assertJsonPath('data.headline', 'Sit with us')
            ->assertJsonPath('data.sessions.0.time', '6 AM')
            ->assertJsonPath('data.sitsTitle', 'Sits around the world'); // untouched keys keep their defaults

        $this->getJson('/api/v1/admin/site-content/home')->assertOk()->assertJsonPath('defaults.sitsTitle', 'Sits around the world');

        $this->deleteJson('/api/v1/admin/site-content/home')->assertOk();
        $this->getJson('/api/v1/site-content/home')->assertJson(['customized' => false]);
    }

    public function test_publishing_requires_staff_auth_and_a_known_page(): void
    {
        $this->putJson('/api/v1/admin/site-content/home', ['data' => ['a' => 1]])->assertUnauthorized();

        $this->actingAsSuperAdmin();
        $this->putJson('/api/v1/admin/site-content/secret', ['data' => ['a' => 1]])->assertNotFound();
        $this->putJson('/api/v1/admin/site-content/home', [])->assertUnprocessable();
    }
}
