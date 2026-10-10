<?php

namespace App\Http\Controllers\Api\Admin\Site;

use App\Http\Controllers\Controller;
use App\Models\Site\SiteContent;
use Illuminate\Http\Request;

class SiteContentController extends Controller
{
    public function index()
    {
        return response()->json(
            SiteContent::with('editor:id,name')->get(['id', 'page', 'updated_by', 'updated_at'])->keyBy('page'),
        );
    }

    public function show(string $page)
    {
        abort_unless(in_array($page, SiteContent::PAGES, true), 404);

        $content = SiteContent::with('editor:id,name')->where('page', $page)->first();

        return response()->json([
            'page' => $page,
            'data' => $content?->data,
            'updated_at' => $content?->updated_at,
            'editor' => $content?->editor,
        ]);
    }

    /** Publish: replaces the page's whole JSON document. */
    public function update(Request $request, string $page)
    {
        abort_unless(in_array($page, SiteContent::PAGES, true), 404);

        $validated = $request->validate([
            'data' => ['required', 'array'],
        ]);
        abort_if(strlen(json_encode($validated['data'])) > 200_000, 422, 'Content is too large.');

        $content = SiteContent::updateOrCreate(
            ['page' => $page],
            ['data' => $validated['data'], 'updated_by' => $request->user()->id],
        );

        return response()->json(['page' => $page, 'data' => $content->data, 'updated_at' => $content->updated_at]);
    }

    /** Reset: drop the published record so the page falls back to the bundled defaults. */
    public function destroy(string $page)
    {
        abort_unless(in_array($page, SiteContent::PAGES, true), 404);

        SiteContent::where('page', $page)->delete();

        return response()->json(['page' => $page, 'data' => null]);
    }
}
