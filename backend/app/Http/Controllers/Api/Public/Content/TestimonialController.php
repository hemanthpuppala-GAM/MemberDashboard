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

    /** "Seeker stories": published testimonials that have a video, newest upload first (Drive videos by their Drive upload time). */
    public function videos()
    {
        if (! Testimonial::videosReady()) {
            return response()->json([]);
        }

        return response()->json(
            Testimonial::where('status', 'published')->whereNotNull('video_url')->where('video_url', '!=', '')
                ->orderByDesc('created_at')->orderByDesc('id')->get(['id', 'name', 'role', 'place', 'photo_path', 'quote', 'video_url', 'created_at']),
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

        return response()->json(array_map(self::clip(...), $items));
    }

    /** Topic rows for the Short clips: the YouTube playlists listed in Admin → Site content → Meditation. */
    public function topics()
    {
        try {
            $topics = YouTubeFeed::topics();
        } catch (\Throwable $e) {
            report($e);
            $topics = [];
        }

        return response()->json(array_map(fn ($t) => ['title' => $t['title'], 'url' => $t['url'], 'items' => array_map(self::clip(...), $t['items'])], $topics));
    }

    private static function clip(array $v): array
    {
        return array_intersect_key($v, array_flip(['id', 'title', 'url', 'thumbnail', 'published', 'full_url']));
    }

    public function featured()
    {
        return response()->json(
            Testimonial::where('status', 'published')->where('is_featured', true)->orderBy('sort_order')->get(),
        );
    }
}
