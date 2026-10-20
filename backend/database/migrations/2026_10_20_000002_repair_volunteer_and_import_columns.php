<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Repair: on staging, volunteer_applications came back with only its original columns although
 * 2026_10_10_000002 and 2026_10_15_000001 are recorded as run (the table was re-created), so the
 * Members list failed on `volunteer_applications.member_id`. Adds back whatever those two
 * migrations added that is missing — every step checks first, so it is a no-op where all is in
 * place — and links volunteers to members by email again.
 */
return new class extends Migration
{
    public function up(): void
    {
        $add = fn (string $table, string $column, callable $define) => Schema::hasColumn($table, $column)
            ?: Schema::table($table, fn (Blueprint $t) => $define($t));

        $add('volunteer_applications', 'occupation', fn ($t) => $t->string('occupation', 120)->default(''));
        $add('volunteer_applications', 'city', fn ($t) => $t->string('city', 120)->default(''));
        $add('volunteer_applications', 'lang', fn ($t) => $t->string('lang', 20)->default('EN'));
        $add('volunteer_applications', 'teams', fn ($t) => $t->json('teams')->nullable());
        $add('volunteer_applications', 'availability', fn ($t) => $t->string('availability', 120)->default(''));
        $add('volunteer_applications', 'member_num', fn ($t) => $t->unsignedInteger('member_num')->nullable()->index());
        $add('volunteer_applications', 'member_id', fn ($t) => $t->foreignId('member_id')->nullable()->constrained('members')->nullOnDelete());
        if (! Schema::hasIndex('volunteer_applications', ['email'])) {
            Schema::table('volunteer_applications', fn (Blueprint $t) => $t->index('email'));
        }

        $add('practice_sessions', 'via', fn ($t) => $t->string('via', 20)->nullable());
        foreach (['practice_sessions', 'member_journal_entries', 'tickets'] as $table) {
            $add($table, 'import_key', fn ($t) => $t->string('import_key', 64)->nullable()->unique());
        }

        // Volunteers carrying a member's email are that member.
        foreach (DB::table('volunteer_applications')->whereNull('member_id')->get(['id', 'email']) as $a) {
            $member = DB::table('members')->whereRaw('lower(email) = ?', [strtolower((string) $a->email)])->whereNull('deleted_at')->first(['id', 'member_num']);
            if ($member) {
                DB::table('volunteer_applications')->where('id', $a->id)->update(['member_id' => $member->id, 'member_num' => $member->member_num]);
            }
        }
    }

    public function down(): void
    {
        // A repair: the columns belong to the two migrations above, whose down() removes them.
    }
};
