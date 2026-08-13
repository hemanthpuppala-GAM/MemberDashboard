<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ContactSubmissionUpdateRequest;
use App\Models\ContactSubmission;
use Illuminate\Http\Request;

class ContactSubmissionController extends Controller
{
    public function index(Request $request)
    {
        $query = ContactSubmission::query()->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return response()->json($query->paginate(20));
    }

    public function update(ContactSubmissionUpdateRequest $request, ContactSubmission $contactSubmission)
    {
        $contactSubmission->update($request->validated());

        return response()->json($contactSubmission);
    }
}
