<?php

namespace App\Providers;

use App\Mail\Transport\BrevoApiTransport;
use App\Models\People\ContactSubmission;
use App\Models\People\VolunteerApplication;
use App\Models\Support\Ticket;
use App\Services\Support\QueryTicketSync;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Mail::extend('brevo', fn (array $config) => new BrevoApiTransport($config['api_key'] ?? ''));

        // Every question and volunteer sign-up becomes a support ticket. Never let a ticket
        // problem break the public form itself.
        ContactSubmission::created(function (ContactSubmission $s) {
            try {
                Ticket::fromContactSubmission($s);
            } catch (\Throwable $e) {
                Log::warning('Could not create ticket for contact submission '.$s->id.': '.$e->getMessage());
            }
        });
        VolunteerApplication::created(function (VolunteerApplication $a) {
            try {
                Ticket::fromVolunteerApplication($a);
            } catch (\Throwable $e) {
                Log::warning('Could not create ticket for volunteer application '.$a->id.': '.$e->getMessage());
            }
        });

        // Admin Queries <-> support desk: one inbox, kept in step both ways.
        ContactSubmission::updated(function (ContactSubmission $s) {
            try {
                QueryTicketSync::fromSubmission($s);
            } catch (\Throwable $e) {
                Log::warning('Could not sync query '.$s->id.' to its ticket: '.$e->getMessage());
            }
        });
        Ticket::updated(function (Ticket $t) {
            try {
                QueryTicketSync::fromTicket($t);
            } catch (\Throwable $e) {
                Log::warning('Could not sync ticket '.$t->id.' to its query: '.$e->getMessage());
            }
        });
    }
}
