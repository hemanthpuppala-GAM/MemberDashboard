<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Video testimonials ("Seeker stories" on the Home page): a YouTube/Shorts link or an uploaded file, plus the person's town. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('testimonials', function (Blueprint $table) {
            $table->string('video_url', 500)->nullable()->after('quote');
            $table->string('place', 120)->nullable()->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('testimonials', function (Blueprint $table) {
            $table->dropColumn(['video_url', 'place']);
        });
    }
};
