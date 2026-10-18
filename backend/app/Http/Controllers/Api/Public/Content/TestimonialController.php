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

    /** "Seeker stories": published testimonials that have a video, in the admin's order. */
    public function videos()
    {
        if (! Testimonial::videosReady()) {
            return response()->json([]);
        }

        return response()->json(
            Testimonial::where('status', 'published')->whereNotNull('video_url')->where('video_url', '!=', '')
                ->orderBy('sort_order')->get(['id', 'name', 'role', 'place', 'photo_path', 'quote', 'video_url']),
        );
    }

    public function featured()
    {
        return response()->json(
            Testimonial::where('status', 'published')->where('is_featured', true)->orderBy('sort_order')->get(),
        );
    }
}
