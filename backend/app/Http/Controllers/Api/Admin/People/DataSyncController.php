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

    public const ERROR_KEY = 'data_sync.last_error';

    public function show()
    {
        return response()->json([
            'configured' => SupabaseSync::configured(),
            'tables' => SupabaseSync::TABLES,
            'last' => Cache::get(self::CACHE_KEY),
            'last_error' => Cache::get(self::ERROR_KEY),
            'auto' => (bool) config('services.supabase.auto_sync'),
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

            // The full error (with the row's data) goes to the log; the admin sees the first line.
            $first = strtok($e->getMessage(), "\n");

            return response()->json(['message' => 'Sync failed — nothing was saved. '.\Illuminate\Support\Str::limit($first, 240)], 502);
        }
        $report['by'] = $request->user()->name;
        if (! $report['dry_run']) {
            Cache::forever(self::CACHE_KEY, $report);
            Cache::forget(self::ERROR_KEY);
        }

        return response()->json($report);
    }
}
