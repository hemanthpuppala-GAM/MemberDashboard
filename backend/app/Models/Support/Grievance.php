<?php

namespace App\Models\Support;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;

/** Who sent a grievance and what they wrote. Every field is encrypted; only the grievance chief reads it. */
#[Fillable(['ticket_id', 'name', 'email', 'phone', 'member_ref', 'about', 'subject', 'body'])]
#[Hidden(['name', 'email', 'phone', 'member_ref', 'about', 'subject', 'body'])]
class Grievance extends Model
{
    public const ABOUT = ['A session or the program', 'A teacher, volunteer or team member', 'Safety or behaviour', 'The website or member dashboard', 'Something else'];

    protected function casts(): array
    {
        return [
            'name' => 'encrypted',
            'email' => 'encrypted',
            'phone' => 'encrypted',
            'member_ref' => 'encrypted',
            'about' => 'encrypted',
            'subject' => 'encrypted',
            'body' => 'encrypted',
        ];
    }

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }
}
