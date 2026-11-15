<?php

namespace App\Http\Controllers\Api\Admin\Kids;

use App\Http\Controllers\Controller;
use App\Models\Kids\Kid;
use App\Models\Kids\KidAttendance;
use App\Models\Kids\KidConsent;
use App\Models\Kids\KidRegistration;
use App\Models\Reports\ActivityLog;
use App\Services\Kids\KidsAnalytics;
use App\Services\Kids\KidsConsent;
use App\Services\Kids\KidsProgram;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Validation\Rule;

/** Admin → Kids Circle: analytics, children list + CSV, family detail with signed consents, session roster. */
class KidsAdminController extends Controller
{
    public function analytics()
    {
        return response()->json(KidsAnalytics::summary() + ['groups' => KidsProgram::groups(), 'consent_version' => KidsConsent::VERSION]);
    }

    public function index(Request $request)
    {
        $kids = $this->query($request)->get();

        return response()->json($kids->map(fn (Kid $k) => $this->row($k))->values());
    }

    public function export(Request $request)
    {
        $kids = $this->query($request)->get();
        $this->log('exported', "Kids Circle CSV ({$kids->count()} children)");

        $head = ['Child', 'Age', 'Group', 'Experience', 'Photos', 'Status', 'Parent', 'Relationship', 'Email', 'Phone', 'Emergency contact', 'Emergency phone', 'City', 'State', 'Heard about', 'Consent version', 'Signed at', 'Sessions attended', 'Last attended', 'Registered'];
        $csv = implode(',', $head)."\n";
        foreach ($kids as $k) {
            $r = $k->registration;
            $csv .= implode(',', array_map(fn ($v) => '"'.str_replace('"', '""', (string) $v).'"', [
                "{$k->first_name} {$k->last_name}", $k->age, config("kids.groups.{$k->group}.label", $k->group), $k->experience, $k->media_consent, $k->status,
                $r->guardian_name, $r->relationship, $r->email, $r->phone, $r->emergency_name, $r->emergency_phone, $r->city, $r->state, $r->heard_about,
                $r->latestConsent?->version, $r->latestConsent?->signed_at?->toDateTimeString(), $k->attendances_count, $k->attendances_max_session_date, $k->created_at->toDateString(),
            ]))."\n";
        }

        return Response::make($csv, 200, ['Content-Type' => 'text/csv', 'Content-Disposition' => 'attachment; filename="kids-circle.csv"']);
    }

    public function show(KidRegistration $registration)
    {
        $registration->load(['kids' => fn ($q) => $q->withCount('attendances'), 'consents', 'member:id,name,email,member_num']);
        $this->log('viewed', "Kids Circle family #{$registration->id} ({$registration->guardian_name})");

        return response()->json([
            'registration' => $registration->only(['id', 'guardian_name', 'relationship', 'email', 'phone', 'emergency_name', 'emergency_phone', 'city', 'state', 'heard_about', 'status', 'created_at', 'withdrawn_at']),
            'member' => $registration->member?->only(['id', 'name', 'email', 'member_code']),
            'kids' => $registration->kids->map(fn (Kid $k) => $k->only(['id', 'first_name', 'last_name', 'age', 'group', 'experience', 'media_consent', 'status', 'attendances_count', 'created_at']) + ['notes' => $k->notes])->values(),
            'consents' => $registration->consents->map->only(['id', 'version', 'text_hash', 'signature_name', 'signed_at', 'ip', 'user_agent', 'children'])->values(),
            'needs_resign' => $registration->needsResign(),
        ]);
    }

    public function consent(KidConsent $consent)
    {
        return response()->json($consent->only(['id', 'version', 'text_hash', 'snapshot', 'agreed', 'children', 'signature_name', 'signed_at', 'ip', 'user_agent']));
    }

