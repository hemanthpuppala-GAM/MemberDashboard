<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Kids Meditation Circle (USA): one household per parent member, its children, every consent the parent signed
 * (append-only, with the exact text) and session attendance ticked by teachers.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kid_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->string('guardian_name', 120);
            $table->string('relationship', 40);
            $table->string('email', 190);
            $table->string('phone', 30);
            $table->string('emergency_name', 120);
            $table->string('emergency_phone', 30);
            $table->string('city', 80);
            $table->string('state', 2);
            $table->string('heard_about', 60)->nullable();
            $table->unsignedBigInteger('latest_consent_id')->nullable();
            $table->string('status', 20)->default('active'); // active | withdrawn
            $table->timestamp('withdrawn_at')->nullable();
            $table->timestamps();
            $table->index(['status', 'created_at']);
        });

        Schema::create('kids', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kid_registration_id')->constrained()->cascadeOnDelete();
            $table->string('first_name', 60);
            $table->string('last_name', 60);
            $table->unsignedTinyInteger('age');
            $table->string('group', 20); // config('kids.groups') key
            $table->string('experience', 30);
            $table->string('media_consent', 3)->default('no'); // yes | no
            $table->text('notes')->nullable(); // encrypted: may hold health details
            $table->string('status', 20)->default('active'); // active | withdrawn
            $table->timestamp('withdrawn_at')->nullable();
            $table->timestamps();
            $table->index(['group', 'status']);
        });

        Schema::create('kid_consents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kid_registration_id')->constrained()->cascadeOnDelete();
            $table->string('document', 20)->default('kids_online');
            $table->unsignedSmallInteger('version');
            $table->char('text_hash', 64);
            $table->json('snapshot');   // exact text shown
            $table->json('agreed');     // section keys ticked
            $table->json('children');   // names, ages, groups and photo answers at signing
            $table->string('signature_name', 120);
            $table->timestamp('signed_at');
            $table->string('ip', 45)->nullable();
            $table->string('user_agent', 300)->nullable();
            $table->timestamps();
        });

        Schema::create('kid_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kid_id')->constrained()->cascadeOnDelete();
            $table->date('session_date');
            $table->foreignId('marked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['kid_id', 'session_date']);
            $table->index('session_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kid_attendances');
        Schema::dropIfExists('kid_consents');
        Schema::dropIfExists('kids');
        Schema::dropIfExists('kid_registrations');
    }
};
