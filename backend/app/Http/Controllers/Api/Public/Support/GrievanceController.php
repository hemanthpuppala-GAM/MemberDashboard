<?php

namespace App\Http\Controllers\Api\Public\Support;

use App\Http\Controllers\Controller;
use App\Models\People\Member;
use App\Models\Support\Grievance;
use App\Services\Support\GrievanceDesk;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** /grievance form: anyone (signed in or not) sends a grievance that only the grievance chief can read. */
class GrievanceController extends Controller
{
    public function options()
    {
        return response()->json(['about' => Grievance::ABOUT]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'about' => ['required', Rule::in(Grievance::ABOUT)],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
            'name' => ['nullable', 'string', 'max:120'],
            'email' => ['nullable', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:30'],
            'website' => ['nullable', 'max:0'], // honeypot: people leave it empty
        ]);

        $member = auth('sanctum')->user();
        $ticket = GrievanceDesk::file($data, $member instanceof Member ? $member : null);

        return response()->json(['ref' => $ticket->ref], 201);
    }
}
