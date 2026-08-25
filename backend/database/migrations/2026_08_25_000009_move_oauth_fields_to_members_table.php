<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Passwordless OAuth sign-in belongs to the member portal, not the admin `users`
 * table: every /member endpoint is gated by the `member` middleware, so an OAuth
 * identity has to resolve to a Member to be able to reach the dashboard.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->string('oauth_provider')->nullable()->after('email');
            $table->string('oauth_provider_id')->nullable()->after('oauth_provider');
            $table->string('avatar_url')->nullable()->after('referred_by_code');
            $table->unique(['oauth_provider', 'oauth_provider_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['oauth_provider', 'oauth_provider_id']);
            $table->dropColumn(['oauth_provider', 'oauth_provider_id', 'avatar_url']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('oauth_provider')->nullable()->after('email');
            $table->string('oauth_provider_id')->nullable()->after('oauth_provider');
            $table->string('avatar_url')->nullable()->after('avatar_path');
            $table->unique(['oauth_provider', 'oauth_provider_id']);
        });

        Schema::table('members', function (Blueprint $table) {
            $table->dropUnique(['oauth_provider', 'oauth_provider_id']);
            $table->dropColumn(['oauth_provider', 'oauth_provider_id', 'avatar_url']);
        });
    }
};
