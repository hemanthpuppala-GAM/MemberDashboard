<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Videos already copied from the Google Drive testimonials folder. A row stays after its
 * testimonial is deleted, so a video the team removed isn't imported again the next day.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('drive_imports', function (Blueprint $table) {
            $table->id();
            $table->string('file_id', 100)->unique();
            $table->string('file_name')->nullable();
            $table->foreignId('testimonial_id')->nullable()->constrained('testimonials')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('drive_imports');
    }
};
