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

    public function test_unpublished_page_returns_null_so_frontend_uses_defaults(): void
    {
        $this->getJson('/api/v1/site-content/about')->assertOk()->assertJson(['page' => 'about', 'data' => null]);
        $this->getJson('/api/v1/site-content/nope')->assertNotFound();
    }

    public function test_admin_can_publish_and_reset_a_page(): void
    {
        $this->actingAsSuperAdmin();

        $this->putJson('/api/v1/admin/site-content/home', ['data' => ['headline' => 'Sit with us', 'sessions' => [['time' => '6 AM']]]])
            ->assertOk();

        $this->getJson('/api/v1/site-content/home')->assertOk()
            ->assertJsonPath('data.headline', 'Sit with us')
            ->assertJsonPath('data.sessions.0.time', '6 AM');

        $this->deleteJson('/api/v1/admin/site-content/home')->assertOk();
        $this->getJson('/api/v1/site-content/home')->assertJson(['data' => null]);
    }

    public function test_publishing_requires_staff_auth_and_a_known_page(): void
    {
        $this->putJson('/api/v1/admin/site-content/home', ['data' => ['a' => 1]])->assertUnauthorized();

        $this->actingAsSuperAdmin();
        $this->putJson('/api/v1/admin/site-content/secret', ['data' => ['a' => 1]])->assertNotFound();
        $this->putJson('/api/v1/admin/site-content/home', [])->assertUnprocessable();
    }
}
