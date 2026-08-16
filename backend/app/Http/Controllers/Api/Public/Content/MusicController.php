<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MusicTrack;

class MusicController extends Controller
{
    public function index()
    {
        return response()->json(
            MusicTrack::where('status', 'published')->orderBy('sort_order')->get(),
        );
    }
}
