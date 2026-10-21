<?php

namespace Tests\Feature;

use App\Models\Auth\Role;
use App\Models\Auth\User;
use App\Models\Site\SiteContent;
use App\Services\Content\YouTubeFeed;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
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

        // Newest upload first.
        $stories = $this->getJson('/api/v1/testimonials/videos')->assertOk()->json();
        $this->assertSame(['Ravi', 'Lakshmi'], array_column($stories, 'name'));
        $this->assertSame('Vizag', $stories[1]['place']);
        $this->assertStringEndsWith('.mp4', $stories[0]['video_url']);

        // Removing the video takes it off the stories list.
        $this->putJson("/api/v1/admin/testimonials/{$stories[1]['id']}", ['name' => 'Lakshmi', 'quote' => 'Peace.', 'rating' => 5, 'status' => 'published', 'remove_video' => true])->assertOk();
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
        // The feed's i1.ytimg.com host is blocked by the site's CSP: always i.ytimg.com.
        $this->assertSame('https://i.ytimg.com/vi/short000001/hqdefault.jpg', $items[0]['thumbnail']);
    }

    public function test_when_the_feed_is_empty_shorts_come_from_the_channel_page(): void
    {
        $this->admin();
        config(['services.youtube.channel_id' => 'UCabcdefghijklmnopqrstuv', 'services.youtube.channel' => '@GoldenAgeGurus']);
        $empty = '<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"></feed>';
        $page = '<script>var ytInitialData = {"reelWatchEndpoint":{"videoId":"AAAAAAAAAA1"},"url":"/shorts/AAAAAAAAAA1","x":{"videoId":"BBBBBBBBBB2"}};</script>';
        Http::fake([
            'www.youtube.com/feeds/*' => Http::response($empty),
            'www.youtube.com/@GoldenAgeGurus/shorts' => Http::response($page),
            'www.youtube.com/oembed*' => Http::response(['title' => 'My anxiety is gone | Member story']),
        ]);

        $items = $this->getJson('/api/v1/admin/testimonials/youtube')->assertOk()->json('items');
        $this->assertSame(['AAAAAAAAAA1', 'BBBBBBBBBB2'], array_column($items, 'id'));
        $this->assertSame('My anxiety is gone | Member story', $items[0]['title']);
        $this->assertSame('https://www.youtube.com/shorts/BBBBBBBBBB2', $items[1]['url']);
    }

    public function test_the_public_shorts_list_is_newest_first(): void
    {
        config(['services.youtube.channel_id' => 'UCabcdefghijklmnopqrstuv']);
        $xml = '<?xml version="1.0"?><feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns="http://www.w3.org/2005/Atom">'
            .'<entry><yt:videoId>older000001</yt:videoId><title>Older clip</title><published>2026-10-01T10:00:00+00:00</published></entry>'
            .'<entry><yt:videoId>newer000002</yt:videoId><title>Newer clip</title><published>2026-10-15T10:00:00+00:00</published></entry></feed>';
        Http::fake(['www.youtube.com/feeds/*' => Http::response($xml)]);

        $list = $this->getJson('/api/v1/youtube/shorts')->assertOk()->json();
        $this->assertSame(['newer000002', 'older000001'], array_column($list, 'id'));
        $this->assertSame('https://www.youtube.com/shorts/newer000002', $list[0]['url']);
        $this->assertArrayNotHasKey('is_short', $list[0]);
    }

    public function test_each_short_carries_the_full_video_from_its_description(): void
    {
        config(['services.youtube.channel_id' => 'UCabcdefghijklmnopqrstuv']);
        $xml = '<?xml version="1.0"?><feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">'
            .'<entry><yt:videoId>short000001</yt:videoId><title>Observer</title><published>2026-10-15T10:00:00+00:00</published>'
            .'<media:group><media:description>Watch the full video: https://youtu.be/LONG0000001 #shorts (this clip: https://youtube.com/shorts/short000001)</media:description></media:group></entry>'
            .'<entry><yt:videoId>short000002</yt:videoId><title>No link</title><published>2026-10-14T10:00:00+00:00</published>'
            .'<media:group><media:description>Only https://www.youtube.com/watch?v=short000002 itself</media:description></media:group></entry></feed>';
        Http::fake(['www.youtube.com/feeds/*' => Http::response($xml)]);

        $list = $this->getJson('/api/v1/youtube/shorts')->assertOk()->json();
        $this->assertSame('https://www.youtube.com/watch?v=LONG0000001', $list[0]['full_url']);
        $this->assertNull($list[1]['full_url']);
    }

    public function test_topic_rows_come_from_the_playlists_set_in_site_content(): void
    {
        config(['services.youtube.channel_id' => 'UCabcdefghijklmnopqrstuv']);
        SiteContent::create(['page' => 'meditation', 'data' => ['clipsTopics' => [
            ['title' => 'Meditation basics', 'playlist' => 'https://www.youtube.com/playlist?list=PLbasics0001'],
            ['title' => 'Broken link', 'playlist' => 'not a playlist'],
            ['title' => 'Empty playlist', 'playlist' => 'PLempty00002'],
        ]]]);
        $entry = fn (string $id, string $link) => "<entry><yt:videoId>{$id}</yt:videoId><title>Clip {$id}</title><link rel=\"alternate\" href=\"{$link}\"/><published>2026-10-15T10:00:00+00:00</published></entry>";
        $feed = fn (string $entries) => '<?xml version="1.0"?><feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns="http://www.w3.org/2005/Atom">'.$entries.'</feed>';
        Http::fake([
            'www.youtube.com/feeds/videos.xml?playlist_id=PLbasics0001' => Http::response($feed($entry('basic000001', 'https://www.youtube.com/watch?v=basic000001').$entry('long0000002', 'https://www.youtube.com/watch?v=long0000002'))),
            'www.youtube.com/feeds/videos.xml?playlist_id=PLempty00002' => Http::response($feed('')),
            'www.youtube.com/feeds/*' => Http::response($feed($entry('basic000001', 'https://www.youtube.com/shorts/basic000001'))),
        ]);
        $this->getJson('/api/v1/youtube/shorts')->assertOk(); // the channel's Shorts, so the playlist knows which are Shorts

        $topics = $this->getJson('/api/v1/youtube/topics')->assertOk()->json();
        $this->assertCount(1, $topics);
        $this->assertSame('Meditation basics', $topics[0]['title']);
        $this->assertSame('https://www.youtube.com/playlist?list=PLbasics0001', $topics[0]['url']);
        $this->assertSame(['https://www.youtube.com/shorts/basic000001', 'https://www.youtube.com/watch?v=long0000002'], array_column($topics[0]['items'], 'url'));
    }

    public function test_playlist_ids_are_read_from_links_or_bare_ids(): void
    {
        $this->assertSame('PLx-y_z12345', YouTubeFeed::playlistId('https://youtube.com/playlist?list=PLx-y_z12345&si=abc'));
        $this->assertSame('PLx-y_z12345', YouTubeFeed::playlistId(' PLx-y_z12345 '));
        $this->assertNull(YouTubeFeed::playlistId('https://youtube.com/@GoldenAgeGurus'));
    }

    public function test_an_empty_answer_is_not_remembered(): void
    {
        $this->admin();
        config(['services.youtube.channel_id' => 'UCabcdefghijklmnopqrstuv']);
        Http::fake(['*' => Http::response('', 404)]);
        $this->getJson('/api/v1/admin/testimonials/youtube')->assertOk()->assertJsonCount(0, 'items');
        $this->assertNull(Cache::get('youtube_feed.latest'));
    }

    public function test_shorts_are_read_once_a_day_and_the_last_good_list_stays(): void
    {
        config(['services.youtube.channel_id' => 'UCabcdefghijklmnopqrstuv']);
        $feed = fn (string $id) => '<?xml version="1.0"?><feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns="http://www.w3.org/2005/Atom">'
            ."<entry><yt:videoId>{$id}</yt:videoId><title>Clip</title><published>2026-10-15T10:00:00+00:00</published></entry></feed>";
        Http::fakeSequence('www.youtube.com/feeds/*')
            ->push($feed('first000001'))
            ->push($feed('second00002'))
            ->push('', 500)->push('', 500);
        Http::fake(['www.youtube.com/@*' => Http::response('', 500)]);

        $this->assertSame(['first000001'], array_column($this->getJson('/api/v1/youtube/shorts')->json(), 'id'));

        // Later the same day: the saved list, YouTube isn't asked again.
        $this->travel(5)->hours();
        $this->assertSame(['first000001'], array_column($this->getJson('/api/v1/youtube/shorts')->json(), 'id'));
        Http::assertSentCount(1);

        // The daily refresh picks up the new Short.
        $this->artisan('youtube:refresh')->assertSuccessful();
        $this->assertSame(['second00002'], array_column($this->getJson('/api/v1/youtube/shorts')->json(), 'id'));

        // YouTube down the next day: visitors keep seeing the last good list.
        $this->travel(2)->days();
        $this->assertSame(['second00002'], array_column($this->getJson('/api/v1/youtube/shorts')->json(), 'id'));
    }

    public function test_the_daily_refresh_is_scheduled(): void
    {
        $events = collect(app(Schedule::class)->events());
        $this->assertTrue($events->contains(fn ($e) => str_contains($e->command ?? '', 'youtube:refresh')));
    }

    public function test_a_testimonial_needs_a_quote_or_a_video(): void
    {
        $this->admin();
        $this->postJson('/api/v1/admin/testimonials', ['name' => 'Nobody', 'rating' => 5, 'status' => 'published'])
            ->assertUnprocessable()->assertJsonValidationErrors('quote');
    }
}
