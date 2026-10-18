<?php

namespace App\Services\Content;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use SimpleXMLElement;

/**
 * Latest Shorts from the channel, without an API key: the public RSS feed of the channel's
 * Shorts playlist (UUSH…) first; when YouTube serves that empty (it often does), the Shorts
 * tab of the channel page itself, with titles from oEmbed. Used to pick video testimonials.
 */
class YouTubeFeed
{
    /** @return array{channel: string, items: list<array{id: string, title: string, url: string, thumbnail: string, published: ?string, is_short: bool}>} */
    public static function latest(): array
    {
        $cached = Cache::get('youtube_feed.latest');
        if (! empty($cached['items'])) { // an empty list saved by an older version doesn't count
            return $cached;
        }

        $channelId = self::channelId();
        $items = self::read('https://www.youtube.com/feeds/videos.xml?playlist_id=UUSH'.substr($channelId, 2), true)
            ?: self::fromShortsPage()
            ?: self::read("https://www.youtube.com/feeds/videos.xml?channel_id={$channelId}", false);

        $result = ['channel' => (string) config('services.youtube.channel'), 'items' => $items];
        if ($items) { // never remember an empty answer — the next try may work
            Cache::put('youtube_feed.latest', $result, now()->addMinutes(30));
        }

        return $result;
    }

    public static function channelId(): string
    {
        if ($id = config('services.youtube.channel_id')) {
            return $id;
        }
        $handle = ltrim((string) config('services.youtube.channel'), '/');

        return Cache::rememberForever('youtube_feed.channel_id.'.md5($handle), function () use ($handle) {
            $html = Http::timeout(15)->withHeaders(['Accept-Language' => 'en'])->get("https://www.youtube.com/{$handle}")->throw()->body();
            foreach (['/"externalId":"(UC[\w-]{22})"/', '/"channelId":"(UC[\w-]{22})"/', '/channel_id=(UC[\w-]{22})/', '/\/channel\/(UC[\w-]{22})/'] as $pattern) {
                if (preg_match($pattern, $html, $m)) {
                    return $m[1];
                }
            }
            throw new RuntimeException("Could not find the YouTube channel id for {$handle}. Set YOUTUBE_CHANNEL_ID in .env.");
        });
    }

    /** @return list<array{id: string, title: string, url: string, thumbnail: string, published: ?string, is_short: bool}> */
    public static function parse(string $xml, bool $allShorts = false): array
    {
        $prev = libxml_use_internal_errors(true);
        $feed = simplexml_load_string($xml);
        libxml_use_internal_errors($prev);
        if (! $feed instanceof SimpleXMLElement) {
            return [];
        }
        $items = [];
        foreach ($feed->entry as $entry) {
            $yt = $entry->children('http://www.youtube.com/xml/schemas/2015');
            $media = $entry->children('http://search.yahoo.com/mrss/');
            $id = (string) $yt->videoId;
            if ($id === '') {
                continue;
            }
            $link = (string) ($entry->link['href'] ?? '');
            $thumb = $media->group ? (string) ($media->group->thumbnail?->attributes()['url'] ?? '') : '';
            $short = $allShorts || str_contains($link, '/shorts/');
            $items[] = [
                'id' => $id,
                'title' => trim((string) $entry->title),
                'url' => $short ? "https://www.youtube.com/shorts/{$id}" : "https://www.youtube.com/watch?v={$id}",
                'thumbnail' => $thumb ?: "https://i.ytimg.com/vi/{$id}/hqdefault.jpg",
                'published' => ((string) $entry->published) ?: null,
                'is_short' => $short,
            ];
        }

        return $items;
    }

    /**
     * The channel's Shorts tab (/@handle/shorts): video ids from the page data, newest first,
     * titled via YouTube's public oEmbed endpoint.
     *
     * @return list<array{id: string, title: string, url: string, thumbnail: string, published: ?string, is_short: bool}>
     */
    public static function fromShortsPage(int $limit = 24): array
    {
        $handle = trim((string) config('services.youtube.channel'), '/');
        $page = Http::timeout(15)->withHeaders(['Accept-Language' => 'en'])->get("https://www.youtube.com/{$handle}/shorts");
        if (! $page->successful()) {
            return [];
        }
        $ids = self::shortIds($page->body(), $limit);

        return array_map(function (string $id) {
            $title = '';
            try {
                $o = Http::timeout(8)->get('https://www.youtube.com/oembed', ['url' => "https://www.youtube.com/shorts/{$id}", 'format' => 'json']);
                $title = $o->successful() ? trim((string) $o->json('title')) : '';
            } catch (\Throwable) {
                // keep the id; the admin sees the thumbnail
            }

            return [
                'id' => $id,
                'title' => $title ?: 'YouTube Short',
                'url' => "https://www.youtube.com/shorts/{$id}",
                'thumbnail' => "https://i.ytimg.com/vi/{$id}/hqdefault.jpg",
                'published' => null,
                'is_short' => true,
            ];
        }, $ids);
    }

    /** Short video ids in the order they appear in the Shorts tab's page data. @return list<string> */
    public static function shortIds(string $html, int $limit = 24): array
    {
        preg_match_all('#(?:"/shorts/|"videoId":")([\w-]{11})"#', $html, $m);

        return array_slice(array_values(array_unique($m[1])), 0, $limit);
    }

    private static function read(string $url, bool $allShorts): array
    {
        $res = Http::timeout(15)->get($url);

        return $res->successful() ? self::parse($res->body(), $allShorts) : [];
    }
}
