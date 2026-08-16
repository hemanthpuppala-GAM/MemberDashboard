<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('broadcasts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('type');
            $table->text('content_text')->nullable();
            $table->string('content_image_path')->nullable();
            $table->string('content_video_url')->nullable();
            $table->string('cta_label')->nullable();
            $table->string('cta_url')->nullable();
            $table->json('target_pages')->nullable();
            $table->string('audience')->default('all');
            $table->unsignedInteger('show_after_seconds')->default(0);
            $table->string('frequency')->default('once_per_session');
            $table->date('active_from')->nullable();
            $table->date('active_until')->nullable();
            $table->string('status')->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('broadcasts');
    }
};
