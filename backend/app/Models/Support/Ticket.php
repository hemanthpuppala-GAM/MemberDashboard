<?php

namespace App\Models\Support;

use App\Models\People\ContactSubmission;
use App\Models\People\Member;
use App\Models\People\VolunteerApplication;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

#[Fillable([
    'source', 'source_id', 'member_id', 'requester_name', 'requester_email', 'requester_phone',
    'subject', 'body', 'category', 'lang', 'status', 'priority', 'assigned_agent_id', 'created_by_agent_id',
])]
class Ticket extends Model
{
    public const STATUSES = ['open', 'in_progress', 'waiting', 'resolved', 'closed'];
    public const OPEN_STATUSES = ['open', 'in_progress', 'waiting'];
    public const SOURCES = ['ask_web', 'member_portal', 'website', 'call', 'whatsapp', 'volunteer', 'other'];
    public const PRIORITIES = ['normal', 'urgent'];

    protected function casts(): array
    {
        return [
            'first_response_at' => 'datetime',
            'resolved_at' => 'datetime',
            'rated_at' => 'datetime',
            'rating' => 'integer',
        ];
    }

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function assignee()
    {
        return $this->belongsTo(SupportAgent::class, 'assigned_agent_id');
    }

    public function creator()
    {
        return $this->belongsTo(SupportAgent::class, 'created_by_agent_id');
    }

    public function comments()
    {
        return $this->hasMany(TicketComment::class)->oldest();
    }

    /** Short reference people can read out on a call: T-1042. */
    public function getRefAttribute(): string
    {
        return 'T-'.str_pad((string) $this->id, 4, '0', STR_PAD_LEFT);
    }

    // ---- Automatic tickets ----

    public static function fromContactSubmission(ContactSubmission $s): self
    {
        $source = match ($s->source) {
            'qr_web' => 'ask_web',
            'member_portal' => 'member_portal',
            default => 'website',
        };

        return self::firstOrCreate(
            ['source' => $source, 'source_id' => $s->id],
            [
                'member_id' => $s->member_id,
                'requester_name' => $s->name,
                'requester_email' => $s->email ?: null,
                'requester_phone' => $s->phone ?: null,
                'subject' => self::subjectFrom($s->message),
                'body' => $s->message,
                'category' => $s->category ?: 'general',
                'lang' => request()?->input('lang'),
            ],
        );
    }

    public static function fromVolunteerApplication(VolunteerApplication $a): self
    {
        $lines = array_filter([
            $a->teams ? 'Teams: '.implode(', ', (array) $a->teams) : null,
            $a->availability ? 'Availability: '.$a->availability : null,
            $a->city ? 'City: '.$a->city : null,
            $a->occupation ? 'Occupation: '.$a->occupation : null,
            $a->notes ? "Notes: {$a->notes}" : null,
        ]);

        return self::firstOrCreate(
            ['source' => 'volunteer', 'source_id' => $a->id],
            [
                'member_id' => Member::where('email', $a->email)->value('id'),
                'requester_name' => $a->name,
                'requester_email' => $a->email,
                'requester_phone' => $a->phone,
                'subject' => 'Volunteer sign-up: '.$a->name,
                'body' => implode("\n", $lines) ?: 'New volunteer sign-up.',
                'category' => 'volunteer',
                'lang' => $a->lang ? strtolower($a->lang) : null,
            ],
        );
    }

    public static function subjectFrom(?string $text): string
    {
        $t = trim(preg_replace('/\s+/', ' ', (string) $text));

        return $t === '' ? 'Question' : Str::limit($t, 90);
    }

    // ---- State changes ----

    /** Apply a status change, keeping the timing fields honest. */
    public function moveTo(string $status): void
    {
        if ($status === $this->status) {
            return;
        }
        if (in_array($status, ['resolved', 'closed'], true)) {
            $this->resolved_at ??= now();
        } else {
            $this->resolved_at = null;
        }
        if ($status !== 'open' && ! $this->first_response_at) {
            $this->first_response_at = now();
        }
        $this->status = $status;
    }

    public function isOpen(): bool
    {
        return in_array($this->status, self::OPEN_STATUSES, true);
    }

    public function toApi(bool $withThread = false, bool $forMember = false): array
    {
        $data = [
            'id' => $this->id,
            'ref' => $this->ref,
            'source' => $this->source,
            'subject' => $this->subject,
            'body' => $this->body,
            'category' => $this->category,
            'lang' => $this->lang,
            'status' => $this->status,
            'priority' => $this->priority,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'first_response_at' => $this->first_response_at,
            'resolved_at' => $this->resolved_at,
            'rating' => $this->rating,
            'rating_comment' => $this->rating_comment,
        ];

        if (! $forMember) {
            $data['requester'] = [
                'name' => $this->requester_name,
                'email' => $this->requester_email,
                'phone' => $this->requester_phone,
                'member_id' => $this->member_id,
            ];
            $data['assignee'] = $this->assignee?->toPublic();
            $data['created_by'] = $this->creator?->toPublic();
            $data['comments_count'] = $this->comments_count ?? null;
        }

        if ($withThread) {
            $comments = $this->comments()->with(['agent', 'member'])->get();
            if ($forMember) {
                $comments = $comments->where('internal', false)->values();
            }
            $data['comments'] = $comments->map(fn (TicketComment $c) => $c->toApi($forMember))->all();
        }

        return $data;
    }
}
