<?php

namespace Tests\Feature;

use App\Models\Auth\Role;
use App\Models\Auth\User;
use App\Models\Cms\Page;
use App\Models\Cms\PageSection;
use App\Models\Cms\SectionContent;
use App\Models\Languages\Language;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CmsPageTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsSuperAdmin(): void
    {
        $role = Role::create(['name' => Role::SUPER_ADMIN, 'display_name' => 'Super admin']);
        $user = User::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => 'secret-pass']);
        $user->roles()->attach($role);
        Sanctum::actingAs($user, [], 'sanctum');
    }

    public function test_new_pages_cannot_take_a_url_the_site_already_uses(): void
    {
        $this->actingAsSuperAdmin();

        $this->postJson('/api/v1/admin/pages', ['slug' => 'join', 'title' => 'Join', 'status' => 'draft'])
            ->assertUnprocessable()->assertJsonValidationErrors('slug');
        $this->postJson('/api/v1/admin/pages', ['slug' => 'retreats', 'title' => 'Retreats', 'status' => 'draft'])
            ->assertCreated();
    }

    public function test_published_cms_page_is_listed_and_served_with_its_active_sections(): void
    {
        $en = Language::create(['name' => 'English', 'native_name' => 'English', 'code' => 'en', 'direction' => 'ltr', 'is_enabled' => true, 'is_default' => true]);
        $page = Page::create(['slug' => 'retreats', 'title' => 'Retreats', 'status' => 'published', 'is_builtin' => false]);
        $shown = PageSection::create(['page_id' => $page->id, 'type' => 'content_block', 'sort_order' => 1, 'status' => 'active']);
        $hidden = PageSection::create(['page_id' => $page->id, 'type' => 'card_grid', 'sort_order' => 2, 'status' => 'hidden']);
        SectionContent::create(['section_id' => $shown->id, 'language_id' => $en->id, 'field_key' => 'heading', 'field_value' => 'Silent retreat', 'field_type' => 'text']);
        SectionContent::create(['section_id' => $hidden->id, 'language_id' => $en->id, 'field_key' => 'heading', 'field_value' => 'Hidden', 'field_type' => 'text']);
        Page::create(['slug' => 'draft-page', 'title' => 'Draft', 'status' => 'draft', 'is_builtin' => false]);

        $this->getJson('/api/v1/pages')->assertOk()->assertJsonCount(1)->assertJsonPath('0.slug', 'retreats');

        $this->getJson('/api/v1/pages/retreats')->assertOk()
            ->assertJsonPath('title', 'Retreats')
            ->assertJsonCount(1, 'sections')
            ->assertJsonPath('sections.0.fields.heading', 'Silent retreat');
        $this->getJson('/api/v1/pages/draft-page')->assertNotFound();
    }

    public function test_built_in_pages_show_only_new_sections_on_the_new_site(): void
    {
        $en = Language::create(['name' => 'English', 'native_name' => 'English', 'code' => 'en', 'direction' => 'ltr', 'is_enabled' => true, 'is_default' => true]);
        $about = Page::create(['slug' => 'about', 'title' => 'About', 'status' => 'published', 'is_builtin' => true]);
        $legacy = PageSection::create(['page_id' => $about->id, 'type' => 'content_block', 'sort_order' => 1, 'status' => 'active']);
        $legacy->forceFill(['created_at' => '2026-01-01 00:00:00'])->save();
        PageSection::create(['page_id' => $about->id, 'type' => 'card_grid', 'sort_order' => 2, 'status' => 'active']);

        $this->getJson('/api/v1/pages/about')->assertOk()->assertJsonCount(2, 'sections');
        $this->getJson('/api/v1/pages/about?placement=site')->assertOk()
            ->assertJsonCount(1, 'sections')->assertJsonPath('sections.0.type', 'card_grid');
    }
}
