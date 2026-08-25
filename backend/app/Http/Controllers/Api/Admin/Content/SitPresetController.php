<?php

namespace App\Http\Controllers\Api\Admin\Content;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Content\SitPresetRequest;
use App\Models\Content\SitPreset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SitPresetController extends Controller
{
    public function index()
    {
        return response()->json(SitPreset::with('track')->orderBy('sort_order')->get());
    }

    public function store(SitPresetRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = $request->user()->id;
        $data['sort_order'] ??= SitPreset::count() + 1;

        $preset = SitPreset::create($data);

        return response()->json($preset->load('track'), 201);
    }

    public function update(SitPresetRequest $request, SitPreset $sitPreset)
    {
        $sitPreset->update($request->validated());

        return response()->json($sitPreset->fresh('track'));
    }

    public function destroy(SitPreset $sitPreset)
    {
        $sitPreset->delete();

        return response()->json(null, 204);
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'preset_ids' => ['required', 'array'],
            'preset_ids.*' => ['integer', 'exists:sit_presets,id'],
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->input('preset_ids') as $index => $id) {
                SitPreset::where('id', $id)->update(['sort_order' => $index + 1]);
            }
        });

        return response()->json(SitPreset::with('track')->orderBy('sort_order')->get());
    }
}
