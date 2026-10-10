<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Joins the admin panel's modules to the public site and support desk (additive only).
 *  - support_agents.user_id: an admin/staff user working the desk from the admin panel.
 *  - events.recurrence / timezone: Live Sessions that repeat every day (the daily sits) and the
 *    zone their clock time belongs to, so the site can show each visitor their local time.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('support_agents', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->unique()->after('email')->constrained('users')->nullOnDelete();
        });

        Schema::table('events', function (Blueprint $table) {
            $table->string('recurrence', 10)->default('none')->after('ends_at'); // none | daily
            $table->string('timezone', 64)->nullable()->after('recurrence');     // IANA, e.g. Asia/Kolkata
        });
    }

    public function down(): void
    {
        Schema::table('support_agents', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['recurrence', 'timezone']);
        });
    }
};
