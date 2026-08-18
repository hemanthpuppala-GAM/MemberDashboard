<?php

namespace App\Http\Controllers\Api\Public\People;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\People\VolunteerApplicationStoreRequest;
use App\Models\People\VolunteerApplication;

class VolunteerApplicationController extends Controller
{
    public function store(VolunteerApplicationStoreRequest $request)
    {
        $application = VolunteerApplication::create($request->validated());

        return response()->json($application, 201);
    }
}
