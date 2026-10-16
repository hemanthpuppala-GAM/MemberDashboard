<?php

namespace App\Http\Controllers\Api\Admin\Content;

use App\Http\Controllers\Controller;
use App\Models\Content\DailyQuote;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/** CMS → Quote of the day: upload the daily musings posters (one or a week's worth at once). */
class DailyQuoteController extends Controller
{
    public function index()
    {
        abort_unless(DailyQuote::ready(), 503, 'Run php artisan migrate on the server to switch on Quote of the day.');

        return response()->json([
            'today' => DailyQuote::today(),
            'current_id' => DailyQuote::showing()->value('id'),
            'quotes' => DailyQuote::orderByDesc('show_on')->orderByDesc('id')->limit(120)->get(),
        ]);
    }

    /**
     * Upload one or more posters. Several files are scheduled one per day from `start_on`
     * (in the order picked), so a week can be uploaded on Sunday.
     */
    public function store(Request $request)
    {
        abort_unless(DailyQuote::ready(), 503, 'Run php artisan migrate on the server to switch on Quote of the day.');
        $data = $request->validate([
            'images' => ['required', 'array', 'min:1', 'max:31'],
            'images.*' => ['file', 'image', 'max:10240'],
            'start_on' => ['nullable', 'date'],
            'title' => ['nullable', 'string', 'max:200'],
            'text' => ['nullable', 'string', 'max:5000'],
            'author' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', 'in:published,draft'],
        ]);
        $day = Carbon::parse($data['start_on'] ?? DailyQuote::today());
        $single = count($data['images']) === 1;

        $created = collect($data['images'])->map(function (UploadedFile $file, int $i) use ($data, $day, $single, $request) {
            return DailyQuote::create([
                'image_path' => $this->storeImage($file),
                'title' => $single ? ($data['title'] ?? null) : null,
                'text' => $single ? ($data['text'] ?? null) : null,
                'author' => $data['author'] ?? null,
                'show_on' => $day->copy()->addDays($i)->toDateString(),
                'status' => $data['status'] ?? 'published',
                'created_by' => $request->user()->id,
            ]);
        });

        return response()->json($created->values(), 201);
    }

    public function update(Request $request, DailyQuote $dailyQuote)
    {
        $dailyQuote->update($request->validate([
            'title' => ['nullable', 'string', 'max:200'],
            'text' => ['nullable', 'string', 'max:5000'],
            'author' => ['nullable', 'string', 'max:120'],
            'show_on' => ['sometimes', 'date'],
            'status' => ['sometimes', 'in:published,draft'],
        ]));

        return response()->json($dailyQuote->fresh());
    }

    public function destroy(DailyQuote $dailyQuote)
    {
        $dailyQuote->delete();

        return response()->json(null, 204);
    }

    /** Posters are often 1–3 MB phone exports; keep ≤1600px tall/wide JPEG/PNG so Home loads fast. */
    private function storeImage(UploadedFile $file): string
    {
        $disk = config('filesystems.uploads_disk', 'public');
        $name = 'quotes/'.now(DailyQuote::TZ)->format('Y-m').'/'.Str::uuid();
        $bytes = (string) file_get_contents($file->getRealPath());

        if (function_exists('imagecreatefromstring') && ($img = @imagecreatefromstring($bytes)) !== false) {
            $w = imagesx($img);
            $h = imagesy($img);
            if (max($w, $h) > 1600) {
                $s = 1600 / max($w, $h);
                $img = imagescale($img, (int) round($w * $s), (int) round($h * $s));
                ob_start();
                imagejpeg($img, null, 86);
                Storage::disk($disk)->put($name.'.jpg', (string) ob_get_clean());

                return $name.'.jpg';
            }
        }
        $ext = strtolower($file->getClientOriginalExtension() ?: 'jpg');
        Storage::disk($disk)->put("$name.$ext", $bytes);

        return "$name.$ext";
    }
}
