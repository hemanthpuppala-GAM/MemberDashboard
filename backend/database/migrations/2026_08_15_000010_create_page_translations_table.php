<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('page_id')->constrained()->cascadeOnDelete();
            $table->foreignId('language_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('meta_description', 500)->nullable();
            $table->timestamps();
            $table->unique(['page_id', 'language_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_translations');
    }
};
