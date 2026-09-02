<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registration_form_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_id')->constrained('registration_forms')->cascadeOnDelete();
            $table->json('data'); // { field_key: value, ... } keyed by registration_form_fields.field_key
            $table->string('status')->default('new'); // new | contacted
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registration_form_submissions');
    }
};
