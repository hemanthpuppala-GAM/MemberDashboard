<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->string('filename');
            $table->string('original_name');
            $table->string('disk', 50)->default('public');
            $table->string('path', 500);
            $table->string('url', 500);
            $table->string('mime_type', 100);
            $table->unsignedInteger('size_bytes');
            $table->string('alt_text')->nullable();
            $table->string('folder', 100)->default('General');
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
