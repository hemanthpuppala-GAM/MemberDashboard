<?php

namespace App\Http\Controllers\Api\Admin\People;

use App\Http\Controllers\Controller;
use App\Models\People\MembershipDrive;
use App\Services\People\DriveSignup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

/** Membership drives: add many members at once from a list of phone numbers. */
class MembershipDriveController extends Controller
{
    public function index()
    {
        return response()->json(
            MembershipDrive::withCount('members')->with('creator:id,name')->latest('held_on')->latest()->get()
        );
    }

    public function store(Request $request)
    {
        $drive = MembershipDrive::create([...$this->validated($request), 'created_by' => $request->user()->id]);

        return response()->json($drive->loadCount('members'), 201);
    }

    public function show(MembershipDrive $drive)
    {
        return response()->json([
            ...$drive->loadCount('members')->load('creator:id,name')->toArray(),
            'members' => $drive->members()->orderBy('member_num')
                ->get(['id', 'member_num', 'name', 'email', 'phone', 'status', 'oauth_provider', 'created_at'])
                ->map(fn ($m) => [
                    'id' => $m->id, 'member_code' => $m->member_code, 'name' => $m->name, 'email' => $m->email,
                    'phone' => $m->phone, 'status' => $m->status, 'signed_in' => (bool) $m->oauth_provider, 'created_at' => $m->created_at,
                ]),
        ]);
    }

    public function update(Request $request, MembershipDrive $drive)
    {
        $drive->update($this->validated($request));

        return response()->json($drive->loadCount('members'));
    }

    /** Members stay; they just lose the link to this drive. */
    public function destroy(MembershipDrive $drive)
    {
        $drive->delete();

        return response()->json(null, 204);
    }

    /** Paste phone numbers (one person per line). `preview: true` checks without adding anyone. */
    public function addMembers(Request $request, MembershipDrive $drive)
    {
        $data = $request->validate([
            'lines' => ['required', 'string', 'max:200000'],
            'preview' => ['sometimes', 'boolean'],
        ]);

        return response()->json(DriveSignup::run($drive, $data['lines'], (bool) ($data['preview'] ?? false)));
    }

    public function export(MembershipDrive $drive)
    {
        $csv = "Member ID,Name,Phone,Email,Signed in,Added\n";
        foreach ($drive->members()->orderBy('member_num')->get() as $m) {
            $csv .= implode(',', array_map(
                fn ($v) => '"'.str_replace('"', '""', (string) $v).'"',
                [$m->member_code, $m->name, $m->phone, $m->email, $m->oauth_provider ? 'yes' : 'no', $m->created_at?->toDateString()],
            ))."\n";
        }
        $file = 'drive-'.$drive->id.'-members.csv';

        return Response::make($csv, 200, ['Content-Type' => 'text/csv', 'Content-Disposition' => 'attachment; filename="'.$file.'"']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'place' => ['nullable', 'string', 'max:160'],
            'held_on' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ]);
    }
}
