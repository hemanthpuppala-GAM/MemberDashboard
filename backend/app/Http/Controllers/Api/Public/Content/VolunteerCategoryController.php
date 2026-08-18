<?php

namespace App\Http\Controllers\Api\Public\Content;

use App\Http\Controllers\Controller;
use App\Models\Content\VolunteerCategory;

class VolunteerCategoryController extends Controller
{
    public function index()
    {
        return response()->json(
            VolunteerCategory::where('is_active', true)->orderBy('sort_order')->get(),
        );
    }
}
