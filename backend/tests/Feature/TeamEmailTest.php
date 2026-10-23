<?php

namespace Tests\Feature;

use App\Models\Settings\Setting;
use App\Services\Mail\SmtpSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class TeamEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_site_mail_is_sent_as_the_smtp_mailbox_with_replies_to_support(): void
    {
        foreach (['email.smtp_host' => 'smtp.office365.com', 'email.smtp_port' => '587', 'email.smtp_user' => 'support@goldenagewisdom.org', 'general.admin_email' => 'someone@gmail.com'] as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        SmtpSettings::apply();

        $this->assertSame('support@goldenagewisdom.org', config('mail.from.address'));
        $this->assertSame('support@goldenagewisdom.org', config('mail.reply_to.address'));
        $this->assertSame('someone@gmail.com', Setting::adminEmail()); // alerts still go to the chosen inbox
    }

    public function test_alerts_default_to_info_and_the_old_placeholder_is_replaced(): void
    {
        $this->assertSame('info@goldenagewisdom.org', Setting::adminEmail());

        DB::table('settings')->insert(['key' => 'general.admin_email', 'value' => 'admin@goldenagewisdom.org', 'created_at' => now(), 'updated_at' => now()]);
        DB::table('contact_channels')->insert(['type' => 'email', 'label' => 'General inquiries', 'value' => 'admin@goldenagewisdom.org', 'created_at' => now(), 'updated_at' => now()]);
        (require database_path('migrations/2026_10_23_000001_use_real_team_email_addresses.php'))->up();

        $this->assertSame('info@goldenagewisdom.org', Setting::adminEmail());
        $this->assertSame('contact@goldenagewisdom.org', DB::table('contact_channels')->where('type', 'email')->value('value'));
    }
}
