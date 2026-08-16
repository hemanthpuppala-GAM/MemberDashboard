<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PageRequest;
use App\Models\Page;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function index()
    {
        return response()->json(
            Page::withCount('sections')->orderBy('sort_order')->orderBy('title')->get(),
        );
    }

    public function store(PageRequest $request)
    {
        $page = Page::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
        ]);

        return response()->json($page, 201);
    }

    public function show(Page $page)
    {
        return response()->json($page->load(['sections.content.language', 'translations']));
    }

    public function update(PageRequest $request, Page $page)
    {
        $page->update($request->validated());

        return response()->json($page->fresh());
    }

    public function destroy(Page $page)
    {
        abort_if($page->is_builtin, 422, 'Built-in pages cannot be deleted.');

        $page->delete();

        return response()->json(null, 204);
    }

    public function updateStatus(Request $request, Page $page)
    {
        $request->validate(['status' => ['required', 'in:draft,published']]);

        $page->update(['status' => $request->input('status')]);

        return response()->json($page);
    }
}
