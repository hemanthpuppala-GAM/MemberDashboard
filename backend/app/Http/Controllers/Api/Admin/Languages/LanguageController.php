<?php

namespace App\Http\Controllers\Api\Admin\Languages;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Languages\LanguageRequest;
use App\Models\Languages\Language;
use Illuminate\Support\Facades\DB;

class LanguageController extends Controller
{
    public function index()
    {
        return response()->json(Language::orderByDesc('is_default')->orderBy('name')->get());
    }

    public function store(LanguageRequest $request)
    {
        $language = DB::transaction(function () use ($request) {
            $language = Language::create($request->validated());
            $this->syncDefault($language);

            return $language;
        });

        return response()->json($language, 201);
    }

    public function update(LanguageRequest $request, Language $language)
    {
        DB::transaction(function () use ($request, $language) {
            $language->update($request->validated());
            $this->syncDefault($language);
        });

        return response()->json($language->fresh());
    }

    public function destroy(Language $language)
    {
        abort_if($language->is_default, 422, 'Cannot delete the default language — set another language as default first.');

        $language->delete();

        return response()->json(null, 204);
    }

    private function syncDefault(Language $language): void
    {
        if ($language->is_default) {
            Language::where('id', '!=', $language->id)->update(['is_default' => false]);
        }
    }
}
