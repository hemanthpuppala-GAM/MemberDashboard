<?php

namespace App\Http\Controllers\Api\Public\People;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\People\VolunteerApplicationStoreRequest;
use App\Mail\Admin\NewVolunteerApplicationMail;
use App\Models\People\VolunteerApplication;
use App\Models\Settings\Setting;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class VolunteerApplicationController extends Controller
{
    public function store(VolunteerApplicationStoreRequest $request)
    {
        $application = VolunteerApplication::create($request->validated());

        $this->notifyAdmin($application);

        return response()->json($application, 201);
    }

    private function notifyAdmin(VolunteerApplication $application): void
    {
        if (! Setting::notifyOnSubmission()) {
            return;
        }

        try {
            Mail::to(Setting::adminEmail())->send(new NewVolunteerApplicationMail($application));
        } catch (\Throwable $e) {
            Log::error('Failed to send new-volunteer-application notification: '.$e->getMessage());
        }
    }
}
