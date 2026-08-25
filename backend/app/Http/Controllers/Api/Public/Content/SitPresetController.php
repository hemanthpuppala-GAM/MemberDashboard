<?php

namespace App\Http\Controllers\Api\Public\Content;

use App\Http\Controllers\Controller;
use App\Models\Content\SitPreset;

class SitPresetController extends Controller
{
    public function index()
    {
        $presets = SitPreset::where('status', 'published')
            ->orderBy('sort_order')
            ->with('track')
            ->get()
            ->filter(fn (SitPreset $p) => $p->music_track_id === null || ($p->track && $p->track->status === 'published'))
            ->values();

        return response()->json($presets);
    }
}
