<?php

namespace Tests\Feature;

use App\Models\Auth\Role;
use App\Models\Auth\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DailyQuoteTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function admin(): void
    {
        $role = Role::create(['name' => Role::SUPER_ADMIN, 'display_name' => 'Super admin']);
        $user = User::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => 'secret-pass']);
        $user->roles()->attach($role);
        Sanctum::actingAs($user, [], 'sanctum');
    }

    public function test_a_week_of_posters_is_scheduled_one_per_day_and_home_shows_todays(): void
    {
        Storage::fake('public');
        // 20:00 UTC on the 15th is already the 16th in India.
        Carbon::setTestNow(Carbon::parse('2026-10-15 20:00:00', 'UTC'));
        $this->admin();

        $this->getJson('/api/v1/daily-quote')->assertOk()->assertJson(['today' => null, 'recent' => []]);

        $this->post('/api/v1/admin/daily-quotes', [
            'start_on' => '2026-10-15',
            'author' => 'Sreedhar Saraswathi',
            'images' => [
                UploadedFile::fake()->image('a.jpg', 900, 1600),
                UploadedFile::fake()->image('b.jpg', 900, 1600),
                UploadedFile::fake()->image('c.jpg', 900, 1600),
            ],
        ], ['Accept' => 'application/json'])->assertCreated()->assertJsonCount(3);

        $res = $this->getJson('/api/v1/daily-quote')->assertOk()->json();
        $this->assertSame('2026-10-16', $res['today']['show_on']);
        $this->assertCount(2, $res['recent']); // the 17th is not shown yet
        $this->assertSame('Sreedhar Saraswathi', $res['today']['author']);
        $this->assertNotEmpty($res['today']['image_url']);

        // Drafts are hidden; deleting falls back to the previous day.
        $this->putJson("/api/v1/admin/daily-quotes/{$res['today']['id']}", ['status' => 'draft', 'title' => 'Jnanagni'])->assertOk();
        $this->assertSame('2026-10-15', $this->getJson('/api/v1/daily-quote')->json('today.show_on'));
        $this->getJson('/api/v1/admin/daily-quotes')->assertOk()->assertJsonCount(3, 'quotes');
    }

    public function test_non_images_are_rejected(): void
    {
        $this->admin();
        $this->post('/api/v1/admin/daily-quotes', ['images' => [UploadedFile::fake()->create('x.pdf', 10, 'application/pdf')]], ['Accept' => 'application/json'])
            ->assertUnprocessable();
    }
}
