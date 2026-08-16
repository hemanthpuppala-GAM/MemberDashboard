<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('category');
            $table->text('summary')->nullable();
            $table->foreignId('assigned_practitioner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('source_submission_id')->nullable()->constrained('contact_submissions')->nullOnDelete();
            $table->string('status')->default('new');
            $table->date('join_date');
            $table->date('last_contact_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
