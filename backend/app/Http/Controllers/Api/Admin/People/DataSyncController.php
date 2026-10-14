<?php

namespace App\Http\Controllers\Api\Admin\People;

use App\Http\Controllers\Controller;
use App\Services\People\SupabaseSync;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/** Admin → People → Data sync: pull the live site's Supabase data in, preview first. */
class DataSyncController extends Controller
{
    public const CACHE_KEY = 'data_sync.last_report';

    public function show()
    {
        return response()->json([
            'configured' => SupabaseSync::configured(),
            'tables' => SupabaseSync::TABLES,
            'last' => Cache::get(self::CACHE_KEY),
        ]);
    }

    public function run(Request $request)
    {
        $data = $request->validate([
            'preview' => ['sometimes', 'boolean'],
            'tables' => ['sometimes', 'array'],
            'tables.*' => ['string', 'in:'.implode(',', SupabaseSync::TABLES)],
        ]);
        abort_unless(SupabaseSync::configured(), 422, 'Add SUPABASE_URL and SUPABASE_SERVICE_KEY to the backend .env first.');

        try {
            $report = (new SupabaseSync)->run((bool) ($data['preview'] ?? true), $data['tables'] ?? null);
        } catch (\Throwable $e) {
            report($e);

            return response()->json(['message' => 'Sync failed: '.$e->getMessage()], 502);
        }
        $report['by'] = $request->user()->name;
        if (! $report['dry_run']) {
            Cache::forever(self::CACHE_KEY, $report);
        }

        return response()->json($report);
    }
}
