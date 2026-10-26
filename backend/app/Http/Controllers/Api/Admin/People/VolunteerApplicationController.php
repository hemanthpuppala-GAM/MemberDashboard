<?php

namespace App\Http\Controllers\Api\Admin\People;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\People\VolunteerApplicationUpdateRequest;
use App\Models\Content\VolunteerCategory;
use App\Models\People\VolunteerApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class VolunteerApplicationController extends Controller
{
    public function index(Request $request)
    {
        $query = VolunteerApplication::query()
            ->select(array_merge(
                ['id', 'name', 'email', 'phone', 'occupation', 'city', 'lang', 'category_id', 'teams', 'availability', 'member_num', 'notes', 'status', 'created_at'],
                \App\Services\People\MemberNumbers::ready() ? ['member_id'] : [],
            ))
            ->with('category')
            ->latest();

        $this->filter($query, $request);

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

    /** CSV of the applications the page is showing (same team / status / search filters), newest first. */
    public function export(Request $request)
    {
        $query = VolunteerApplication::query()->latest();
        $this->filter($query, $request);
        $teams = VolunteerCategory::pluck('name', 'slug');
        $categories = VolunteerCategory::pluck('name', 'id');

        // BOM so Excel reads Indian-language names as UTF-8.
        $csv = "\u{FEFF}Member ID,Name,Email,Mobile,Teams,Occupation,City,Language,Availability,Notes,Status,Submitted\n";
        foreach ($query->get() as $a) {
            $names = collect((array) $a->teams)->map(fn ($slug) => $teams[$slug] ?? $slug)->implode(', ') ?: ($categories[$a->category_id] ?? '');
            $csv .= implode(',', array_map(
                fn ($v) => self::cell($v),
                [$a->member_code, $a->name, $a->email, $a->phone, $names, $a->occupation, $a->city, $a->lang, $a->availability, $a->notes, $a->status, $a->created_at?->toDateString()],
            ))."\n";
        }

        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="volunteer-applications-'.now()->toDateString().'.csv"',
        ]);
    }

    /** Quoted CSV cell; text a spreadsheet would run as a formula (=, @, +/- not followed by a digit) is made plain text. */
    private static function cell($value): string
    {
        $v = (string) $value;
        if (preg_match('/^(=|@|[+-](?![\d\s(]))/', $v)) {
            $v = "'".$v;
        }

        return '"'.str_replace('"', '""', $v).'"';
    }

    private function filter($query, Request $request): void
    {
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($categoryId = $request->query('category_id')) {
            // Match applications that picked this team anywhere in their list.
            $slug = VolunteerCategory::whereKey($categoryId)->value('slug');
            $query->where(fn ($q) => $q->where('category_id', $categoryId)
                ->when($slug, fn ($q) => $q->orWhereJsonContains('teams', $slug)));
        }
        if ($search = $request->query('search')) {
            $num = \App\Services\People\MemberNumbers::parse($search);
            $query->where(fn ($q) => $q->where('name', 'like', "{$search}%")->orWhere('email', 'like', "{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")->when($num, fn ($q) => $q->orWhere('member_num', $num)));
        }
    }
}
