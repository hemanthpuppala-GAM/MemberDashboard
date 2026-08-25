<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sit_presets', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->unsignedSmallInteger('duration_minutes');
            $table->foreignId('music_track_id')->nullable()->constrained('music_tracks')->nullOnDelete();
            $table->string('status')->default('draft');
            $table->unsignedInteger('sort_order')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sit_presets');
    }
};
