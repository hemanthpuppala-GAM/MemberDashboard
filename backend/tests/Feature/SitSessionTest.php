<?php

namespace Tests\Feature;

use App\Models\Auth\Role;
use App\Models\Auth\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SitSessionTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): void
    {
        $role = Role::create(['name' => Role::SUPER_ADMIN, 'display_name' => 'Super admin']);
        $user = User::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => 'secret-pass']);
        $user->roles()->attach($role);
        Sanctum::actingAs($user, [], 'sanctum');
    }

    public function test_admin_uploads_a_track_and_members_see_the_session(): void
    {
        Storage::fake('public');
        $this->admin();

        $this->getJson('/api/v1/admin/music/limits')->assertOk()->assertJsonStructure(['max_mb']);

        $track = $this->post('/api/v1/admin/music', [
            'title' => 'Morning sit', 'category' => 'meditation', 'status' => 'published', 'duration_seconds' => 1200,
            'file' => UploadedFile::fake()->create('sit.mp3', 500, 'audio/mpeg'),
        ], ['Accept' => 'application/json'])->assertCreated()->json();

        $this->postJson('/api/v1/admin/sit-presets', ['title' => 'Morning sit', 'duration_minutes' => 20, 'music_track_id' => $track['id'], 'status' => 'published'])->assertCreated();

        // Replacing the file on the track updates every session using it.
        $this->post("/api/v1/admin/music/{$track['id']}", [
            '_method' => 'PUT', 'title' => 'Morning sit', 'category' => 'meditation', 'status' => 'published',
            'file' => UploadedFile::fake()->create('sit-v2.mp3', 400, 'audio/mpeg'),
        ], ['Accept' => 'application/json'])->assertOk();

        $sessions = $this->getJson('/api/v1/sit-presets')->assertOk()->json();
        $this->assertCount(1, $sessions);
        $this->assertNotSame($track['file_url'], $sessions[0]['track']['file_url']);
        $this->assertStringEndsWith('.mp3', $sessions[0]['track']['file_url']);
    }
}
