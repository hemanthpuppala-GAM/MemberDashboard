<?php

namespace App\Http\Controllers\Api\Support;

use App\Http\Controllers\Controller;
use App\Models\Support\SupportAgent;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SupportAuthController extends Controller
{
    /** Core support: support phone number + PIN. */
    public function login(Request $request)
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'max:30'],
            'pin' => ['required', 'string', 'min:4', 'max:12'],
        ]);

        $agent = SupportAgent::where('phone', SupportAgent::normalizePhone($data['phone']))
            ->where('kind', 'core')
            ->where('is_active', true)
            ->first();

        if (! $agent || ! $agent->checkPin($data['pin'])) {
            throw ValidationException::withMessages(['pin' => 'That phone number and PIN do not match.']);
        }

        $agent->forceFill(['last_login_at' => now()])->save();

        return response()->json([
            'token' => $agent->createToken('support-desk')->plainTextToken,
            'agent' => $agent->toPublic(),
        ]);
    }

    /** Who am I on the desk (works for core tokens and volunteer member tokens). */
    public function me(Request $request)
    {
        $agent = $request->attributes->get('support_agent');
        if ($request->user() instanceof \App\Models\People\Member) {
            $agent->forceFill(['last_login_at' => now()])->save();
        }

        return response()->json(['agent' => $agent->toPublic()]);
    }

    public function logout(Request $request)
    {
        if ($request->user() instanceof SupportAgent) {
            $request->user()->currentAccessToken()?->delete();
        }

        return response()->json(['ok' => true]);
    }
}
