<?php

namespace App\Http\Controllers\Api\Admin\Support;

use App\Http\Controllers\Controller;
use App\Models\Support\SupportAgent;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** Admin → People → Support team: who may sign in to the support desk. */
class SupportAgentController extends Controller
{
    public function index()
    {
        return response()->json(SupportAgent::orderBy('kind')->orderBy('name')->get()->map(fn (SupportAgent $a) => [
            'id' => $a->id,
            'kind' => $a->kind,
            'name' => $a->name,
            'phone' => $a->phone,
            'email' => $a->email,
            'is_active' => $a->is_active,
            'is_grievance_chief' => (bool) $a->is_grievance_chief,
            'has_pin' => $a->pin_hash !== null,
            'last_login_at' => $a->last_login_at,
        ]));
    }

    public function store(Request $request)
    {
        $agent = new SupportAgent;
        $this->fill($agent, $request, true);

        return response()->json(['id' => $agent->id], 201);
    }

    public function update(Request $request, SupportAgent $agent)
    {
        $this->fill($agent, $request, false);

        return response()->json(['id' => $agent->id]);
    }

    public function destroy(Request $request, SupportAgent $agent)
    {
        abort_if($agent->is_grievance_chief && ! $this->isSuperAdmin($request), 403, 'Only a super admin can remove the grievance chief.');
        $agent->tokens()->delete();
        $agent->delete();

        return response()->json(['ok' => true]);
    }

    private function fill(SupportAgent $agent, Request $request, bool $creating): void
    {
        // Normalise only what was sent, so a partial update (e.g. just is_active) keeps phone/email.
        if ($creating || $request->has('phone')) {
            $request->merge(['phone' => SupportAgent::normalizePhone($request->input('phone'))]);
        }
        if ($creating || $request->has('email')) {
            $request->merge(['email' => $request->filled('email') ? strtolower(trim($request->input('email'))) : null]);
        }
        $kind = $request->input('kind', $agent->kind ?? 'volunteer');

        $data = $request->validate([
            'kind' => [$creating ? 'required' : 'sometimes', Rule::in(SupportAgent::KINDS)],
            'name' => [$creating ? 'required' : 'sometimes', 'string', 'max:120'],
            'phone' => [$kind === 'core' && $creating ? 'required' : 'nullable', 'string', 'max:20', Rule::unique('support_agents', 'phone')->ignore($agent->id)],
            'email' => [$kind === 'volunteer' && $creating ? 'required' : 'nullable', 'email', 'max:190', Rule::unique('support_agents', 'email')->ignore($agent->id)],
            'pin' => [$kind === 'core' && $creating ? 'required' : 'nullable', 'digits_between:4,8'],
            'is_active' => ['sometimes', 'boolean'],
            'is_grievance_chief' => ['sometimes', 'boolean'],
        ]);

        // The chief reads every grievance. Only a super admin may choose the chief, or change the chief's
        // sign-in (phone, PIN, email, role): otherwise an admin could reset the chief's PIN and sign in as them.
        $super = $this->isSuperAdmin($request);
        if (array_key_exists('is_grievance_chief', $data) && (bool) $data['is_grievance_chief'] !== (bool) $agent->is_grievance_chief) {
            abort_unless($super, 403, 'Only a super admin can choose the grievance chief.');
        }
        $signInChange = $agent->exists && $agent->is_grievance_chief && (
            ! empty($data['pin'])
            || (array_key_exists('phone', $data) && $data['phone'] !== $agent->phone)
            || (array_key_exists('email', $data) && $data['email'] !== $agent->email)
            || (isset($data['kind']) && $data['kind'] !== $agent->kind)
        );
        abort_if($signInChange && ! $super, 403, "Only a super admin can change the grievance chief's sign-in details.");

        $agent->fill(collect($data)->except('pin')->all());
        if (! empty($data['pin'])) {
            $agent->setPin($data['pin']);
            $agent->tokens()->delete(); // new PIN signs out old sessions
        }
        if (array_key_exists('is_active', $data) && ! $data['is_active'] && $agent->exists) {
            $agent->tokens()->delete();
        }
        $agent->save();

        if ($signInChange) {
            \App\Services\Support\GrievanceChiefChange::signInChanged($agent);
        }

        // One grievance chief at a time: naming a new one removes the old one. Logged and both are emailed.
        if (array_key_exists('is_grievance_chief', $data) && $agent->wasChanged('is_grievance_chief')) {
            $previous = $data['is_grievance_chief']
                ? SupportAgent::where('is_grievance_chief', true)->whereKeyNot($agent->id)->get()
                : collect();
            SupportAgent::whereIn('id', $previous->pluck('id'))->update(['is_grievance_chief' => false]);
            \App\Services\Support\GrievanceChiefChange::record($agent, (bool) $data['is_grievance_chief'], $previous);
        }
    }

    private function isSuperAdmin(Request $request): bool
    {
        $user = $request->user();

        return $user instanceof \App\Models\Auth\User && $user->isSuperAdmin();
    }
}
