<?php

namespace App\Models\Kids;

use App\Models\People\Member;
use App\Services\Kids\KidsConsent;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** One household in the Kids Meditation Circle: the parent (a Google-signed-in member) and their children. */
#[Fillable(['member_id', 'guardian_name', 'relationship', 'email', 'phone', 'emergency_name', 'emergency_phone', 'city', 'state', 'heard_about', 'latest_consent_id', 'status', 'withdrawn_at'])]
class KidRegistration extends Model
{
    public const RELATIONSHIPS = ['Mother', 'Father', 'Legal guardian', 'Other'];

    public const HEARD_ABOUT = ['Friend or family', 'Instagram', 'YouTube', 'WhatsApp', 'Golden Age event', 'Other'];

    protected function casts(): array
    {
        return ['withdrawn_at' => 'datetime'];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function kids(): HasMany
    {
        return $this->hasMany(Kid::class);
    }

    public function consents(): HasMany
    {
        return $this->hasMany(KidConsent::class)->orderByDesc('signed_at');
    }

    public function latestConsent(): BelongsTo
    {
        return $this->belongsTo(KidConsent::class, 'latest_consent_id');
    }

    /** Signed an older wording of the consent: ask again before the next session. */
    public function needsResign(): bool
    {
        return $this->status === 'active' && (int) $this->latestConsent?->version < KidsConsent::VERSION;
    }
}
