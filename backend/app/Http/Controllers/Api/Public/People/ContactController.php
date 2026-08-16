<?php

namespace App\Http\Controllers\Api\Public\People;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\People\ContactStoreRequest;
use App\Models\People\ContactSubmission;

class ContactController extends Controller
{
    public function store(ContactStoreRequest $request)
    {
        $submission = ContactSubmission::create($request->validated());

        return response()->json($submission, 201);
    }
}
