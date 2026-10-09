<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Brings volunteer applications level with the live site's Supabase `volunteers` table. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('volunteer_applications', function (Blueprint $table) {
            $table->string('occupation', 120)->default('')->after('phone');
            $table->string('city', 120)->default('')->after('occupation');
            $table->string('lang', 20)->default('EN')->after('city');
            $table->json('teams')->nullable()->after('category_id'); // volunteer_categories.slug[]
            $table->string('availability', 120)->default('')->after('teams');
            $table->unsignedInteger('member_num')->nullable()->after('availability'); // GAW-nnnnnn
            $table->index('email');
            $table->index('member_num');
        });
    }

    public function down(): void
    {
        Schema::table('volunteer_applications', function (Blueprint $table) {
            $table->dropIndex(['email']);
            $table->dropIndex(['member_num']);
            $table->dropColumn(['occupation', 'city', 'lang', 'teams', 'availability', 'member_num']);
        });
    }
};
