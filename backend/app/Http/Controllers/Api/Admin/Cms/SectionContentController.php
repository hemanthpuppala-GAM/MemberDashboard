<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Language;
use App\Models\PageSection;
use App\Models\SectionContent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** Body shape: { "en": { "heading": "...", "points": ["..."] }, "hi": { "heading": "..." } } */
class SectionContentController extends Controller
{
    public function index(PageSection $section)
    {
        return response()->json(
            $section->content()->with('language:id,code')->get()->groupBy('language.code'),
        );
    }

    public function update(Request $request, PageSection $section)
    {
        $request->validate(['*' => ['array']]);

        $languagesByCode = Language::pluck('id', 'code');

        DB::transaction(function () use ($request, $section, $languagesByCode) {
            foreach ($request->all() as $langCode => $fields) {
                $languageId = $languagesByCode[$langCode] ?? null;
                abort_unless($languageId, 422, "Unknown language code: {$langCode}");

                foreach ($fields as $fieldKey => $value) {
                    $isArray = is_array($value);

                    SectionContent::updateOrCreate(
                        ['section_id' => $section->id, 'language_id' => $languageId, 'field_key' => $fieldKey],
                        [
                            'field_value' => $isArray ? json_encode($value) : $value,
                            'field_type' => $isArray ? 'json' : 'text',
                        ],
                    );
                }
            }
        });

        return response()->json(
            $section->content()->with('language:id,code')->get()->groupBy('language.code'),
        );
    }
}
