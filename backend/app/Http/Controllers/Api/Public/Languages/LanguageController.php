<?php

namespace App\Http\Controllers\Api\Public\Languages;

use App\Http\Controllers\Controller;
use App\Models\Languages\Language;

class LanguageController extends Controller
{
    public function enabled()
    {
        return response()->json(
            Language::where('is_enabled', true)->orderByDesc('is_default')->orderBy('name')->get(),
        );
    }
}
