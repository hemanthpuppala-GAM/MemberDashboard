<?php

namespace App\Http\Controllers\Api\Public\Member;

use App\Http\Controllers\Controller;
use App\Models\Kids\Kid;
use App\Models\Kids\KidConsent;
use App\Models\Kids\KidRegistration;
use App\Services\Kids\KidsProgram;
use App\Services\Kids\KidsRegistrar;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** The signed-in parent's own household: register, update and re-sign, photo choice, withdraw, signed copies. */
class KidsController extends Controller
{
    public function show(Request $request)
    {
        $registration = $this->registration($request);

        return response()->json($this->payload($registration));
    }

    public function store(Request $request)
    {
        $data = $request->validate(KidsRegistrar::rules());
        $registration = KidsRegistrar::save($request->user(), $data, $request);

        return response()->json($this->payload($registration), 201);
    }

    public function media(Request $request, Kid $kid)
    {
        $this->own($request, $kid);
        $data = $request->validate(['media_consent' => ['required', Rule::in(['yes', 'no'])]]);
        $kid->update($data);

        return response()->json($this->payload($kid->registration));
    }

    public function withdrawKid(Request $request, Kid $kid)
    {
        $this->own($request, $kid);
        $kid->update(['status' => 'withdrawn', 'withdrawn_at' => now()]);
        $registration = $kid->registration;
        if (! $registration->kids()->where('status', 'active')->exists()) {
            $registration->update(['status' => 'withdrawn', 'withdrawn_at' => now()]);
        }

        return response()->json($this->payload($registration->fresh()));
    }

    public function consent(Request $request, KidConsent $consent)
    {
        abort_unless($consent->registration?->member_id === $request->user()->id, 404);

        return response()->json($consent->only(['id', 'version', 'text_hash', 'snapshot', 'agreed', 'children', 'signature_name', 'signed_at']));
    }

    private function registration(Request $request): ?KidRegistration
    {
        return KidRegistration::where('member_id', $request->user()->id)->first();
    }

    private function own(Request $request, Kid $kid): void
    {
        abort_unless($kid->registration?->member_id === $request->user()->id, 404);
    }

    private function payload(?KidRegistration $r): array
    {
        if (! $r) {
            return ['registration' => null];
        }
        $r->load(['kids' => fn ($q) => $q->orderBy('id'), 'latestConsent', 'consents:id,kid_registration_id,version,signature_name,signed_at']);
        $active = $r->status === 'active' && $r->kids->contains('status', 'active');

        return [
            'registration' => $r->only(['id', 'guardian_name', 'relationship', 'email', 'phone', 'emergency_name', 'emergency_phone', 'city', 'state', 'heard_about', 'status', 'created_at']),
            // Notes come back to their own parent so the form can be edited.
            'kids' => $r->kids->map(fn (Kid $k) => $k->only(['id', 'first_name', 'last_name', 'age', 'group', 'experience', 'media_consent', 'status']) + ['notes' => $k->notes])->values(),
            'latest_consent' => $r->latestConsent?->only(['id', 'version', 'signature_name', 'signed_at']),
            'consents' => $r->consents->map->only(['id', 'version', 'signature_name', 'signed_at'])->values(),
            'needs_resign' => $r->needsResign(),
            'join' => $active && ! $r->needsResign() ? KidsProgram::joinDetails() : null,
        ];
    }
}
