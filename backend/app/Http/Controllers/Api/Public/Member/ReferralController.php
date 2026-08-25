<?php

namespace App\Http\Controllers\Api\Public\Member;

use App\Http\Controllers\Controller;
use App\Models\People\Member;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    public function index(Request $request)
    {
        /** @var Member $member */
        $member = $request->user();

        $referredCount = Member::where('referred_by_code', $member->referral_code)->count();

        return response()->json([
            'referral_code' => $member->referral_code,
            'referred_count' => $referredCount,
        ]);
    }
}
