<?php

namespace App\Console\Commands;

use App\Models\Support\Ticket;
use Illuminate\Console\Command;

/** Put recent volunteer sign-ups that never got a support-desk ticket onto the desk (see Ticket::backfillVolunteerTickets). */
class VolunteerTickets extends Command
{
    protected $signature = 'support:volunteer-tickets {--days=14 : Sign-ups from this many days back}';

    protected $description = 'Create support-desk tickets for recent volunteer sign-ups that have none';

    public function handle(): int
    {
        $made = Ticket::backfillVolunteerTickets(max(1, (int) $this->option('days')));
        $this->info($made === 1 ? '1 ticket created.' : "{$made} tickets created.");

        return self::SUCCESS;
    }
}
