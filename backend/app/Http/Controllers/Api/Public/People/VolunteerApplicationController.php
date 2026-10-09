<?php

namespace App\Http\Controllers\Api\Public\People;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\People\VolunteerApplicationStoreRequest;
use App\Mail\Admin\NewVolunteerApplicationMail;
use App\Models\Content\VolunteerCategory;
use App\Models\People\VolunteerApplication;
use App\Models\Settings\Setting;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class VolunteerApplicationController extends Controller
{
    public function store(VolunteerApplicationStoreRequest $request)
    {
        $data = $request->validated();

        // Keep `teams` and the single `category_id` (used by admin filters) in step.
        if (empty($data['teams']) && ! empty($data['category_id'])) {
            $data['teams'] = array_values(array_filter([VolunteerCategory::find($data['category_id'])?->slug]));
        }
        if (empty($data['category_id']) && ! empty($data['teams'])) {
            $data['category_id'] = VolunteerCategory::where('slug', $data['teams'][0])->value('id');
        }
        $data['lang'] = strtoupper($data['lang'] ?? 'EN');
        foreach (['occupation', 'city', 'availability'] as $key) {
            $data[$key] = $data[$key] ?? ''; // NOT NULL columns
        }

        $application = VolunteerApplication::create($data);

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
