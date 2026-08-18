<?php

namespace App\Http\Controllers\Api\Admin\Content;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Content\VolunteerCategoryRequest;
use App\Models\Content\VolunteerCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VolunteerCategoryController extends Controller
{
    public function index()
    {
        return response()->json(VolunteerCategory::orderBy('sort_order')->get());
    }

    public function store(VolunteerCategoryRequest $request)
    {
        $category = VolunteerCategory::create([
            ...$request->validated(),
            'sort_order' => $request->validated('sort_order') ?? VolunteerCategory::count() + 1,
        ]);

        return response()->json($category, 201);
    }

    public function update(VolunteerCategoryRequest $request, VolunteerCategory $volunteerCategory)
    {
        $volunteerCategory->update($request->validated());

        return response()->json($volunteerCategory->fresh());
    }

    public function destroy(VolunteerCategory $volunteerCategory)
    {
        $volunteerCategory->delete();

        return response()->json(null, 204);
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'category_ids' => ['required', 'array'],
            'category_ids.*' => ['integer', 'exists:volunteer_categories,id'],
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->input('category_ids') as $index => $id) {
                VolunteerCategory::where('id', $id)->update(['sort_order' => $index + 1]);
            }
        });

        return response()->json(VolunteerCategory::orderBy('sort_order')->get());
    }
}
