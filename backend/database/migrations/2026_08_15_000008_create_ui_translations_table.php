<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ui_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('language_id')->constrained()->cascadeOnDelete();
            $table->string('key', 191);
            $table->text('value');
            $table->timestamps();
            $table->unique(['language_id', 'key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ui_translations');
    }
};
