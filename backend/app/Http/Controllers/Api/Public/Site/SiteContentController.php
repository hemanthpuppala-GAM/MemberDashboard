<?php

namespace App\Http\Controllers\Api\Public\Site;

use App\Http\Controllers\Controller;
use App\Models\Site\SiteContent;

class SiteContentController extends Controller
{
    /** Published overrides for one page; `data: null` means "use the bundled defaults". */
    public function show(string $page)
    {
        abort_unless(in_array($page, SiteContent::PAGES, true), 404);

        $content = SiteContent::where('page', $page)->first();

        return response()->json([
            'page' => $page,
            'data' => $content?->data,
            'updated_at' => $content?->updated_at,
        ]);
    }
}
