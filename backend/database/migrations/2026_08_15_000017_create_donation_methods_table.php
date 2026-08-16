<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donation_methods', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->string('account_holder')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('account_number', 100)->nullable();
            $table->string('ifsc', 20)->nullable();
            $table->string('branch')->nullable();
            $table->string('swift', 20)->nullable();
            $table->string('upi_id', 100)->nullable();
            $table->string('payout_link', 500)->nullable();
            $table->string('qr_image_path')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donation_methods');
    }
};
