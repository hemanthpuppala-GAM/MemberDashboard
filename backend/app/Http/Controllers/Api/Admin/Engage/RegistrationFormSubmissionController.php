<?php

namespace App\Http\Controllers\Api\Admin\Engage;

use App\Http\Controllers\Controller;
use App\Models\Engage\RegistrationForm;
use App\Models\Engage\RegistrationFormSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Validation\Rule;

class RegistrationFormSubmissionController extends Controller
{
    public function index(Request $request, RegistrationForm $registrationForm)
    {
        $query = $registrationForm->submissions()->with('member:id,name,email,member_num')->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($search = $request->query('search')) {
            $query->where('data', 'like', "%{$search}%");
        }

        return response()->json($query->paginate((int) $request->query('per_page', 20)));
    }

    public function update(Request $request, RegistrationForm $registrationForm, RegistrationFormSubmission $submission)
    {
        abort_unless($submission->form_id === $registrationForm->id, 404);

        $request->validate(['status' => ['required', Rule::in(RegistrationFormSubmission::STATUSES)]]);

        $submission->update(['status' => $request->input('status')]);

        return response()->json($submission);
    }

    public function destroy(RegistrationForm $registrationForm, RegistrationFormSubmission $submission)
    {
        abort_unless($submission->form_id === $registrationForm->id, 404);

        $submission->delete();

        return response()->json(null, 204);
    }

    public function export(RegistrationForm $registrationForm)
    {
        $fields = $registrationForm->fields;
        $submissions = $registrationForm->submissions()->with('member')->oldest()->get();
        $withMember = $registrationForm->members_only || $submissions->contains(fn ($s) => $s->member_id);

        $escape = fn ($v) => '"'.str_replace('"', '""', (string) $v).'"';

        $head = [...($withMember ? ['Member ID', 'Member name', 'Member email'] : []), ...$fields->map(fn ($f) => $f->label), 'Status', 'Submitted at'];
        $csv = implode(',', array_map($escape, $head))."\n";
        foreach ($submissions as $submission) {
            $row = $fields->map(fn ($f) => $escape(is_array($v = $submission->data[$f->field_key] ?? '') ? implode('; ', $v) : $v));
            $who = $withMember ? array_map($escape, [$submission->member?->member_code, $submission->member?->name, $submission->member?->email]) : [];
            $csv .= implode(',', [...$who, ...$row, $escape($submission->status), $escape($submission->created_at)])."\n";
        }

        return Response::make($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="'.$registrationForm->slug.'-registrations.csv"',
        ]);
    }
}
