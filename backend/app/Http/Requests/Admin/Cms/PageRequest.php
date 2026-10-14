<?php

namespace App\Http\Requests\Admin\Cms;

use App\Models\Cms\Page;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PageRequest extends FormRequest
{
    /** Public URLs owned by hand-built pages / app routes (frontend App.jsx). */
    public const RESERVED_SLUGS = [
        'home', 'about', 'mission', 'meditation', 'meditate', 'wisdom', 'wellness', 'events', 'volunteer',
        'privacy', 'donate', 'contact', 'join', 'ask', 'support', 'dashboard', 'admin', 'register', 'auth',
    ];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $pageId = $this->route('page')?->id;

        return [
            'slug' => array_filter([
                'required', 'string', 'max:191', 'alpha_dash', 'unique:pages,slug,'.$pageId,
                // New pages can't take a URL the website already uses for a hand-built page.
                $pageId ? null : Rule::notIn(self::RESERVED_SLUGS),
            ]),
            'title' => ['required', 'string', 'max:255'],
            'status' => ['required', Rule::in(Page::STATUSES)],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
