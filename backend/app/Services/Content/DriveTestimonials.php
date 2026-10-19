<?php

namespace App\Services\Content;

use App\Models\Content\DriveImport;
use App\Models\Content\Testimonial;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Copies new videos from the team's Google Drive folder onto this server as draft
 * testimonials — an admin adds the details and publishes them as Home page stories.
 * Videos play from our own server: the site's CSP allows media only from 'self', and
 * Drive's own player stops working on busy files.
 */
class DriveTestimonials
{
    private const API = 'https://www.googleapis.com/drive/v3/files';

    public static function configured(): bool
    {
        return filled(config('services.google_drive.api_key')) && filled(config('services.google_drive.testimonials_folder'));
    }

    /** False until `php artisan migrate` creates drive_imports (deploys don't migrate). */
    public static function ready(): bool
    {
        return Schema::hasTable('drive_imports');
    }

    /**
     * @param  ?int  $limit  Most videos to copy in this run (a web request stops early; the rest wait for the next run).
     * @return array{imported: list<string>, skipped: list<string>, remaining: int}
     */
    public static function import(?int $limit = null): array
    {
        if (! self::configured()) {
            throw new RuntimeException('Set GOOGLE_DRIVE_API_KEY and GOOGLE_DRIVE_TESTIMONIALS_FOLDER in .env, then run php artisan config:cache.');
        }
        if (! self::ready()) {
            throw new RuntimeException('Run php artisan migrate first (creates the drive_imports table).');
        }

        $files = self::listVideos();
        self::keepUploadTimes($files);
        $known = DriveImport::pluck('file_id')->all();
        $new = array_values(array_filter($files, fn ($f) => ! in_array($f['id'], $known, true)));
        $maxBytes = max(1, (int) config('services.google_drive.max_mb', 200)) * 1048576;
        $report = ['imported' => [], 'skipped' => [], 'remaining' => 0];

        foreach ($new as $i => $file) {
            if ($limit !== null && count($report['imported']) >= $limit) {
                $report['remaining'] = count($new) - $i;
                break;
            }
            if ((int) ($file['size'] ?? 0) > $maxBytes) {
                $report['skipped'][] = $file['name'].' — larger than '.config('services.google_drive.max_mb', 200).' MB';

                continue;
            }
            $url = self::copy($file);
            [$name, $place] = self::nameAndPlace($file['name']);
            $testimonial = Testimonial::create([
                'name' => $name,
                'place' => $place,
                'quote' => '',
                'video_url' => $url,
                'rating' => 5,
                'status' => 'draft',
                'sort_order' => Testimonial::count() + 1,
            ]);
            if ($at = self::uploadedAt($file)) {
                $testimonial->forceFill(['created_at' => $at])->save();
            }
            DriveImport::create(['file_id' => $file['id'], 'file_name' => Str::limit($file['name'], 250, ''), 'testimonial_id' => $testimonial->id]);
            $report['imported'][] = $file['name'];
        }

        return $report;
    }

    /** Stories are ordered by upload time: give imported testimonials their Drive upload time (also fixes earlier imports). */
    private static function keepUploadTimes(array $files): void
    {
        $times = collect($files)->mapWithKeys(fn ($f) => [$f['id'] => self::uploadedAt($f)])->filter();
        DriveImport::whereIn('file_id', $times->keys())->whereNotNull('testimonial_id')->get()
            ->each(function (DriveImport $row) use ($times) {
                $t = Testimonial::find($row->testimonial_id);
                if ($t && ! $t->created_at?->equalTo($times[$row->file_id])) {
                    $t->timestamps = false;
                    $t->forceFill(['created_at' => $times[$row->file_id]])->save();
                }
            });
    }

    private static function uploadedAt(array $file): ?Carbon
    {
        try {
            return ! empty($file['createdTime']) ? Carbon::parse($file['createdTime'])->utc() : null;
        } catch (\Throwable) {
            return null;
        }
    }

    /** "Lakshmi - Hyderabad.mp4" → ["Lakshmi", "Hyderabad"]; "VID_2026.mp4" → ["VID 2026", null]. */
    public static function nameAndPlace(string $fileName): array
    {
        $base = trim(preg_replace('/\.[a-z0-9]{2,5}$/i', '', $fileName));
        $parts = preg_split('/\s+[-–—|]\s+|\s*,\s*/u', $base, 2);
        $name = trim(str_replace('_', ' ', $parts[0] ?? '')) ?: 'New story';

        return [Str::limit($name, 120, ''), isset($parts[1]) && trim($parts[1]) !== '' ? Str::limit(trim(str_replace('_', ' ', $parts[1])), 120, '') : null];
    }

    /** Videos in the folder, oldest first (so they keep the order they were added in). */
    private static function listVideos(): array
    {
        $files = [];
        $token = null;
        do {
            $res = Http::timeout(30)->get(self::API, array_filter([
                'q' => "'".config('services.google_drive.testimonials_folder')."' in parents and mimeType contains 'video/' and trashed = false",
                'fields' => 'nextPageToken, files(id, name, size, mimeType, createdTime)',
                'orderBy' => 'createdTime',
                'pageSize' => 100,
                'pageToken' => $token,
                'key' => config('services.google_drive.api_key'),
                'supportsAllDrives' => 'true',
                'includeItemsFromAllDrives' => 'true',
            ]));
            if (! $res->successful()) {
                throw new RuntimeException(self::why($res->status(), $res->json('error.message')));
            }
            array_push($files, ...($res->json('files') ?? []));
            $token = $res->json('nextPageToken');
        } while ($token);

        return $files;
    }

    /** Download one video to the uploads disk; returns its public URL. */
    private static function copy(array $file): string
    {
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION)) ?: 'mp4';
        $ext = in_array($ext, ['mp4', 'm4v', 'mov', 'webm'], true) ? $ext : 'mp4';
        $tmp = tempnam(sys_get_temp_dir(), 'drive');
        try {
            $res = Http::timeout(600)->withOptions(['sink' => $tmp])
                ->get(self::API.'/'.$file['id'], ['alt' => 'media', 'key' => config('services.google_drive.api_key'), 'supportsAllDrives' => 'true']);
            if (! $res->successful()) {
                throw new RuntimeException("Could not download {$file['name']}: ".self::why($res->status(), null));
            }
            $disk = config('filesystems.uploads_disk', 'public');
            $path = 'testimonials/videos/'.Str::uuid().'.'.$ext;
            $stream = fopen($tmp, 'r');
            Storage::disk($disk)->put($path, $stream);
            is_resource($stream) && fclose($stream);

            return Storage::disk($disk)->url($path);
        } finally {
            @unlink($tmp);
        }
    }

    private static function why(int $status, ?string $message): string
    {
        return match (true) {
            $status === 400 && str_contains((string) $message, 'API key') => 'Google says the API key is not valid. Check GOOGLE_DRIVE_API_KEY.',
            $status === 403 => 'Google refused (403). Make sure the Google Drive API is enabled for the key\'s project and the key is allowed to use it.',
            $status === 404 => 'Folder or file not found. Share the folder as "Anyone with the link → Viewer" and check GOOGLE_DRIVE_TESTIMONIALS_FOLDER.',
            default => "Google Drive answered HTTP {$status}".($message ? ": {$message}" : '.'),
        };
    }
}
