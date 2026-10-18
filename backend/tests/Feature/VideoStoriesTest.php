<?php

namespace Tests\Feature;

use App\Models\Auth\Role;
use App\Models\Auth\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class VideoStoriesTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): void
    {
        $role = Role::create(['name' => Role::SUPER_ADMIN, 'display_name' => 'Super admin']);
        $user = User::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => 'secret-pass']);
        $user->roles()->attach($role);
        Sanctum::actingAs($user, [], 'sanctum');
    }

    public function test_video_testimonials_are_listed_as_stories(): void
    {
        Storage::fake('public');
        $this->admin();

        // A YouTube Short with no written quote.
        $this->postJson('/api/v1/admin/testimonials', [
            'name' => 'Lakshmi', 'place' => 'Vizag', 'rating' => 5, 'status' => 'published',
            'video_url' => 'https://youtube.com/shorts/abcDEF12345',
        ])->assertCreated();

        // An uploaded clip with a caption.
        $this->post('/api/v1/admin/testimonials', [
            'name' => 'Ravi', 'quote' => 'My sleep came back.', 'rating' => 5, 'status' => 'published',
            'video' => UploadedFile::fake()->create('ravi.mp4', 900, 'video/mp4'),
        ], ['Accept' => 'application/json'])->assertCreated();

        // Text-only and draft testimonials are not stories.
        $this->postJson('/api/v1/admin/testimonials', ['name' => 'Text', 'quote' => 'Lovely.', 'rating' => 5, 'status' => 'published'])->assertCreated();
        $this->postJson('/api/v1/admin/testimonials', ['name' => 'Draft', 'rating' => 5, 'status' => 'draft', 'video_url' => 'https://youtu.be/xyz12345678'])->assertCreated();

        $stories = $this->getJson('/api/v1/testimonials/videos')->assertOk()->json();
        $this->assertSame(['Lakshmi', 'Ravi'], array_column($stories, 'name'));
        $this->assertSame('Vizag', $stories[0]['place']);
        $this->assertStringEndsWith('.mp4', $stories[1]['video_url']);

        // Removing the video takes it off the stories list.
        $this->putJson("/api/v1/admin/testimonials/{$stories[0]['id']}", ['name' => 'Lakshmi', 'quote' => 'Peace.', 'rating' => 5, 'status' => 'published', 'remove_video' => true])->assertOk();
        $this->assertCount(1, $this->getJson('/api/v1/testimonials/videos')->json());
    }

    public function test_a_testimonial_needs_a_quote_or_a_video(): void
    {
        $this->admin();
        $this->postJson('/api/v1/admin/testimonials', ['name' => 'Nobody', 'rating' => 5, 'status' => 'published'])
            ->assertUnprocessable()->assertJsonValidationErrors('quote');
    }
}
