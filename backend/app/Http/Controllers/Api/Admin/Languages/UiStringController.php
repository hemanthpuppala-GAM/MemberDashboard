<?php

namespace App\Http\Controllers\Api\Admin\Languages;

use App\Http\Controllers\Controller;
use App\Models\Languages\Language;
use App\Models\Languages\UiTranslation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** Body shape: { "en": { "nav.about": "About", "footer.tagline": "..." }, "hi": { "nav.about": "..." } } */
class UiStringController extends Controller
{
    public function index()
    {
        return response()->json(
            UiTranslation::with('language:id,code')->get(['id', 'language_id', 'key', 'value']),
        );
    }

    public function update(Request $request)
    {
        $request->validate(['*' => ['array']]);

        $languagesByCode = Language::pluck('id', 'code');

        DB::transaction(function () use ($request, $languagesByCode) {
            foreach ($request->all() as $langCode => $strings) {
                $languageId = $languagesByCode[$langCode] ?? null;
                abort_unless($languageId, 422, "Unknown language code: {$langCode}");

                foreach ($strings as $key => $value) {
                    UiTranslation::updateOrCreate(
                        ['language_id' => $languageId, 'key' => $key],
                        ['value' => $value],
                    );
                }
            }
        });

        return response()->json(
            UiTranslation::with('language:id,code')->get(['id', 'language_id', 'key', 'value']),
        );
    }
}
