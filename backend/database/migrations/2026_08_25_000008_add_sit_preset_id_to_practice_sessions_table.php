<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('practice_sessions', function (Blueprint $table) {
            $table->foreignId('sit_preset_id')->nullable()->after('member_id')->constrained('sit_presets')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('practice_sessions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('sit_preset_id');
        });
    }
};
