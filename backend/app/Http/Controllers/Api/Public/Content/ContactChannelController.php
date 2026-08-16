<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactChannel;

class ContactChannelController extends Controller
{
    public function index()
    {
        return response()->json(
            ContactChannel::where('is_visible', true)->orderBy('sort_order')->get(),
        );
    }
}
