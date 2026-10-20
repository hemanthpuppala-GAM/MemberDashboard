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
}
