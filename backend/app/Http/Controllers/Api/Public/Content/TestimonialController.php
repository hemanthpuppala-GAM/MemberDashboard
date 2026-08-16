<?php

namespace App\Http\Controllers\Api\Public\Content;

use App\Http\Controllers\Controller;
use App\Models\Content\Testimonial;

class TestimonialController extends Controller
{
    public function index()
    {
        return response()->json(
            Testimonial::where('status', 'published')->orderBy('sort_order')->get(),
        );
    }

    public function featured()
    {
        return response()->json(
            Testimonial::where('status', 'published')->where('is_featured', true)->orderBy('sort_order')->get(),
        );
    }
}
