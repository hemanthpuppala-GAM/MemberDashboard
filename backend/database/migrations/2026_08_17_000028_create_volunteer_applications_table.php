<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('volunteer_applications', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone', 50);
            $table->foreignId('category_id')->nullable()->constrained('volunteer_categories')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->string('status')->default('new'); // new | reviewing | contacted | approved | archived
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('volunteer_applications');
    }
};
