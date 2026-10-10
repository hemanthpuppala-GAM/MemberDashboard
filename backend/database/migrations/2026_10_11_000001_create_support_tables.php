<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Member support desk.
 *  - support_agents: who answers. "core" = first-line team, logs in with the support phone + PIN;
 *    "volunteer" = a member who logs in with their Google account (matched by email).
 *  - tickets: one per question / call / WhatsApp chat / volunteer sign-up, followed to resolution.
 *  - ticket_comments: the conversation; `internal` notes are never shown to the member.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_agents', function (Blueprint $table) {
            $table->id();
            $table->string('kind', 20)->default('volunteer'); // core | volunteer
            $table->string('name', 120);
            $table->string('phone', 20)->nullable()->unique(); // digits only, with country code
            $table->string('pin_hash')->nullable();
            $table->string('email', 190)->nullable()->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();
        });

        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('source', 30); // ask_web | member_portal | website | call | whatsapp | volunteer | other
            $table->unsignedBigInteger('source_id')->nullable();
            $table->foreignId('member_id')->nullable()->constrained('members')->nullOnDelete();
            $table->string('requester_name', 120)->nullable();
            $table->string('requester_email', 190)->nullable();
            $table->string('requester_phone', 50)->nullable();
            $table->string('subject', 200);
            $table->text('body')->nullable();
            $table->string('category', 40)->default('general');
            $table->string('lang', 10)->nullable();
            $table->string('status', 20)->default('open'); // open | in_progress | waiting | resolved | closed
            $table->string('priority', 10)->default('normal'); // normal | urgent
            $table->foreignId('assigned_agent_id')->nullable()->constrained('support_agents')->nullOnDelete();
            $table->foreignId('created_by_agent_id')->nullable()->constrained('support_agents')->nullOnDelete();
            $table->timestamp('first_response_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->unsignedTinyInteger('rating')->nullable();
            $table->text('rating_comment')->nullable();
            $table->timestamp('rated_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'priority']);
            $table->index('assigned_agent_id');
            $table->index('requester_email');
            $table->index(['source', 'source_id']);
        });

        Schema::create('ticket_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('tickets')->cascadeOnDelete();
            $table->string('author_type', 10); // agent | member | system
            $table->foreignId('agent_id')->nullable()->constrained('support_agents')->nullOnDelete();
            $table->foreignId('member_id')->nullable()->constrained('members')->nullOnDelete();
            $table->text('body');
            $table->boolean('internal')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_comments');
        Schema::dropIfExists('tickets');
        Schema::dropIfExists('support_agents');
    }
};
