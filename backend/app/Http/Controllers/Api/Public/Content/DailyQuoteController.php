<?php

namespace App\Http\Controllers\Api\Public\Content;

use App\Http\Controllers\Controller;
use App\Models\Content\DailyQuote;
use Illuminate\Http\Request;

class DailyQuoteController extends Controller
{
    /** Today's quote and the ones before it (for "previous days" in the viewer). */
    public function index(Request $request)
    {
        if (! DailyQuote::ready()) {
            return response()->json(['today' => null, 'recent' => []]);
        }
        $limit = min(30, max(1, (int) $request->query('limit', 14)));
        $quotes = DailyQuote::showing()->limit($limit)->get(['id', 'image_path', 'title', 'text', 'author', 'show_on']);

        return response()->json(['today' => $quotes->first(), 'recent' => $quotes->values()]);
    }
}
