<?php

namespace App\Http\Controllers\Api\Public\Cms;

use App\Http\Controllers\Controller;
use App\Models\Languages\Language;
use App\Models\Cms\Page;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function show(Request $request, string $slug)
    {
        $page = Page::where('slug', $slug)->where('status', 'published')->firstOrFail();

        $code = $request->query('lang');
        $language = $code
            ? Language::where('code', $code)->where('is_enabled', true)->first()
            : null;
        $language ??= Language::where('is_default', true)->firstOrFail();
        $fallback = Language::where('is_default', true)->first();

        $sections = $page->sections()
            ->where('status', 'active')
            ->with(['content' => fn ($q) => $q->whereIn('language_id', array_filter([$language->id, $fallback?->id]))])
            ->get()
            ->map(function ($section) use ($language, $fallback) {
                $byField = $section->content->groupBy('field_key');

                $fields = $byField->map(function ($entries) use ($language, $fallback) {
                    $entry = $entries->firstWhere('language_id', $language->id);
                    $entry = ($entry && filled($entry->field_value)) ? $entry : $entries->firstWhere('language_id', $fallback?->id);

                    return $entry?->decodedValue();
                });

                return [
                    'id' => $section->id,
                    'type' => $section->type,
                    'sort_order' => $section->sort_order,
                    'fields' => $fields,
                ];
            });

        return response()->json([
            'slug' => $page->slug,
            'title' => $page->title,
            'language' => $language->code,
            'sections' => $sections,
        ]);
    }
}
