<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('section_content', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained('page_sections')->cascadeOnDelete();
            $table->foreignId('language_id')->constrained()->cascadeOnDelete();
            $table->string('field_key', 100);
            $table->text('field_value')->nullable();
            $table->string('field_type')->default('text');
            $table->timestamps();
            $table->unique(['section_id', 'language_id', 'field_key'], 'section_content_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('section_content');
    }
};
