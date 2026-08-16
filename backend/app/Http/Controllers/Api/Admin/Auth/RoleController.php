<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RoleRequest;
use App\Models\Role;

class RoleController extends Controller
{
    public function index()
    {
        return response()->json(
            Role::with('permissions:id,name,group')->withCount('users')->get(),
        );
    }

    public function store(RoleRequest $request)
    {
        $role = Role::create([
            ...$request->safe()->except('permissions'),
            'is_system' => false,
        ]);

        $role->permissions()->sync($request->validated('permissions', []));

        return response()->json($role->load('permissions'), 201);
    }

    public function update(RoleRequest $request, Role $role)
    {
        abort_if($role->is_system, 422, 'Built-in roles cannot be renamed — edit their permissions instead.');

        $role->update($request->safe()->except('permissions'));
        $role->permissions()->sync($request->validated('permissions', []));

        return response()->json($role->load('permissions'));
    }

    public function destroy(Role $role)
    {
        abort_if($role->is_system, 422, 'Built-in roles cannot be deleted.');

        $role->delete();

        return response()->json(null, 204);
    }
}
