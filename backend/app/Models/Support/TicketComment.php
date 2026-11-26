<?php

namespace App\Models\Support;

use App\Models\People\Member;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['ticket_id', 'author_type', 'agent_id', 'member_id', 'body', 'internal', 'sealed'])]
class TicketComment extends Model
{
    protected function casts(): array
    {
        return ['internal' => 'boolean', 'sealed' => 'boolean'];
    }

    /** Replies and notes on a grievance are stored encrypted (`sealed`); system notes ("nudged") stay readable. */
    protected static function booted(): void
    {
        static::creating(function (TicketComment $c) {
            if ($c->author_type !== 'system' && Ticket::whereKey($c->ticket_id)->value('confidential')) {
                $c->sealed = true;
                $c->attributes['body'] = \Illuminate\Support\Facades\Crypt::encryptString((string) $c->attributes['body']);
            }
        });
    }

    public function getBodyAttribute($value): string
    {
        if (! $this->sealed) {
            return (string) $value;
        }
        try {
            return \Illuminate\Support\Facades\Crypt::decryptString((string) $value);
        } catch (\Throwable) {
            return '[unreadable]';
        }
    }

    public function agent()
    {
        return $this->belongsTo(SupportAgent::class, 'agent_id');
    }

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function toApi(bool $forMember = false): array
    {
        $name = match ($this->author_type) {
            'agent' => $forMember ? 'Golden Age Wisdom support' : ($this->agent?->name ?? 'Support'),
            'member' => $this->member?->name ?? 'Member',
            default => 'System',
        };

        return [
            'id' => $this->id,
            'author_type' => $this->author_type,
            'author_name' => $name,
            'body' => $this->body,
            'internal' => $this->internal,
            'created_at' => $this->created_at,
        ];
    }
}
