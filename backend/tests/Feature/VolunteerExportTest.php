<?php

namespace Tests\Feature;

use App\Models\Auth\Role;
use App\Models\Auth\User;
use App\Models\Content\VolunteerCategory;
use App\Models\People\VolunteerApplication;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class VolunteerExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_downloads_the_filtered_applications_as_csv(): void
    {
        $role = Role::create(['name' => Role::SUPER_ADMIN, 'display_name' => 'Super admin']);
        $user = User::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => 'secret-pass']);
        $user->roles()->attach($role);
        $helpline = VolunteerCategory::firstOrCreate(['slug' => 'helpline'], ['name' => 'Helpline'])->name;
        VolunteerApplication::create(['name' => 'రవి వాసా', 'email' => 'ravi@example.com', 'phone' => '+919490719188', 'city' => 'Vijayawada', 'teams' => ['helpline'], 'notes' => '=HYPERLINK("x")', 'status' => 'new']);
        VolunteerApplication::create(['name' => 'Old One', 'email' => 'old@example.com', 'phone' => '900', 'teams' => [], 'status' => 'archived']);

        $this->getJson('/api/v1/admin/volunteer-applications/export')->assertUnauthorized();
        Sanctum::actingAs($user, [], 'sanctum');

        $res = $this->get('/api/v1/admin/volunteer-applications/export?status=new')->assertOk();
        $this->assertStringContainsString('attachment; filename="volunteer-applications-', $res->headers->get('Content-Disposition'));
        $csv = $res->getContent();
        $this->assertStringStartsWith("\u{FEFF}Member ID,Name,Email,Mobile,Teams", $csv);
        $this->assertStringContainsString('"రవి వాసా","ravi@example.com","+919490719188","'.$helpline.'"', $csv);
        $this->assertStringContainsString('"\'=HYPERLINK(""x"")"', $csv); // never runs as a formula
        $this->assertStringNotContainsString('Old One', $csv); // filtered by status
        $this->assertCount(2, array_filter(explode("\n", $csv)));
    }
}
