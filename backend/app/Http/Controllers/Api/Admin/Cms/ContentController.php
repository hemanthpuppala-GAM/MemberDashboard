<?php

namespace App\Http\Controllers\Api\Admin\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Cms\PageContentUpdateRequest;
use App\Models\Cms\PageContent;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    public function index()
    {
        return response()->json(PageContent::all()->keyBy('slug'));
    }

    public function update(PageContentUpdateRequest $request, string $slug)
    {
        abort_unless(in_array($slug, PageContent::SLUGS, true), 404);

        $content = PageContent::firstOrNew(['slug' => $slug]);
        $content->fill($request->validated());
        $content->updated_by = $request->user()->id;
        $content->save();

        return response()->json($content);
    }
}
