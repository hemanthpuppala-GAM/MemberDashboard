<?php

namespace App\Http\Controllers\Api\Admin\Engage;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Engage\QrCodeGenerateRequest;
use App\Models\Engage\QrCode as QrCodeModel;
use App\Services\Engage\QrPayloadBuilder;
use Endroid\QrCode\Color\Color;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\Logo\Logo;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class QrCodeController extends Controller
{
    private const ERROR_LEVELS = [
        'L' => ErrorCorrectionLevel::Low,
        'M' => ErrorCorrectionLevel::Medium,
        'Q' => ErrorCorrectionLevel::Quartile,
        'H' => ErrorCorrectionLevel::High,
    ];

    public function index()
    {
        return response()->json(QrCodeModel::latest()->get());
    }

    public function generate(QrCodeGenerateRequest $request)
    {
        $options = $request->validated('options', []);
        $payload = QrPayloadBuilder::build($request->validated('type'), $request->validated('input_data'));
        $size = $options['size'] ?? 300;

        $qrCode = new QrCode(
            data: $payload,
            errorCorrectionLevel: self::ERROR_LEVELS[$options['errorCorrection'] ?? 'M'],
            size: $size,
            foregroundColor: $this->hexToColor($options['fg'] ?? '#111827'),
            backgroundColor: $this->hexToColor($options['bg'] ?? '#FFFFFF'),
        );

        $logo = ! empty($options['logo'])
            ? new Logo(path: $this->resolveLogoPath($options['logo']), resizeToWidth: intdiv($size, 5), punchoutBackground: true)
            : null;

        $result = (new PngWriter)->write($qrCode, $logo);

        $disk = config('filesystems.uploads_disk', 'public');
        $path = 'qr-codes/'.Str::uuid().'.png';
        Storage::disk($disk)->put($path, $result->getString());

        $record = QrCodeModel::create([
            'title' => $request->validated('title'),
            'type' => $request->validated('type'),
            'input_data' => $request->validated('input_data'),
            'options' => $options,
            'file_path' => $path,
            'created_by' => $request->user()->id,
        ]);

        return response()->json($record, 201);
    }

    public function destroy(QrCodeModel $qrCode)
    {
        if ($qrCode->file_path) {
            Storage::disk(config('filesystems.uploads_disk', 'public'))->delete($qrCode->file_path);
        }
        $qrCode->delete();

        return response()->json(null, 204);
    }

    public function download(QrCodeModel $qrCode): StreamedResponse
    {
        $disk = config('filesystems.uploads_disk', 'public');
        abort_unless($qrCode->file_path && Storage::disk($disk)->exists($qrCode->file_path), 404);

        $qrCode->increment('download_count');

        return Storage::disk($disk)->download($qrCode->file_path, Str::slug($qrCode->title).'.png');
    }

    /**
     * A logo picked from the Media Library arrives as a full URL back to this
     * same app (e.g. http://localhost:8000/storage/media/xxx.png). Fetching
     * that over HTTP from within the request that's generating the QR code
     * would deadlock a single-worker PHP server (it can't answer its own
     * outbound request while busy handling this one) — so for our own
     * storage URLs, read the file straight off disk instead. Only a
     * genuinely external URL falls through to endroid's own URL fetching.
     */
    private function resolveLogoPath(string $url): string
    {
        $marker = '/storage/';
        $pos = strpos($url, $marker);
        if ($pos === false) {
            return $url;
        }

        $disk = config('filesystems.uploads_disk', 'public');
        $relative = substr($url, $pos + strlen($marker));
        $absolute = Storage::disk($disk)->path($relative);

        return is_file($absolute) ? $absolute : $url;
    }

    private function hexToColor(string $hex): Color
    {
        $hex = ltrim($hex, '#');
        [$r, $g, $b] = array_map(fn ($c) => hexdec(str_pad($c, 2, $c)), str_split($hex, strlen($hex) === 3 ? 1 : 2));

        return new Color($r, $g, $b);
    }
}
