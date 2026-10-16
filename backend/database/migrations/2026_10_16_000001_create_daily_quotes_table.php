<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Quote of the day: the "Golden Age Daily Musings" posters. One per day (show_on, India date);
 * the Home page shows the latest one dated today or earlier.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_quotes', function (Blueprint $table) {
            $table->id();
            $table->string('image_path', 500);
            $table->string('title', 200)->nullable(); // e.g. "Jnanagni Dhagdha Karmanam"
            $table->text('text')->nullable();          // the words on the poster (alt text / share text)
            $table->string('author', 120)->nullable();
            $table->date('show_on')->index();
            $table->string('status', 20)->default('published'); // published | draft
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_quotes');
    }
};
