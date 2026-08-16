<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Language;

class LanguageController extends Controller
{
    public function enabled()
    {
        return response()->json(
            Language::where('is_enabled', true)->orderByDesc('is_default')->orderBy('name')->get(),
        );
    }
}
