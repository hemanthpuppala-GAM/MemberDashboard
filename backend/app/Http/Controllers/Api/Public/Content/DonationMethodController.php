<?php

namespace App\Http\Controllers\Api\Public\Content;

use App\Http\Controllers\Controller;
use App\Models\Content\DonationMethod;

class DonationMethodController extends Controller
{
    public function index()
    {
        return response()->json(
            DonationMethod::where('is_active', true)->orderBy('sort_order')->get(),
        );
    }
}
