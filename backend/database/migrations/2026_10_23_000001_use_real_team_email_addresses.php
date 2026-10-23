<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * The placeholder admin@goldenagewisdom.org never existed: alerts sent there were lost, and the website's
 * contact list showed it. Point the alerts at info@ and the public "General inquiries" email at contact@.
 * Addresses an admin chose themselves are kept.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('settings')) {
            DB::table('settings')->where('key', 'general.admin_email')->where('value', 'admin@goldenagewisdom.org')
                ->update(['value' => 'info@goldenagewisdom.org']);
        }
        if (Schema::hasTable('contact_channels')) {
            DB::table('contact_channels')->where('type', 'email')->where('value', 'admin@goldenagewisdom.org')
                ->update(['value' => 'contact@goldenagewisdom.org']);
        }
    }

    public function down(): void
    {
        // Nothing to undo: the old address did not exist.
    }
};
