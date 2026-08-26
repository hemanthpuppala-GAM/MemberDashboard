<?php

namespace App\Http\Controllers\Api\Public\Languages;

use App\Http\Controllers\Controller;
use App\Models\Languages\Language;
use App\Models\Languages\UiTranslation;
use Illuminate\Http\Request;

class UiStringController extends Controller
{
    public function index(Request $request)
    {
        $code = $request->query('lang');
        $language = $code
            ? Language::where('code', $code)->where('is_enabled', true)->first()
            : null;
        $language ??= Language::where('is_default', true)->firstOrFail();
        $fallback = Language::where('is_default', true)->first();

        $strings = UiTranslation::whereIn('language_id', array_filter([$language->id, $fallback?->id]))
            ->get()
            ->groupBy('key')
            ->map(function ($entries) use ($language, $fallback) {
                $entry = $entries->firstWhere('language_id', $language->id);
                $entry = ($entry && filled($entry->value)) ? $entry : $entries->firstWhere('language_id', $fallback?->id);

                return $entry?->value;
            });

        return response()->json($strings);
    }
}
