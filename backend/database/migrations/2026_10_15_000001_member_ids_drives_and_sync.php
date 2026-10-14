<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * One person, one record, one member number — across the member area, volunteers,
 * the support desk and the live site's Supabase data.
 *
 *  - members.member_num: the GAW-nnnnnn number (same scheme as Supabase gaw_signup).
 *  - members.phone_key: the phone in digits-with-country-code, used to match people
 *    who arrive by phone (drives, support calls) with people who arrive by email.
 *  - membership_drives: a sign-up drive (camp, satsang, event) where phone numbers are
 *    collected and members are created in bulk.
 *  - reserved_member_numbers: ceremonial numbers that are never handed out in sequence.
 *  - volunteer_applications.member_id, and import_key columns so a Supabase sync can be
 *    run again and again without creating duplicates.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_drives', function (Blueprint $table) {
            $table->id();
            $table->string('name', 160);
            $table->string('place', 160)->nullable();
            $table->date('held_on')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('reserved_member_numbers', function (Blueprint $table) {
            $table->unsignedInteger('member_num')->primary();
            $table->string('name', 120)->default('');
            $table->string('email', 190)->nullable();
            $table->string('role', 60)->default('');
            $table->timestamps();
        });

        Schema::table('members', function (Blueprint $table) {
            $table->unsignedInteger('member_num')->nullable()->unique()->after('id');
            $table->string('phone_key', 20)->nullable()->index()->after('phone');
            $table->string('role_title', 60)->nullable()->after('category'); // "Founder", "Core team"
            $table->string('source', 20)->nullable()->after('status'); // google | password | volunteer | drive | support | admin | query | import
            $table->foreignId('drive_id')->nullable()->after('source')->constrained('membership_drives')->nullOnDelete();
        });

        Schema::table('volunteer_applications', function (Blueprint $table) {
            $table->foreignId('member_id')->nullable()->after('member_num')->constrained('members')->nullOnDelete();
        });

        Schema::table('practice_sessions', function (Blueprint $table) {
            $table->string('via', 20)->nullable()->after('duration_minutes');
            $table->string('import_key', 64)->nullable()->unique();
        });

        Schema::table('member_journal_entries', function (Blueprint $table) {
            $table->string('import_key', 64)->nullable()->unique();
        });

        Schema::table('tickets', function (Blueprint $table) {
            $table->string('import_key', 64)->nullable()->unique();
        });

        DB::table('reserved_member_numbers')->insert([
            ['member_num' => 111111, 'name' => 'Dr. Hari Krishna', 'email' => null, 'role' => 'Founder', 'created_at' => now(), 'updated_at' => now()],
            ['member_num' => 100001, 'name' => 'Hemanth Puppala', 'email' => 'hemanthpuppala@gmail.com', 'role' => 'Core team', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Backfill: phone keys, then numbers in join order (reserved seats first, then sequence).
        foreach (DB::table('members')->whereNotNull('phone')->get(['id', 'phone']) as $m) {
            $digits = ltrim(preg_replace('/\D+/', '', (string) $m->phone), '0');
            $key = strlen($digits) === 10 ? '91'.$digits : ($digits !== '' ? $digits : null);
            DB::table('members')->where('id', $m->id)->update(['phone_key' => $key && strlen($key) >= 8 ? substr($key, 0, 20) : null]);
        }

        $reserved = DB::table('reserved_member_numbers')->get()->keyBy(fn ($r) => strtolower((string) $r->email));
        $taken = DB::table('reserved_member_numbers')->pluck('member_num')->all();
        $next = 100001;
        foreach (DB::table('members')->orderBy('id')->get(['id', 'email']) as $m) {
            $seat = $m->email ? $reserved->get(strtolower($m->email)) : null;
            if ($seat) {
                DB::table('members')->where('id', $m->id)->update(['member_num' => $seat->member_num, 'role_title' => $seat->role ?: null]);

                continue;
            }
            while (in_array($next, $taken, true)) {
                $next++;
            }
            DB::table('members')->where('id', $m->id)->update(['member_num' => $next]);
            $taken[] = $next;
        }

        // Volunteers already carrying a member number or a member's email get linked.
        foreach (DB::table('volunteer_applications')->get(['id', 'email']) as $a) {
            $member = DB::table('members')->whereRaw('lower(email) = ?', [strtolower((string) $a->email)])->whereNull('deleted_at')->first(['id', 'member_num']);
            if ($member) {
                DB::table('volunteer_applications')->where('id', $a->id)->update(['member_id' => $member->id, 'member_num' => $member->member_num]);
            }
        }
    }

    public function down(): void
    {
        foreach (['tickets', 'member_journal_entries'] as $t) {
            Schema::table($t, function (Blueprint $table) {
                $table->dropUnique(['import_key']);
                $table->dropColumn('import_key');
            });
        }
        Schema::table('practice_sessions', function (Blueprint $table) {
            $table->dropUnique(['import_key']);
            $table->dropColumn(['via', 'import_key']);
        });
        Schema::table('volunteer_applications', fn (Blueprint $table) => $table->dropConstrainedForeignId('member_id'));
        Schema::table('members', function (Blueprint $table) {
            $table->dropConstrainedForeignId('drive_id');
            $table->dropUnique(['member_num']);
            $table->dropIndex(['phone_key']);
            $table->dropColumn(['member_num', 'phone_key', 'role_title', 'source']);
        });
        Schema::dropIfExists('reserved_member_numbers');
        Schema::dropIfExists('membership_drives');
    }
};
