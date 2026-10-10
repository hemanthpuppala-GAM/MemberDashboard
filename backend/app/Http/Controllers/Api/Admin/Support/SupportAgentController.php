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

    public function destroy(SupportAgent $agent)
    {
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
        ]);

        $agent->fill(collect($data)->except('pin')->all());
        if (! empty($data['pin'])) {
            $agent->setPin($data['pin']);
            $agent->tokens()->delete(); // new PIN signs out old sessions
        }
        if (array_key_exists('is_active', $data) && ! $data['is_active'] && $agent->exists) {
            $agent->tokens()->delete();
        }
        $agent->save();
    }
}
