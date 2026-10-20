<?php

namespace Tests\Feature;

use App\Models\People\Member;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class RepairMigrationTest extends TestCase
{
    use RefreshDatabase;

    private function repair(): void
    {
        (require database_path('migrations/2026_10_20_000002_repair_volunteer_and_import_columns.php'))->up();
    }

    public function test_it_restores_a_volunteer_table_that_lost_its_columns(): void
    {
        $member = Member::create(['name' => 'Asha', 'email' => 'asha@example.com', 'category' => 'general', 'join_date' => now()]);

        // The staging state: the table re-created with only its first columns.
        Schema::drop('volunteer_applications');
        Schema::create('volunteer_applications', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('email');
            $t->string('phone', 50);
            $t->foreignId('category_id')->nullable();
            $t->text('notes')->nullable();
            $t->string('status')->default('new');
            $t->timestamps();
        });
        DB::table('volunteer_applications')->insert(['name' => 'Asha', 'email' => 'ASHA@example.com', 'phone' => '1', 'created_at' => now(), 'updated_at' => now()]);

        $this->repair();

        foreach (['occupation', 'city', 'lang', 'teams', 'availability', 'member_num', 'member_id'] as $column) {
            $this->assertTrue(Schema::hasColumn('volunteer_applications', $column), $column);
        }
        $row = DB::table('volunteer_applications')->first();
        $this->assertSame($member->id, (int) $row->member_id);
        $this->assertSame($member->member_num, (int) $row->member_num);
    }

    public function test_it_changes_nothing_where_everything_is_in_place(): void
    {
        $before = Schema::getColumnListing('volunteer_applications');
        $this->repair();
        $this->repair();
        $this->assertSame($before, Schema::getColumnListing('volunteer_applications'));
    }

    private function repairForms(): void
    {
        (require database_path('migrations/2026_10_20_000003_repair_categories_and_registration_forms.php'))->up();
    }

    public function test_it_restores_categories_and_empty_registration_form_tables(): void
    {
        // The staging state: categories without slug/description, form tables with only id + timestamps.
        Schema::disableForeignKeyConstraints();
        foreach (['registration_form_submissions', 'registration_form_fields', 'registration_forms', 'volunteer_categories'] as $t) {
            Schema::drop($t);
        }
        Schema::enableForeignKeyConstraints();
        Schema::create('volunteer_categories', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->boolean('is_active')->default(true);
            $t->unsignedInteger('sort_order')->default(0);
            $t->timestamps();
        });
        DB::table('volunteer_categories')->insert(['name' => 'Media & Design', 'created_at' => now(), 'updated_at' => now()]);
        foreach (['registration_forms', 'registration_form_fields', 'registration_form_submissions'] as $t) {
            Schema::create($t, function (Blueprint $b) {
                $b->id();
                $b->timestamps();
            });
        }

        $this->repairForms();

        $this->assertTrue(Schema::hasColumns('volunteer_categories', ['slug', 'description']));
        $this->assertSame('media-design', DB::table('volunteer_categories')->where('name', 'Media & Design')->value('slug'));
        $this->assertGreaterThan(1, DB::table('volunteer_categories')->count(), 'the live site teams are seeded');
        $this->assertTrue(Schema::hasColumns('registration_forms', ['title', 'slug', 'status', 'submit_label']));
        $this->assertTrue(Schema::hasColumns('registration_form_fields', ['form_id', 'field_key', 'label', 'type']));
        $this->assertTrue(Schema::hasColumns('registration_form_submissions', ['form_id', 'data', 'status']));

        // Running again changes nothing.
        $count = DB::table('volunteer_categories')->count();
        $this->repairForms();
        $this->assertSame($count, DB::table('volunteer_categories')->count());
    }

    public function test_the_form_repair_is_a_no_op_on_a_complete_database(): void
    {
        $count = DB::table('volunteer_categories')->count();
        $this->repairForms();
        $this->assertSame($count, DB::table('volunteer_categories')->count());
        $this->assertTrue(Schema::hasColumn('registration_forms', 'title'));
    }
}
