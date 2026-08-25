<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contact_submissions', function (Blueprint $table) {
            $table->foreignId('member_id')->nullable()->after('id')->constrained('members')->nullOnDelete();
            $table->string('source')->default('website')->after('category');
        });
    }

    public function down(): void
    {
        Schema::table('contact_submissions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('member_id');
            $table->dropColumn('source');
        });
    }
};
