<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // A gathering's photos (Media library URLs), its full album (e.g. a Google Drive folder) and one button
        // ("Fill the survey") shown with it on the Events page.
        Schema::table('events', function (Blueprint $table) {
            if (! Schema::hasColumn('events', 'photos')) {
                $table->json('photos')->nullable();
                $table->string('photos_url', 500)->nullable();
                $table->string('cta_label', 60)->nullable();
                $table->string('cta_url', 500)->nullable();
            }
        });

        // "Members only" forms (a survey): Google sign-in first, each answer tied to the member.
        Schema::table('registration_forms', function (Blueprint $table) {
            if (! Schema::hasColumn('registration_forms', 'members_only')) {
                $table->boolean('members_only')->default(false);
            }
        });
        Schema::table('registration_form_submissions', function (Blueprint $table) {
            if (! Schema::hasColumn('registration_form_submissions', 'member_id')) {
                $table->foreignId('member_id')->nullable()->constrained()->nullOnDelete();
                $table->index(['form_id', 'member_id']);
            }
        });
    }

    public function down(): void
    {
        Schema::table('registration_form_submissions', function (Blueprint $table) {
            $table->dropIndex(['form_id', 'member_id']);
            $table->dropConstrainedForeignId('member_id');
        });
        Schema::table('registration_forms', fn (Blueprint $table) => $table->dropColumn('members_only'));
        Schema::table('events', fn (Blueprint $table) => $table->dropColumn(['photos', 'photos_url', 'cta_label', 'cta_url']));
    }
};
