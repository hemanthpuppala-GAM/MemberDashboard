<?php

namespace App\Services\Kids;

use App\Mail\Admin\NewKidsRegistrationMail;
use App\Mail\KidsRegistrationMail;
use App\Models\Kids\Kid;
use App\Models\Kids\KidConsent;
use App\Models\Kids\KidRegistration;
use App\Models\People\Member;
use App\Models\Settings\Setting;
use App\Services\Mail\SmtpSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/** Saves a parent's registration: household, children and a new signed consent (never overwrites old ones). */
class KidsRegistrar
{
    public static function rules(): array
    {
        $groups = array_keys(config('kids.groups'));

        return [
            'guardian_name' => ['required', 'string', 'min:3', 'max:120'],
            'relationship' => ['required', Rule::in(KidRegistration::RELATIONSHIPS)],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['required', 'string', 'regex:/^[0-9+()\-.\s]{7,30}$/'],
            'emergency_name' => ['required', 'string', 'min:2', 'max:120'],
            'emergency_phone' => ['required', 'string', 'regex:/^[0-9+()\-.\s]{7,30}$/'],
            'city' => ['required', 'string', 'max:80'],
            'state' => ['required', Rule::in(KidsProgram::STATES)],
            'heard_about' => ['nullable', Rule::in(KidRegistration::HEARD_ABOUT)],
            'children' => ['required', 'array', 'min:1', 'max:'.config('kids.max_children')],
            'children.*.id' => ['nullable', 'integer'],
            'children.*.first_name' => ['required', 'string', 'max:60'],
            'children.*.last_name' => ['required', 'string', 'max:60'],
            'children.*.age' => ['required', 'integer', 'min:'.config('kids.min_age'), 'max:'.config('kids.max_age')],
            'children.*.group' => ['required', Rule::in($groups)],
            'children.*.experience' => ['required', Rule::in(Kid::EXPERIENCE)],
            'children.*.media_consent' => ['required', Rule::in(['yes', 'no'])],
            'children.*.notes' => ['nullable', 'string', 'max:1000'],
            'agreed' => ['required', 'array'],
            'agreed.*' => ['string', Rule::in(KidsConsent::keys())],
            'esign' => ['accepted'],
            'signature_name' => ['required', 'string', 'max:120'],
            'consent_version' => ['required', 'integer'],
        ];
    }

    public static function save(Member $member, array $data, Request $request): KidRegistration
    {
        $missing = array_diff(KidsConsent::keys(), $data['agreed'] ?? []);
        if ($missing) {
            throw ValidationException::withMessages(['agreed' => 'Please read and tick every section.']);
        }
        if ((int) $data['consent_version'] !== KidsConsent::VERSION) {
            throw ValidationException::withMessages(['consent_version' => 'The consent text was updated. Please reload the page and read it again.']);
        }
        if (self::norm($data['signature_name']) !== self::norm($data['guardian_name'])) {
            throw ValidationException::withMessages(['signature_name' => 'Type your full name exactly as entered above to sign.']);
        }

        $registration = DB::transaction(function () use ($member, $data, $request) {
            $registration = KidRegistration::firstOrNew(['member_id' => $member->id]);
            $registration->fill([
                'guardian_name' => trim($data['guardian_name']),
                'relationship' => $data['relationship'],
                'email' => trim($data['email']),
                'phone' => trim($data['phone']),
                'emergency_name' => trim($data['emergency_name']),
                'emergency_phone' => trim($data['emergency_phone']),
                'city' => trim($data['city']),
                'state' => $data['state'],
                'heard_about' => $data['heard_about'] ?? null,
                'status' => 'active',
                'withdrawn_at' => null,
            ])->save();

            // Children: update the ones sent back by id, add new ones, mark the rest as withdrawn.
            $kept = [];
            foreach ($data['children'] as $c) {
                $kid = ! empty($c['id']) ? $registration->kids()->whereKey($c['id'])->first() : null;
                $kid ??= new Kid(['kid_registration_id' => $registration->id]);
                $kid->fill([
                    'first_name' => trim($c['first_name']),
                    'last_name' => trim($c['last_name']),
                    'age' => (int) $c['age'],
                    'group' => $c['group'],
                    'experience' => $c['experience'],
                    'media_consent' => $c['media_consent'],
                    'notes' => filled($c['notes'] ?? null) ? trim($c['notes']) : null,
                    'status' => 'active',
                    'withdrawn_at' => null,
                ])->save();
                $kept[] = $kid->id;
            }
            $registration->kids()->whereNotIn('id', $kept)->where('status', 'active')
                ->update(['status' => 'withdrawn', 'withdrawn_at' => now()]);

            $doc = KidsConsent::document();
            $consent = KidConsent::create([
                'kid_registration_id' => $registration->id,
                'document' => 'kids_online',
                'version' => KidsConsent::VERSION,
                'text_hash' => KidsConsent::hash($doc),
                'snapshot' => $doc,
                'agreed' => array_values($data['agreed']),
                'children' => $registration->kids()->whereIn('id', $kept)->get()
                    ->map(fn (Kid $k) => ['name' => "{$k->first_name} {$k->last_name}", 'age' => $k->age, 'group' => $k->group, 'photos' => $k->media_consent])->all(),
                'signature_name' => trim($data['signature_name']),
                'signed_at' => now(),
                'ip' => $request->ip(),
                'user_agent' => mb_substr((string) $request->userAgent(), 0, 300),
            ]);
            $registration->update(['latest_consent_id' => $consent->id]);

            if (! filled($member->phone)) {
                $member->update(['phone' => trim($data['phone'])]);
            }

            return $registration;
        });

        $registration->load(['kids', 'latestConsent']);
        self::sendMails($registration);

        return $registration;
    }

    private static function norm(string $s): string
    {
        return mb_strtolower(preg_replace('/\s+/', ' ', trim($s)));
    }

    private static function sendMails(KidRegistration $registration): void
    {
        try {
            SmtpSettings::apply();
            Mail::to($registration->email)->send(new KidsRegistrationMail($registration));
        } catch (\Throwable $e) {
            Log::warning('Kids registration email failed: '.$e->getMessage(), ['registration_id' => $registration->id]);
        }

        if (! Setting::notifyOnSubmission()) {
            return;
        }
        try {
            Mail::to(Setting::adminEmail())->send(new NewKidsRegistrationMail($registration));
        } catch (\Throwable $e) {
            Log::error('Kids registration admin notification failed: '.$e->getMessage());
        }
    }
}
