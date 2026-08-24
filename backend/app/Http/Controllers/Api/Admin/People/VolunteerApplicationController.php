<?php

namespace App\Http\Controllers\Api\Admin\People;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\People\VolunteerApplicationUpdateRequest;
use App\Models\People\VolunteerApplication;
use Illuminate\Http\Request;

class VolunteerApplicationController extends Controller
{
    public function index(Request $request)
    {
        $query = VolunteerApplication::query()
            ->select(['id', 'name', 'email', 'phone', 'category_id', 'notes', 'status', 'created_at'])
            ->with('category')
            ->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }
        if ($search = $request->query('search')) {
            $query->where(fn ($q) => $q->where('name', 'like', "{$search}%")->orWhere('email', 'like', "{$search}%"));
        }

        return response()->json($query->paginate((int) $request->query('per_page', 20)));
    }

    public function show(VolunteerApplication $volunteerApplication)
    {
        return response()->json($volunteerApplication->load('category'));
    }

    public function update(VolunteerApplicationUpdateRequest $request, VolunteerApplication $volunteerApplication)
    {
        $volunteerApplication->update($request->validated());

        return response()->json($volunteerApplication->fresh()->load('category'));
    }

    public function destroy(VolunteerApplication $volunteerApplication)
    {
        $volunteerApplication->delete();

        return response()->json(null, 204);
    }
}
