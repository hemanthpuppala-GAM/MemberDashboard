<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Broadcast;
use Illuminate\Http\Request;

class BroadcastController extends Controller
{
    public function active(Request $request)
    {
        $page = $request->query('page');
        $today = now()->toDateString();

        $broadcasts = Broadcast::where('status', 'active')
            ->where(fn ($q) => $q->whereNull('active_from')->orWhereDate('active_from', '<=', $today))
            ->where(fn ($q) => $q->whereNull('active_until')->orWhereDate('active_until', '>=', $today))
            ->get()
            ->filter(fn ($b) => ! $page || empty($b->target_pages) || in_array($page, $b->target_pages, true))
            ->values();

        return response()->json($broadcasts);
    }
}