    /** Teachers' list for one group on one date: first name + last initial, age, photo flag, notes, present. */
    public function roster(Request $request)
    {
        $data = $request->validate([
            'group' => ['required', Rule::in(array_keys(config('kids.groups')))],
            'date' => ['nullable', 'date'],
        ]);
        $date = isset($data['date']) ? CarbonImmutable::parse($data['date'])->toDateString() : CarbonImmutable::now(config('kids.timezone'))->toDateString();
        $kids = Kid::with('registration:id,guardian_name,phone,status')->where('group', $data['group'])->where('status', 'active')
            ->withCount('attendances')->orderBy('first_name')->get();
        $present = KidAttendance::whereDate('session_date', $date)->whereIn('kid_id', $kids->pluck('id'))->pluck('kid_id')->flip();

        return response()->json([
            'date' => $date,
            'group' => $data['group'],
            'kids' => $kids->map(fn (Kid $k) => [
                'id' => $k->id,
                'name' => $k->shortName(),
                'age' => $k->age,
                'photos' => $k->media_consent,
                'notes' => $k->notes,
                'parent' => $k->registration?->guardian_name,
                'parent_phone' => $k->registration?->phone,
                'sessions' => $k->attendances_count,
                'present' => isset($present[$k->id]),
            ])->values(),
        ]);
    }

    public function attendance(Request $request)
    {
        $data = $request->validate([
            'kid_id' => ['required', 'integer', 'exists:kids,id'],
            'date' => ['required', 'date'],
            'present' => ['required', 'boolean'],
        ]);
        $date = CarbonImmutable::parse($data['date'])->toDateString();
        if ($data['present']) {
            if (! KidAttendance::where('kid_id', $data['kid_id'])->whereDate('session_date', $date)->exists()) {
                KidAttendance::create(['kid_id' => $data['kid_id'], 'session_date' => $date, 'marked_by' => $request->user()?->id]);
            }
        } else {
            KidAttendance::where('kid_id', $data['kid_id'])->whereDate('session_date', $date)->delete();
        }

        return response()->json(['ok' => true]);
    }

    private function query(Request $request)
    {
        $q = Kid::query()->with(['registration.latestConsent:id,version,signed_at'])
            ->withCount('attendances')->withMax('attendances', 'session_date');
        if ($request->filled('group')) {
            $q->where('group', $request->input('group'));
        }
        if ($request->filled('status')) {
            $q->where('status', $request->input('status'));
        }
        if ($request->filled('q')) {
            $term = '%'.$request->input('q').'%';
            $q->where(fn ($w) => $w->where('first_name', 'like', $term)->orWhere('last_name', 'like', $term)
                ->orWhereHas('registration', fn ($r) => $r->where('guardian_name', 'like', $term)->orWhere('email', 'like', $term)->orWhere('phone', 'like', $term)));
        }

        return $q->orderByDesc('created_at');
    }

    private function row(Kid $k): array
    {
        $r = $k->registration;

        return [
            'id' => $k->id,
            'name' => "{$k->first_name} {$k->last_name}",
            'age' => $k->age,
            'group' => $k->group,
            'experience' => $k->experience,
            'photos' => $k->media_consent,
            'status' => $k->status,
            'has_notes' => filled($k->notes),
            'registration_id' => $r->id,
            'parent' => $r->guardian_name,
            'email' => $r->email,
            'phone' => $r->phone,
            'state' => $r->state,
            'city' => $r->city,
            'consent_version' => $r->latestConsent?->version,
            'needs_resign' => (int) $r->latestConsent?->version < KidsConsent::VERSION,
            'sessions' => $k->attendances_count,
            'last_attended' => $k->attendances_max_session_date,
            'registered' => $k->created_at->toDateString(),
        ];
    }

    /** Children's data: every family view and export goes in the activity log. */
    private function log(string $action, string $label): void
    {
        try {
            ActivityLog::create(['user_id' => auth('sanctum')->id(), 'action' => "{$action} kids circle", 'target_type' => 'KidRegistration', 'target_id' => null, 'meta' => ['label' => $label], 'ip_address' => request()->ip()]);
        } catch (\Throwable) {
            // logging must never block the page
        }
    }
}
