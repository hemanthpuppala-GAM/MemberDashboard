<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PageContent;

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
