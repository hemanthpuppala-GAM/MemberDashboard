<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SectionRequest;
use App\Models\Page;
use App\Models\PageSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SectionController extends Controller
{
    public function index(Page $page)
    {
        return response()->json($page->sections()->with('content.language')->get());
    }

    public function store(SectionRequest $request, Page $page)
    {
        $section = $page->sections()->create([
            ...$request->validated(),
            'sort_order' => $request->validated('sort_order') ?? $page->sections()->count() + 1,
        ]);

        return response()->json($section, 201);
    }

    public function update(SectionRequest $request, Page $page, PageSection $section)
    {
        abort_unless($section->page_id === $page->id, 404);

        $section->update($request->validated());

        return response()->json($section->fresh());
    }

    public function destroy(Page $page, PageSection $section)
    {
        abort_unless($section->page_id === $page->id, 404);

        $section->delete();

        return response()->json(null, 204);
    }

    public function reorder(Request $request, Page $page)
    {
        $request->validate([
            'section_ids' => ['required', 'array'],
            'section_ids.*' => ['integer', 'exists:page_sections,id'],
        ]);

        DB::transaction(function () use ($request, $page) {
            foreach ($request->input('section_ids') as $index => $id) {
                PageSection::where('id', $id)->where('page_id', $page->id)->update(['sort_order' => $index + 1]);
            }
        });

        return response()->json($page->sections()->with('content.language')->get());
    }
}
