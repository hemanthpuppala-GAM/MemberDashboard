<?php

namespace App\Http\Controllers\Api\Public\Cms;

use App\Http\Controllers\Controller;
use App\Models\Cms\PageContent;

class ContentController extends Controller
{
    public function index()
    {
        return response()->json(
            PageContent::all()->keyBy('slug'),
        );
    }

    public function show(string $slug)
    {
        $content = PageContent::where('slug', $slug)->firstOrFail();

        return response()->json($content);
    }
}
