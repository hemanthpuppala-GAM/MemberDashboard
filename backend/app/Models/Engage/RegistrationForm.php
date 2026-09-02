<?php

namespace App\Models\Engage;

use App\Models\Auth\User;
use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['title', 'slug', 'description', 'status', 'submit_label', 'success_message', 'created_by'])]
class RegistrationForm extends Model
{
    use LogsActivity;

    public const STATUSES = ['draft', 'published'];

    public function fields(): HasMany
    {
        return $this->hasMany(RegistrationFormField::class, 'form_id')->orderBy('sort_order');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(RegistrationFormSubmission::class, 'form_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
