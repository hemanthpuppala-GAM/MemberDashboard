<?php

namespace Tests\Feature;

use App\Models\Content\VolunteerCategory;
use App\Models\People\VolunteerApplication;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VolunteerApplicationTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Asha Rao',
            'email' => 'asha@example.com',
            'phone' => '+91 98765 43210',
            'occupation' => 'Teacher',
            'city' => 'Hyderabad',
            'lang' => 'te',
            'teams' => ['helpline', 'tech'],
            'availability' => 'A few hours a week',
            'notes' => 'Evenings are best.',
        ], $overrides);
    }

    public function test_migration_seeds_the_live_site_teams(): void
    {
        $this->assertEqualsCanonicalizing(
            ['events-setup', 'helpline', 'local-event', 'kundalini-share', 'donor', 'social-media', 'tech'],
            VolunteerCategory::whereNotNull('slug')->pluck('slug')->all(),
        );
    }

    public function test_volunteer_can_apply_with_multiple_teams_and_profile_fields(): void
    {
        $this->postJson('/api/v1/volunteer-applications', $this->payload())
            ->assertCreated()
            ->assertJson(['occupation' => 'Teacher', 'city' => 'Hyderabad', 'lang' => 'TE', 'teams' => ['helpline', 'tech']]);

        $app = VolunteerApplication::sole();
        $this->assertSame('A few hours a week', $app->availability);
        $this->assertSame(VolunteerCategory::where('slug', 'helpline')->value('id'), $app->category_id);
        $this->assertNull($app->member_id);
    }

    public function test_older_clients_sending_only_category_id_still_work(): void
    {
        $tech = VolunteerCategory::where('slug', 'tech')->first();

        $this->postJson('/api/v1/volunteer-applications', $this->payload(['teams' => null, 'category_id' => $tech->id, 'occupation' => null]))
            ->assertCreated()
            ->assertJson(['teams' => ['tech'], 'occupation' => '']);
    }

    public function test_unknown_or_inactive_team_and_bad_availability_are_rejected(): void
    {
        VolunteerCategory::where('slug', 'donor')->update(['is_active' => false]);

        $this->postJson('/api/v1/volunteer-applications', $this->payload(['teams' => ['donor', 'astronauts'], 'availability' => 'Sometimes']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['teams.0', 'teams.1', 'availability']);

        $this->postJson('/api/v1/volunteer-applications', $this->payload(['teams' => []]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['teams']);
    }

    public function test_new_category_gets_a_unique_slug(): void
    {
        $a = VolunteerCategory::create(['name' => 'Kitchen Seva']);
        $b = VolunteerCategory::create(['name' => 'Kitchen Seva']);

        $this->assertSame('kitchen-seva', $a->slug);
        $this->assertSame('kitchen-seva-2', $b->slug);
    }

    public function test_member_id_is_derived_from_member_num(): void
    {
        $app = VolunteerApplication::create($this->payload(['member_num' => 100023, 'category_id' => null]));

        $this->assertSame('GAW-100023', $app->fresh()->member_id);
    }
}
