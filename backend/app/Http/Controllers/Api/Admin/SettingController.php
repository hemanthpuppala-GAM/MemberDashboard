<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SettingUpdateRequest;
use App\Models\Setting;

class SettingController extends Controller
{
    public function index()
    {
        $existing = Setting::pluck('value', 'key')->toArray();

        return response()->json(array_merge(Setting::DEFAULTS, $existing));
    }

    public function update(SettingUpdateRequest $request)
    {
        foreach ($request->validated('settings') as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return response()->json(Setting::pluck('value', 'key'));
    }
}
