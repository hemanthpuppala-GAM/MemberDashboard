<?php

namespace App\Http\Controllers\Api\Public\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\Auth\LoginRequest;
use App\Http\Requests\Public\Auth\RegisterRequest;
use App\Models\People\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class MemberAuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $data = $request->validated();

        $member = Member::where('email', $data['email'])->first();

        if ($member && $member->password) {
            throw ValidationException::withMessages([
                'email' => ['An account with this email already exists. Please sign in instead.'],
            ]);
        }

        if ($member) {
            // Claim an existing CRM lead (created by staff via the contact form) as a self-service account.
            $member->forceFill(['name' => $data['name'], 'password' => $data['password']])->save();
        } else {
            $member = Member::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'category' => 'general',
                'status' => 'active',
                'join_date' => now(),
                'referred_by_code' => $data['ref'] ?? null,
            ]);
        }

        $token = $member->createToken('member-portal')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->present($member),
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $data = $request->validated();
        $member = Member::where('email', $data['email'])->first();

        if (! $member || ! $member->password || ! Hash::check($data['password'], $member->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        $token = $member->createToken('member-portal')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->present($member),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $this->present($request->user()),
        ]);
    }

    private function present(Member $member): array
    {
        return $member->only('id', 'name', 'email', 'phone');
    }
}
