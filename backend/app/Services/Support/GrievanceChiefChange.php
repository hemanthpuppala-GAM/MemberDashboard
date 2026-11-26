<?php

namespace App\Services\Support;

use App\Models\Auth\User;
use App\Models\Reports\ActivityLog;
use App\Models\Support\SupportAgent;
use App\Services\Mail\SmtpSettings;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Who can read grievances changed. Because the chief reads everything, every change is written to the activity
 * log and emailed to the new and the old chief, so nobody can quietly make themselves chief.
 */
class GrievanceChiefChange
{
    /** The chief's phone / PIN / email was changed (super admin only): log it and tell the chief at once. */
    public static function signInChanged(SupportAgent $agent): void
    {
        $by = auth('sanctum')->user();
        try {
            ActivityLog::create([
                'user_id' => $by instanceof \App\Models\Auth\User ? $by->id : null,
                'action' => 'changed grievance chief sign-in',
                'target_type' => 'SupportAgent',
                'target_id' => $agent->id,
                'meta' => ['label' => $agent->name],
                'ip_address' => request()?->ip(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Grievance chief sign-in change not logged: '.$e->getMessage());
        }
        self::tell($agent, ($by?->name ?? 'An admin').' changed your support desk sign-in details (phone, PIN or email). If you did not ask for this, tell the core team at once.');
    }

    private static function tell(SupportAgent $a, string $line): void
    {
        if (! $a->alertEmail()) {
            return;
        }
        try {
            SmtpSettings::apply();
            Mail::html(
                view('emails.ask-received', ['greeting' => "Namaste {$a->name},", 'bodyLine' => $line, 'signoff' => 'Golden Age Wisdom grievance cell'])->render(),
                fn ($m) => $m->to($a->alertEmail())->subject('Grievance chief: security notice — Golden Age Wisdom'),
            );
        } catch (\Throwable $e) {
            Log::warning('Grievance chief notice email failed: '.$e->getMessage());
        }
    }

    public static function record(SupportAgent $agent, bool $isChief, Collection $previous): void
    {
        $by = auth('sanctum')->user();
        try {
            ActivityLog::create([
                'user_id' => $by instanceof User ? $by->id : null,
                'action' => $isChief ? 'named grievance chief' : 'removed grievance chief',
                'target_type' => 'SupportAgent',
                'target_id' => $agent->id,
                'meta' => ['label' => $agent->name, 'previous' => $previous->pluck('name')->all()],
                'ip_address' => request()?->ip(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Grievance chief change not logged: '.$e->getMessage());
        }

        $who = $by?->name ?? 'An admin';
        $notes = [[$agent, $isChief
            ? "{$who} made you the grievance chief. You are now the only person who can read grievances on the support desk."
            : "{$who} removed you as grievance chief. You can no longer read grievances."]];
        foreach ($previous as $old) {
            $notes[] = [$old, "{$who} made {$agent->name} the grievance chief. You can no longer read grievances."];
        }
        foreach ($notes as [$a, $line]) {
            if (! $a->alertEmail()) {
                continue;
            }
            try {
                SmtpSettings::apply();
                Mail::html(
                    view('emails.ask-received', ['greeting' => "Namaste {$a->name},", 'bodyLine' => $line, 'signoff' => 'Golden Age Wisdom grievance cell'])->render(),
                    fn ($m) => $m->to($a->alertEmail())->subject('Grievance chief changed — Golden Age Wisdom'),
                );
            } catch (\Throwable $e) {
                Log::warning('Grievance chief change email failed: '.$e->getMessage());
            }
        }
    }
}
