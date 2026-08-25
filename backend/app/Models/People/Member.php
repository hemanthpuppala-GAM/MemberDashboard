<?php

namespace App\Models\People;

use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Auth\User;

#[Fillable(['name', 'email', 'password', 'phone', 'category', 'summary', 'assigned_practitioner_id', 'source_submission_id', 'status', 'join_date', 'last_contact_date', 'referred_by_code', 'oauth_provider', 'oauth_provider_id', 'avatar_url'])]
#[Hidden(['password', 'remember_token'])]
class Member extends Authenticatable
{
    use LogsActivity, SoftDeletes, Notifiable, HasApiTokens;

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
        });
    }

    protected function casts(): array
    {
        return [
            'join_date' => 'date',
            'last_contact_date' => 'date',
            'password' => 'hashed',
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

    /** Shape returned to the member portal by every /auth and /member endpoint. */
    public function toPortalArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar_url' => $this->avatar_url,
            'oauth_provider' => $this->oauth_provider,
        ];
    }
}
