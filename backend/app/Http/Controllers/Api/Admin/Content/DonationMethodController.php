<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DonationMethodRequest;
use App\Models\DonationMethod;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DonationMethodController extends Controller
{
    public function index()
    {
        return response()->json(DonationMethod::orderBy('sort_order')->get());
    }

    public function store(DonationMethodRequest $request)
    {
        $data = $request->safe()->except('qr_image');
        $data['sort_order'] ??= DonationMethod::count() + 1;

        if ($request->hasFile('qr_image')) {
            $data['qr_image_path'] = $this->storeQr($request);
        }

        $method = DonationMethod::create($data);

        return response()->json($method, 201);
    }

    public function update(DonationMethodRequest $request, DonationMethod $donationMethod)
    {
        $data = $request->safe()->except('qr_image');

        if ($request->hasFile('qr_image')) {
            $data['qr_image_path'] = $this->storeQr($request);
        }

        $donationMethod->update($data);

        return response()->json($donationMethod->fresh());
    }

    public function destroy(DonationMethod $donationMethod)
    {
        $donationMethod->delete();

        return response()->json(null, 204);
    }

    private function storeQr($request): string
    {
        $disk = config('filesystems.uploads_disk', 'public');
        $file = $request->file('qr_image');
        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs('donations', $filename, $disk);

        return Storage::disk($disk)->url($path);
    }
}
