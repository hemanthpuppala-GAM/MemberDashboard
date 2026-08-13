<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'email', 'message', 'status'])]
class ContactSubmission extends Model
{
    public const STATUSES = ['new', 'read', 'archived'];
}
