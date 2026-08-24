<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->index('category');
            $table->index('status');
            $table->index('created_at');
        });

        Schema::table('contact_submissions', function (Blueprint $table) {
            $table->index('status');
            $table->index('category');
            $table->index('created_at');
        });

        Schema::table('volunteer_applications', function (Blueprint $table) {
            $table->index('status');
            $table->index('created_at');
        });

        Schema::table('events', function (Blueprint $table) {
            $table->index(['is_published', 'starts_at']);
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropIndex(['category']);
            $table->dropIndex(['status']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('contact_submissions', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['category']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('volunteer_applications', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropIndex(['is_published', 'starts_at']);
        });
    }
};
