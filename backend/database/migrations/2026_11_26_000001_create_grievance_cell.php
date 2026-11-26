<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Grievance cell: a grievance is a desk ticket marked `confidential`. Who sent it and what they wrote live
 * encrypted in `grievances`; replies on it are encrypted too (`ticket_comments.sealed`). Only the agent marked
 * `is_grievance_chief` can read them; the rest of the support team sees a masked ticket.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            if (! Schema::hasColumn('tickets', 'confidential')) {
                $table->boolean('confidential')->default(false)->index();
                $table->timestamp('nudged_at')->nullable();
            }
        });
        Schema::table('support_agents', function (Blueprint $table) {
            if (! Schema::hasColumn('support_agents', 'is_grievance_chief')) {
                $table->boolean('is_grievance_chief')->default(false);
            }
        });
        Schema::table('ticket_comments', function (Blueprint $table) {
            if (! Schema::hasColumn('ticket_comments', 'sealed')) {
                $table->boolean('sealed')->default(false);
            }
        });
        if (! Schema::hasTable('grievances')) {
            Schema::create('grievances', function (Blueprint $table) {
                $table->id();
                $table->foreignId('ticket_id')->unique()->constrained('tickets')->cascadeOnDelete();
                // All encrypted with the app key (Laravel `encrypted` casts).
                $table->text('name')->nullable();
                $table->text('email')->nullable();
                $table->text('phone')->nullable();
                $table->text('member_ref')->nullable(); // "GAW-100023 · #12" when sent signed in
                $table->text('about');
                $table->text('subject');
                $table->longText('body');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('grievances');
        Schema::table('ticket_comments', fn (Blueprint $t) => $t->dropColumn('sealed'));
        Schema::table('support_agents', fn (Blueprint $t) => $t->dropColumn('is_grievance_chief'));
        Schema::table('tickets', function (Blueprint $t) {
            $t->dropIndex(['confidential']);
            $t->dropColumn(['confidential', 'nudged_at']);
        });
    }
};
