<?php

namespace App\Models\Site;

use App\Models\Auth\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['page', 'data', 'updated_by'])]
class SiteContent extends Model
{
    /** Public pages whose copy is editable from Admin → Site content. */
    public const PAGES = ['home', 'about', 'mission', 'meditation', 'wisdom', 'wellness', 'events', 'volunteer', 'donate'];

    /**
     * Default copy for a page (resources/site-content/{page}.json). The backend owns these:
     * the public API always serves defaults + admin edits, so the website needs no copy of its
     * own (its bundled JSON is only an offline fallback, kept identical by SiteContentTest).
     */
    public static function defaults(string $page): array
    {
        $path = resource_path("site-content/{$page}.json");
        if (! in_array($page, self::PAGES, true) || ! is_file($path)) {
            return [];
        }

        return json_decode(file_get_contents($path), true) ?: [];
    }

    /** Defaults overlaid key-by-key with whatever an admin published. */
    public static function merged(string $page, ?self $content = null): array
    {
        return array_merge(self::defaults($page), $content?->data ?? []);
    }

    protected function casts(): array
    {
        return ['data' => 'array'];
    }

    public function editor()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
