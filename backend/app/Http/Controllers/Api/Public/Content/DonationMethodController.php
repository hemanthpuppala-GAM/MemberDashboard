<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DonationMethod;

class DonationMethodController extends Controller
{
    public function index()
    {
        return response()->json(
            DonationMethod::where('is_active', true)->orderBy('sort_order')->get(),
        );
    }
}
