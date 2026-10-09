<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Volunteer categories become the "teams" a volunteer can pick (several at once),
 * keyed by the same slugs the live site's Supabase `volunteers.teams` uses, so
 * existing applications import without a mapping table.
 */
return new class extends Migration
{
    private const TEAMS = [
        ['events-setup', 'Events — on the ground', 'Setting up halls, chairs, mats, sound and signage. Arrive early, leave last.'],
        ['helpline', 'Helpline — first level', 'Answer the first message or call, understand what is being asked, and pass it to the right team.'],
        ['local-event', 'Local event volunteer', 'Host or help run sits and gatherings in your own city.'],
        ['kundalini-share', 'Experiences & doubts — for seasoned meditators', 'Members write in about what rose in meditation. You have sat long enough to answer plainly and leave them unworried.'],
        ['donor', 'Donor member', 'A small gift, whatever feels right, helps keep the teachings free for all.'],
        ['social-media', 'Social media', 'Write, film, edit and post — carry the work to people who have not heard of it.'],
        ['tech', 'Tech', 'The website, the streams, the member tools. Anything that has to keep working.'],
    ];

    public function up(): void
    {
        Schema::table('volunteer_categories', function (Blueprint $table) {
            $table->string('slug', 60)->nullable()->unique()->after('name');
            $table->text('description')->nullable()->after('slug');
        });

        // Categories created before this migration get a slug from their name.
        foreach (DB::table('volunteer_categories')->whereNull('slug')->orderBy('id')->get() as $category) {
            $base = Str::slug($category->name) ?: 'team';
            $slug = $base;
            for ($i = 2; DB::table('volunteer_categories')->where('slug', $slug)->exists(); $i++) {
                $slug = $base.'-'.$i;
            }
            DB::table('volunteer_categories')->where('id', $category->id)->update(['slug' => $slug]);
        }

        $order = (int) DB::table('volunteer_categories')->max('sort_order');
        foreach (self::TEAMS as [$slug, $name, $description]) {
            if (DB::table('volunteer_categories')->where('slug', $slug)->exists()) {
                continue;
            }
            DB::table('volunteer_categories')->insert([
                'name' => $name, 'slug' => $slug, 'description' => $description,
                'is_active' => true, 'sort_order' => ++$order,
                'created_at' => now(), 'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('volunteer_categories')->whereIn('slug', array_column(self::TEAMS, 0))->delete();

        Schema::table('volunteer_categories', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropColumn(['slug', 'description']);
        });
    }
};
