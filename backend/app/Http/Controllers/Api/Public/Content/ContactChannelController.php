<?php

namespace App\Http\Controllers\Api\Public\Content;

use App\Http\Controllers\Controller;
use App\Models\Content\ContactChannel;

class ContactChannelController extends Controller
{
    public function index()
    {
        return response()->json(
            ContactChannel::where('is_visible', true)->orderBy('sort_order')->get(),
        );
    }
}
