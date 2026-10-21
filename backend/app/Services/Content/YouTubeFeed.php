<?php

namespace App\Services\Content;

use App\Models\Site\SiteContent;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use SimpleXMLElement;

/**
 * Latest Shorts from the channel, without an API key: the public RSS feed of the channel's
 * Shorts playlist (UUSH…) first; when YouTube serves that empty (it often does), the Shorts
 * tab of the channel page itself, with titles from oEmbed. Used for the Meditation page's Short
 * clips (plus topic rows from playlists) and to pick video testimonials.
 */
class YouTubeFeed
{
    private const KEY = 'youtube_feed.latest';

    /** A list older than this is refreshed on the next visit (the daily schedule normally does it first). */
    private const MAX_AGE_HOURS = 26;

    /**
     * The saved list, refreshed once a day by `youtube:refresh`. If the schedule hasn't run, a
     * visit refreshes a list older than a day; if YouTube fails, the last good list stays.
     *
     * @return array{channel: string, items: list<array{id: string, title: string, url: string, thumbnail: string, published: ?string, is_short: bool, full_url: ?string}>, fetched_at?: string}
     */
    public static function latest(): array
    {
        return self::remember(self::KEY, fn () => self::readChannel());
    }

    /** Read the channel now and save the list. Keeps (and returns) the last good list when YouTube fails. */
    public static function refresh(): array
    {
        return self::remember(self::KEY, fn () => self::readChannel(), true);
    }

    /** One playlist's videos (a "topic" row of Short clips), saved and refreshed like the channel list. */
    public static function playlist(string $id, bool $refresh = false): array
    {
        return self::remember(self::KEY.'.playlist.'.$id, fn () => self::readPlaylist($id), $refresh);
    }

    /**
     * Topic rows for the Meditation page's Short clips: the playlists listed in Admin → Site content →
     * Meditation, each with its videos. Topics without a valid playlist, or whose playlist is empty, are left out.
     *
     * @return list<array{title: string, playlist_id: string, url: string, items: list<array>}>
     */
    public static function topics(bool $refresh = false): array
    {
        $rows = SiteContent::merged('meditation', SiteContent::where('page', 'meditation')->first())['clipsTopics'] ?? [];
        $topics = [];
        foreach (is_array($rows) ? $rows : [] as $row) {
            $title = trim((string) ($row['title'] ?? ''));
            $id = self::playlistId((string) ($row['playlist'] ?? ''));
            if ($title === '' || ! $id) {
                continue;
            }
            try {
                $items = self::playlist($id, $refresh)['items'];
            } catch (\Throwable $e) {
                report($e);
                $items = [];
            }
            if ($items) {
                $topics[] = ['title' => $title, 'playlist_id' => $id, 'url' => "https://www.youtube.com/playlist?list={$id}", 'items' => $items];
            }
        }

        return $topics;
    }

    /** A playlist id from a pasted playlist link (…?list=PL…) or the bare id. */
    public static function playlistId(string $value): ?string
    {
        $value = trim($value);
        if (preg_match('/[?&]list=([\w-]{10,64})/', $value, $m)) {
            return $m[1];
        }

        return preg_match('/^[\w-]{10,64}$/', $value) ? $value : null;
    }

    /**
     * The long video a Short points to ("watch the full video — link in description"): the first
     * youtube.com/watch, /live or youtu.be link in the description that isn't the Short itself.
     */
    public static function fullVideoUrl(string $description, string $selfId): ?string
    {
        preg_match_all('#https?://(?:www\.|m\.)?(?:youtube\.com/(?:watch\?(?:[^\s"<]*&)?v=|live/)|youtu\.be/)([\w-]{11})#i', $description, $m);
        foreach ($m[1] as $id) {
            if ($id !== $selfId) {
                return "https://www.youtube.com/watch?v={$id}";
            }
        }

        return null;
    }

    /**
     * Cached read with the same rules for every list: fresh for a day; after a failure the last good
     * list is kept (and YouTube left alone for 10 minutes); an empty answer is never saved.
     */
    private static function remember(string $key, callable $read, bool $force = false): array
    {
        $cached = Cache::get($key);
        if (! $force) {
            $fresh = ! empty($cached['items']) && isset($cached['fetched_at'])
                && now()->subHours(self::MAX_AGE_HOURS)->lt($cached['fetched_at']);
            if ($fresh || (! empty($cached['items']) && Cache::has($key.'.failed'))) {
                return $cached;
            }
        }

        try {
            $items = $read();
        } catch (\Throwable $e) {
            Cache::put($key.'.failed', true, now()->addMinutes(10));
            if (! empty($cached['items'])) {
                report($e);

                return $cached;
            }
            throw $e;
        }

        if (! $items) { // never save an empty answer — the next try may work
            Cache::put($key.'.failed', true, now()->addMinutes(10));

            return ! empty($cached['items']) ? $cached : ['channel' => (string) config('services.youtube.channel'), 'items' => []];
        }
        $result = ['channel' => (string) config('services.youtube.channel'), 'items' => $items, 'fetched_at' => now()->toIso8601String()];
        Cache::forever($key, $result);
        Cache::forget($key.'.failed');

        return $result;
    }

    private static function readChannel(): array
    {
        $channelId = self::channelId();
        $channelFeed = "https://www.youtube.com/feeds/videos.xml?channel_id={$channelId}";
        $items = self::read('https://www.youtube.com/feeds/videos.xml?playlist_id=UUSH'.substr($channelId, 2), true);
        if (! $items && ($items = self::fromShortsPage())) {
            // The Shorts tab has no descriptions: take the full-video links from the channel feed (latest 15).
            $links = [];
            try {
                foreach (self::read($channelFeed, false) as $v) {
                    $links[$v['id']] = $v['full_url'];
                }
            } catch (\Throwable) {
                // the clips still work without the links
            }
            foreach ($items as &$item) {
                $item['full_url'] = $links[$item['id']] ?? null;
            }
            unset($item);
        }

        return $items ?: self::read($channelFeed, false);
    }

    private static function readPlaylist(string $id): array
    {
        $shorts = array_flip(array_column(Cache::get(self::KEY)['items'] ?? [], 'id'));
        $items = self::read("https://www.youtube.com/feeds/videos.xml?playlist_id={$id}", false);
        foreach ($items as &$item) {
            if (! $item['is_short'] && isset($shorts[$item['id']])) {
                $item['is_short'] = true;
                $item['url'] = "https://www.youtube.com/shorts/{$item['id']}";
            }
        }
        unset($item);

        return $items;
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
            $description = (string) ($media->group->description ?? '');
            $short = $allShorts || str_contains($link, '/shorts/');
            $items[] = [
                'id' => $id,
                'title' => trim((string) $entry->title),
                'url' => $short ? "https://www.youtube.com/shorts/{$id}" : "https://www.youtube.com/watch?v={$id}",
                // Always i.ytimg.com: the feed's i1–i4.ytimg.com hosts are blocked by the site's CSP.
                'thumbnail' => "https://i.ytimg.com/vi/{$id}/hqdefault.jpg",
                'published' => ((string) $entry->published) ?: null,
                'is_short' => $short,
                'full_url' => self::fullVideoUrl($description, $id),
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
                'full_url' => null,
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
