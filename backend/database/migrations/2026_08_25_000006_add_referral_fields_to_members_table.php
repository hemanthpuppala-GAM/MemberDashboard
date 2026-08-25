<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->string('referral_code', 12)->nullable()->unique()->after('password');
            $table->string('referred_by_code', 12)->nullable()->after('referral_code');
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropUnique(['referral_code']);
            $table->dropColumn(['referral_code', 'referred_by_code']);
        });
    }
};
