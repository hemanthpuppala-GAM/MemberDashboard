<?php

namespace App\Http\Controllers\Api\Support;

use App\Http\Controllers\Controller;
use App\Models\People\MembershipDrive;
use App\Models\Support\SupportAgent;
use App\Services\People\DriveSignup;
use Illuminate\Http\Request;

/**
 * Support desk → Event registration: the team registers people at a satsang or camp by name and
 * phone. Same engine as Admin → Membership drives: one member per phone/email, each with a GAW ID.
 */
class EventRegistrationController extends Controller
{
    /** Recent events (drives) to add to. */
    public function index()
    {
        return response()->json(
            MembershipDrive::withCount('members')->latest('held_on')->latest()->limit(30)
                ->get(['id', 'name', 'place', 'held_on', 'created_at'])
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'place' => ['nullable', 'string', 'max:160'],
            'held_on' => ['nullable', 'date'],
        ]);
        $agent = $this->agent($request);
        $drive = MembershipDrive::create($data + [
            'held_on' => $data['held_on'] ?? now()->toDateString(),
            'notes' => 'Created on the support desk by '.$agent->name.'.',
        ]);

        return response()->json($drive->loadCount('members'), 201);
    }

    /**
     * Register people: `people` = [{name, phone, email?}] typed row by row, and/or `lines` pasted
     * ("phone, name" per line). `preview: true` checks without saving.
     */
    public function register(Request $request, MembershipDrive $drive)
    {
        [$text, $preview] = $this->input($request);

        return response()->json(DriveSignup::run($drive, $text, $preview));
    }

    /** Check a list before the event exists (nothing is saved). */
    public function check(Request $request)
    {
        [$text] = $this->input($request);

        return response()->json(DriveSignup::run(new MembershipDrive, $text, true));
    }

    /** @return array{0: string, 1: bool} */
    private function input(Request $request): array
    {
        $data = $request->validate([
            'people' => ['sometimes', 'array', 'max:'.DriveSignup::MAX_LINES],
            'people.*.name' => ['nullable', 'string', 'max:120'],
            'people.*.phone' => ['nullable', 'string', 'max:40'],
            'people.*.email' => ['nullable', 'string', 'max:190'],
            'lines' => ['sometimes', 'nullable', 'string', 'max:200000'],
            'preview' => ['sometimes', 'boolean'],
        ]);

        // A typed row becomes one "name, phone, email" line (commas in a name would split it).
        $rows = collect($data['people'] ?? [])
            ->map(fn ($p) => implode(', ', array_filter([
                trim(preg_replace('/[\s,;|]+/u', ' ', (string) ($p['name'] ?? ''))),
                trim((string) ($p['phone'] ?? '')),
                trim((string) ($p['email'] ?? '')),
            ])))
            ->filter()
            ->implode("\n");
        $text = trim($rows."\n".($data['lines'] ?? ''));
        abort_if($text === '', 422, 'Add at least one person (a phone number or email).');

        return [$text, (bool) ($data['preview'] ?? false)];
    }

    private function agent(Request $request): SupportAgent
    {
        return $request->attributes->get('support_agent');
    }
}
