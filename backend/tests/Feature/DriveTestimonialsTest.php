<?php

namespace Tests\Feature;

use App\Models\Auth\Role;
use App\Models\Auth\User;
use App\Models\Content\DriveImport;
use App\Models\Content\Testimonial;
use App\Services\Content\DriveTestimonials;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DriveTestimonialsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        config(['services.google_drive.api_key' => 'test-key', 'services.google_drive.testimonials_folder' => 'FOLDER123']);
    }

    private function admin(): void
    {
        $role = Role::create(['name' => Role::SUPER_ADMIN, 'display_name' => 'Super admin']);
        $user = User::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => 'secret-pass']);
        $user->roles()->attach($role);
        Sanctum::actingAs($user, [], 'sanctum');
    }

    private function fakeDrive(array $files): void
    {
        Http::fake([
            'www.googleapis.com/drive/v3/files/*' => Http::response('fake-video-bytes', 200, ['Content-Type' => 'video/mp4']),
            'www.googleapis.com/drive/v3/files?*' => Http::response(['files' => $files]),
        ]);
    }

    public function test_new_drive_videos_become_draft_stories_once(): void
    {
        $this->fakeDrive([
            ['id' => 'f1', 'name' => 'Lakshmi - Hyderabad.mp4', 'size' => '1000', 'mimeType' => 'video/mp4'],
            ['id' => 'f2', 'name' => 'VID_20261019.mov', 'size' => '1000', 'mimeType' => 'video/quicktime'],
            ['id' => 'big', 'name' => 'Huge.mp4', 'size' => (string) (500 * 1048576), 'mimeType' => 'video/mp4'],
        ]);

        $this->artisan('testimonials:drive-import')->assertSuccessful();

        $seeded = Testimonial::count() - 2; // the site's text testimonials come with the database
        $rows = Testimonial::whereIn('id', DriveImport::pluck('testimonial_id'))->orderBy('id')->get();
        $this->assertSame(['Lakshmi', 'VID 20261019'], $rows->pluck('name')->all());
        $this->assertSame('Hyderabad', $rows[0]->place);
        $this->assertSame(['draft', 'draft'], $rows->pluck('status')->all());
        $this->assertStringEndsWith('.mov', $rows[1]->video_url);
        $this->assertCount(2, Storage::disk('public')->files('testimonials/videos'));

        // Drafts are not on the Home page until published.
        $this->assertCount(0, $this->getJson('/api/v1/testimonials/videos')->json());

        // Running again copies nothing new — even after a draft is deleted.
        $rows[1]->delete();
        $this->artisan('testimonials:drive-import')->assertSuccessful();
        $this->assertSame($seeded + 1, Testimonial::count());
        Http::assertSentCount(4); // list + 2 downloads, then a second list
    }

    public function test_home_page_stories_follow_the_drive_upload_time(): void
    {
        $this->fakeDrive([
            ['id' => 'old', 'name' => 'Older.mp4', 'size' => '10', 'mimeType' => 'video/mp4', 'createdTime' => '2026-10-10T09:00:00.000Z'],
            ['id' => 'new', 'name' => 'Newer.mp4', 'size' => '10', 'mimeType' => 'video/mp4', 'createdTime' => '2026-10-18T09:00:00.000Z'],
        ]);
        $this->artisan('testimonials:drive-import')->assertSuccessful();
        Testimonial::whereIn('name', ['Older', 'Newer'])->update(['status' => 'published']);

        $this->assertSame(['Newer', 'Older'], array_column($this->getJson('/api/v1/testimonials/videos')->json(), 'name'));

        // Videos imported before upload times were kept get them on the next run.
        Testimonial::where('name', 'Older')->update(['created_at' => '2026-10-30 00:00:00']);
        $this->artisan('testimonials:drive-import')->assertSuccessful();
        $this->assertSame(['Newer', 'Older'], array_column($this->getJson('/api/v1/testimonials/videos')->json(), 'name'));
        $this->assertSame('2026-10-10 09:00:00', Testimonial::where('name', 'Older')->value('created_at')->format('Y-m-d H:i:s'));
    }

    public function test_admin_can_check_drive_now_and_sees_which_came_from_drive(): void
    {
        $this->admin();
        $this->fakeDrive([['id' => 'f1', 'name' => 'Ravi, Vizag.mp4', 'size' => '10', 'mimeType' => 'video/mp4']]);

        $this->postJson('/api/v1/admin/testimonials/drive-import')->assertOk()
            ->assertJson(['imported' => ['Ravi, Vizag.mp4'], 'remaining' => 0]);

        $list = collect($this->getJson('/api/v1/admin/testimonials')->assertOk()->json());
        $ravi = $list->firstWhere('name', 'Ravi');
        $this->assertSame('Vizag', $ravi['place']);
        $this->assertTrue($ravi['from_drive']);
        $this->assertFalse($list->firstWhere('name', '!=', 'Ravi')['from_drive']);
    }

    public function test_clear_messages_when_drive_is_not_set_up_or_refuses(): void
    {
        $this->admin();
        config(['services.google_drive.api_key' => null]);
        $this->postJson('/api/v1/admin/testimonials/drive-import')->assertStatus(422)
            ->assertJsonFragment(['message' => 'Google Drive is not set up yet. Add GOOGLE_DRIVE_API_KEY and GOOGLE_DRIVE_TESTIMONIALS_FOLDER to the server .env, then run php artisan config:cache.']);

        config(['services.google_drive.api_key' => 'test-key']);
        Http::fake(['www.googleapis.com/*' => Http::response(['error' => ['message' => 'File not found']], 404)]);
        $message = $this->postJson('/api/v1/admin/testimonials/drive-import')->assertStatus(502)->json('message');
        $this->assertStringContainsString('Anyone with the link', $message);
    }

    public function test_file_names_give_name_and_place(): void
    {
        $this->assertSame(['Lakshmi', 'Hyderabad'], DriveTestimonials::nameAndPlace('Lakshmi - Hyderabad.mp4'));
        $this->assertSame(['Prem Kumar', 'Guntur'], DriveTestimonials::nameAndPlace('Prem Kumar – Guntur.MOV'));
        $this->assertSame(['Aruna', null], DriveTestimonials::nameAndPlace('Aruna.mp4'));
    }
}
