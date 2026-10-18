<?php

namespace Tests\Feature;

use App\Models\Auth\Role;
use App\Models\Auth\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
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

    public function test_shorts_from_the_channel_feed_can_be_picked(): void
    {
        $this->admin();
        config(['services.youtube.channel_id' => 'UCabcdefghijklmnopqrstuv']);
        $xml = <<<'XML'
        <?xml version="1.0" encoding="UTF-8"?>
        <feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
          <entry><yt:videoId>short000001</yt:videoId><title>How meditation healed my anxiety | Lakshmi</title>
            <link rel="alternate" href="https://www.youtube.com/shorts/short000001"/><published>2026-10-10T10:00:00+00:00</published>
            <media:group><media:thumbnail url="https://i1.ytimg.com/vi/short000001/hqdefault.jpg" width="480" height="360"/></media:group></entry>
          <entry><yt:videoId>short000002</yt:videoId><title>Daily sit tip</title>
            <link rel="alternate" href="https://www.youtube.com/shorts/short000002"/><published>2026-10-09T10:00:00+00:00</published></entry>
        </feed>
        XML;
        Http::fake(['www.youtube.com/feeds/videos.xml?playlist_id=UUSHabcdefghijklmnopqrstuv' => Http::response($xml)]);

        $this->postJson('/api/v1/admin/testimonials', ['name' => 'Lakshmi', 'rating' => 5, 'status' => 'published', 'video_url' => 'https://youtube.com/shorts/short000001'])->assertCreated();

        $items = $this->getJson('/api/v1/admin/testimonials/youtube')->assertOk()->json('items');
        $this->assertCount(2, $items);
        $this->assertSame('https://www.youtube.com/shorts/short000001', $items[0]['url']);
        $this->assertTrue($items[0]['added']);
        $this->assertFalse($items[1]['added']);
        $this->assertStringEndsWith('/short000002/hqdefault.jpg', $items[1]['thumbnail']);
    }

    public function test_a_testimonial_needs_a_quote_or_a_video(): void
    {
        $this->admin();
        $this->postJson('/api/v1/admin/testimonials', ['name' => 'Nobody', 'rating' => 5, 'status' => 'published'])
            ->assertUnprocessable()->assertJsonValidationErrors('quote');
    }
}
