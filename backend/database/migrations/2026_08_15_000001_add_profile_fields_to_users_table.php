<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar_path')->nullable()->after('password');
            $table->string('specialty')->nullable()->after('avatar_path');
            $table->text('bio')->nullable()->after('specialty');
            $table->unsignedInteger('max_capacity')->nullable()->after('bio');
            $table->string('status')->default('active')->after('max_capacity');
            $table->timestamp('last_login_at')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar_path', 'specialty', 'bio', 'max_capacity', 'status', 'last_login_at']);
        });
    }
};
