<?php

namespace App\Models\People;

use App\Models\Auth\User;
use App\Models\Concerns\LogsActivity;
use App\Models\Support\SupportAgent;
use App\Models\Support\Ticket;
use App\Services\People\MemberLinker;
use App\Services\People\MemberNumbers;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'phone', 'category', 'summary', 'assigned_practitioner_id', 'source_submission_id', 'status', 'join_date', 'last_contact_date', 'referred_by_code', 'oauth_provider', 'oauth_provider_id', 'avatar_url', 'role_title', 'source', 'drive_id'])]
#[Hidden(['password', 'remember_token'])]
#[Appends(['member_code'])]
class Member extends Authenticatable
{
    use HasApiTokens, LogsActivity, Notifiable, SoftDeletes;

    public const STATUSES = ['new', 'active', 'in_progress', 'resolved', 'archived'];

    public const CATEGORIES = ['meditation', 'kundalini', 'health', 'general'];

    protected static function booted(): void
    {
        static::creating(function (Member $member) {
            if (! $member->referral_code) {
                do {
                    $code = strtoupper(Str::random(8));
                } while (static::where('referral_code', $code)->exists());
                $member->referral_code = $code;
            }
            if (MemberNumbers::ready() && ! $member->member_num) {
                $member->member_num = MemberNumbers::numberFor($member);
            }
        });

        static::saving(function (Member $member) {
            // Before `php artisan migrate` adds these columns (deploys don't migrate), drop them so
            // sign-ups and sign-ins keep working instead of failing on an unknown column.
            if (! MemberNumbers::ready()) {
                foreach (['member_num', 'phone_key', 'role_title', 'source', 'drive_id'] as $column) {
                    unset($member->attributes[$column]);
                }

                return;
            }
            if ($member->isDirty('phone') || ! $member->exists) {
                $member->phone_key = MemberNumbers::phoneKey($member->phone);
            }
        });

        // Questions and volunteer sign-ups that arrived before the member existed (or under
        // their phone number) attach to them as soon as the email or phone is known.
        static::saved(function (Member $member) {
            if (MemberNumbers::ready() && ($member->wasRecentlyCreated || $member->wasChanged(['email', 'phone_key']))) {
                MemberLinker::adoptRecords($member);
            }
        });
    }

    /** "GAW-100023". */
    public function getMemberCodeAttribute(): ?string
    {
        return MemberNumbers::format($this->member_num);
    }

    protected function casts(): array
    {
        return [
            'join_date' => 'date',
            'last_contact_date' => 'date',
            'password' => 'hashed',
            'member_num' => 'integer',
        ];
    }

    public function practitioner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_practitioner_id');
    }

    public function sourceSubmission(): BelongsTo
    {
        return $this->belongsTo(ContactSubmission::class, 'source_submission_id');
    }

    public function journeys(): HasMany
    {
        return $this->hasMany(MemberJourney::class)->latest();
    }

    public function practiceSessions(): HasMany
    {
        return $this->hasMany(PracticeSession::class);
    }

    public function journalEntries(): HasMany
    {
        return $this->hasMany(MemberJournalEntry::class)->latest();
    }

    public function volunteerApplications(): HasMany
    {
        return $this->hasMany(VolunteerApplication::class)->latest();
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class)->latest();
    }

    public function drive(): BelongsTo
    {
        return $this->belongsTo(MembershipDrive::class, 'drive_id');
    }

    /** Shape returned to the member portal by every /auth and /member endpoint. */
    public function toPortalArray(): array
    {
        return [
            'id' => $this->id,
            'member_id' => $this->member_code,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar_url' => $this->avatar_url,
            'oauth_provider' => $this->oauth_provider,
            // On the support team as a volunteer → the member area shows a "Support desk" link.
            'support_desk' => $this->email && SupportAgent::where('kind', 'volunteer')->where('is_active', true)->where('email', strtolower($this->email))->exists(),
        ];
    }
}
