<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_contents', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('eyebrow');
            $table->string('title');
            $table->text('description');
            $table->json('points')->nullable();
            $table->string('cta_label')->nullable();
            $table->string('cta_href')->nullable();
            $table->string('cta_variant')->nullable();
            $table->boolean('reverse')->default(false);
            $table->string('image_path')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_contents');
    }
};
