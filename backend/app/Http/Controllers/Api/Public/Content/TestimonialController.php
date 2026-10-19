<?php

namespace App\Http\Controllers\Api\Public\Content;

use App\Http\Controllers\Controller;
use App\Models\Content\Testimonial;
use App\Services\Content\YouTubeFeed;

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

    /**
     * All the channel's Shorts (wisdom clips and testimonials alike), newest first — the
     * Meditation page's "Short clips". The list is refreshed once a day (see YouTubeFeed).
     */
    public function shorts()
    {
        try {
            $items = YouTubeFeed::latest()['items'];
        } catch (\Throwable $e) {
            report($e);
            $items = [];
        }
        usort($items, fn ($a, $b) => strcmp((string) ($b['published'] ?? ''), (string) ($a['published'] ?? '')));
        $items = array_values(array_filter($items, fn ($v) => $v['is_short'] ?? true));

        return response()->json(array_map(fn ($v) => array_intersect_key($v, array_flip(['id', 'title', 'url', 'thumbnail', 'published'])), $items));
    }

    public function featured()
    {
        return response()->json(
            Testimonial::where('status', 'published')->where('is_featured', true)->orderBy('sort_order')->get(),
        );
    }
}
