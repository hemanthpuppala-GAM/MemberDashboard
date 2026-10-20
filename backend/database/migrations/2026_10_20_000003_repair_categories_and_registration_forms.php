<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Repair, like 2026_10_20_000002: on staging, volunteer_categories lacks the columns of
 * 2026_10_10_000001, and the three registration-form tables hold only id + timestamps, although
 * those migrations are recorded as run. Each step checks first, so this is a no-op where the
 * schema is complete.
 */
return new class extends Migration
{
    public function up(): void
    {
        $this->volunteerCategories();
        $this->registrationForms();
    }

    private function volunteerCategories(): void
    {
        if (! Schema::hasColumn('volunteer_categories', 'slug')) {
            Schema::table('volunteer_categories', fn (Blueprint $t) => $t->string('slug', 60)->nullable()->unique());
        }
        if (! Schema::hasColumn('volunteer_categories', 'description')) {
            Schema::table('volunteer_categories', fn (Blueprint $t) => $t->text('description')->nullable());
        }

        // As 2026_10_10_000001: slugs for existing categories, then the live site's teams.
        foreach (DB::table('volunteer_categories')->whereNull('slug')->orderBy('id')->get() as $category) {
            $base = Str::slug($category->name) ?: 'team';
            $slug = $base;
            for ($i = 2; DB::table('volunteer_categories')->where('slug', $slug)->exists(); $i++) {
                $slug = $base.'-'.$i;
            }
            DB::table('volunteer_categories')->where('id', $category->id)->update(['slug' => $slug]);
        }
        $teams = (require database_path('migrations/2026_10_10_000001_add_slug_and_description_to_volunteer_categories_table.php'))::TEAMS;
        $order = (int) DB::table('volunteer_categories')->max('sort_order');
        foreach ($teams as [$slug, $name, $description]) {
            if (! DB::table('volunteer_categories')->where('slug', $slug)->exists()) {
                DB::table('volunteer_categories')->insert([
                    'name' => $name, 'slug' => $slug, 'description' => $description,
                    'is_active' => true, 'sort_order' => ++$order, 'created_at' => now(), 'updated_at' => now(),
                ]);
            }
        }
    }

    /** Empty, column-less tables are rebuilt as 2026_09_01_00000{1,2,3} define them. */
    private function registrationForms(): void
    {
        $broken = ! Schema::hasColumn('registration_forms', 'title')
            || ! Schema::hasColumn('registration_form_fields', 'form_id')
            || ! Schema::hasColumn('registration_form_submissions', 'form_id');
        if (! $broken) {
            return;
        }
        foreach (['registration_form_submissions', 'registration_form_fields', 'registration_forms'] as $table) {
            if (DB::table($table)->exists()) {
                throw new RuntimeException("{$table} has rows but is missing its columns — repair it by hand, nothing was changed.");
            }
        }

        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('registration_form_submissions');
        Schema::dropIfExists('registration_form_fields');
        Schema::dropIfExists('registration_forms');
        Schema::enableForeignKeyConstraints();

        foreach (['000001_create_registration_forms_table', '000002_create_registration_form_fields_table', '000003_create_registration_form_submissions_table'] as $file) {
            (require database_path("migrations/2026_09_01_{$file}.php"))->up();
        }
    }

    public function down(): void
    {
        // A repair: the columns belong to the original migrations.
    }
};
