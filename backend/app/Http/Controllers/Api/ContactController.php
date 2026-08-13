<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactStoreRequest;
use App\Models\ContactSubmission;

class ContactController extends Controller
{
    public function store(ContactStoreRequest $request)
    {
        $submission = ContactSubmission::create($request->validated());

        return response()->json($submission, 201);
    }
}
