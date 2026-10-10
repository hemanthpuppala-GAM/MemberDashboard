<?php

namespace App\Models\Support;

use App\Models\People\Member;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['ticket_id', 'author_type', 'agent_id', 'member_id', 'body', 'internal'])]
class TicketComment extends Model
{
    protected function casts(): array
    {
        return ['internal' => 'boolean'];
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
