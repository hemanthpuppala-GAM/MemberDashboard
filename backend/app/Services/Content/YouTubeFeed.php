<?php

namespace App\Services\Content;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use SimpleXMLElement;

/**
 * Latest videos from the channel's public RSS feeds (no API key): the Shorts playlist first
 * (UUSH… = the channel's Shorts), else all uploads. Used to pick Shorts as video testimonials.
 */
class YouTubeFeed
{
    /** @return array{channel: string, items: list<array{id: string, title: string, url: string, thumbnail: string, published: ?string, is_short: bool}>} */
    public static function latest(): array
    {
        return Cache::remember('youtube_feed.latest', now()->addMinutes(30), function () {
            $channelId = self::channelId();
            $shortsPlaylist = 'UUSH'.substr($channelId, 2);

            $items = self::read("https://www.youtube.com/feeds/videos.xml?playlist_id={$shortsPlaylist}", true);
            if (! $items) {
                $items = self::read("https://www.youtube.com/feeds/videos.xml?channel_id={$channelId}", false);
            }

            return ['channel' => (string) config('services.youtube.channel'), 'items' => $items];
        });
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

    private static function read(string $url, bool $allShorts): array
    {
        $res = Http::timeout(15)->get($url);

        return $res->successful() ? self::parse($res->body(), $allShorts) : [];
    }
}
