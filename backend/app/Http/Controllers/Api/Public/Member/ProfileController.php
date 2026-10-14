<?php

namespace App\Http\Controllers\Api\Public\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\Member\PasswordUpdateRequest;
use App\Http\Requests\Public\Member\ProfileUpdateRequest;
use App\Models\People\Member;
use App\Services\People\MemberLinker;
use App\Services\People\MemberNumbers;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    public function update(ProfileUpdateRequest $request)
    {
        /** @var Member $member */
        $member = $request->user();
        $member->fill($request->validated())->save();

        // Added at a membership drive by phone, now signed in with Google: one member, the
        // drive's (older) member number.
        if (MemberNumbers::ready() && $member->wasChanged('phone_key')) {
            $member = MemberLinker::absorbPhoneTwin($member) ?? $member;
        }

        return response()->json(['user' => $member->only('id', 'name', 'email', 'phone') + ['member_id' => $member->member_code]]);
    }

    public function updatePassword(PasswordUpdateRequest $request)
    {
        /** @var Member $member */
        $member = $request->user();

        if (! Hash::check($request->validated('current_password'), $member->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        $member->forceFill(['password' => $request->validated('password')])->save();

        return response()->json(['message' => 'Password updated.']);
    }
}
