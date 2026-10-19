<?php

namespace App\Http\Controllers\Api\Admin\Site;

use App\Http\Controllers\Controller;
use App\Models\Settings\Setting;
use App\Services\Site\GoLive;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/** Admin → Go live. Any admin-panel user may use it (the team's choice); desk agents can't reach /admin. */
class GoLiveController extends Controller
{
    public function show()
    {
        return response()->json(GoLive::state() + [
            'checks' => GoLive::checks(),
            'live_url' => GoLive::liveUrl(),
            'timezone' => Setting::siteTimezone(),
        ]);
    }

    /** `at` is a local date-time in the site's time zone (India), e.g. 2026-11-01T06:00. */
    public function schedule(Request $request)
    {
        $data = $request->validate(['at' => ['required', 'date']]);

        return $this->attempt(fn () => GoLive::schedule(Carbon::parse($data['at'], Setting::siteTimezone()), $this->who($request)));
    }

    public function cancel(Request $request)
    {
        GoLive::cancel($this->who($request));

        return $this->show();
    }

    public function now(Request $request)
    {
        @set_time_limit(300); // the final Supabase sync can take a while

        return $this->attempt(fn () => GoLive::goLive($this->who($request)));
    }

    public function rollback(Request $request)
    {
        return $this->attempt(fn () => GoLive::rollback($this->who($request)));
    }

    private function attempt(callable $action)
    {
        try {
            $action();
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return $this->show();
    }

    private function who(Request $request): string
    {
        return $request->user()->name ?: $request->user()->email;
    }
}
