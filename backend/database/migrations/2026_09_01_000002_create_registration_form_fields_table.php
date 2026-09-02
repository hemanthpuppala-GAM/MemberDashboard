<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registration_form_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_id')->constrained('registration_forms')->cascadeOnDelete();
            $table->string('label');
            $table->string('field_key');
            $table->string('type')->default('text'); // text | textarea | email | phone | number | date | select | radio | checkbox
            $table->boolean('is_required')->default(false);
            $table->json('options')->nullable(); // choices for select/radio, e.g. ["Morning batch", "Evening batch"]
            $table->string('placeholder')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['form_id', 'field_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registration_form_fields');
    }
};
