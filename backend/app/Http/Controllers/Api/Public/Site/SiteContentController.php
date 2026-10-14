<?php

namespace App\Http\Controllers\Api\Public\Site;

use App\Http\Controllers\Controller;
use App\Models\Site\SiteContent;

class SiteContentController extends Controller
{
    /** The page's full copy: backend defaults overlaid with admin edits. `customized` = an admin has published edits. */
    public function show(string $page)
    {
        abort_unless(in_array($page, SiteContent::PAGES, true), 404);

        $content = SiteContent::where('page', $page)->first();

        return response()->json([
            'page' => $page,
            'data' => SiteContent::merged($page, $content),
            'customized' => (bool) $content,
            'updated_at' => $content?->updated_at,
        ]);
    }
}
