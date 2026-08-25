<?php

namespace App\Http\Controllers\Api\Public\People;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\People\ContactStoreRequest;
use App\Models\People\ContactSubmission;
use App\Models\People\Member;

class ContactController extends Controller
{
    public function store(ContactStoreRequest $request)
    {
        $data = $request->validated();
        $member = $request->user('sanctum');

        if ($member instanceof Member) {
            $data['member_id'] = $member->id;
            $data['source'] = 'member_portal';
        }

        $submission = ContactSubmission::create($data);

        return response()->json($submission, 201);
    }
}
