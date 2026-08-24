<?php

namespace App\Http\Controllers\Api\Admin\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Auth\RoleRequest;
use App\Models\Auth\Role;

class RoleController extends Controller
{
    public function index()
    {
        return response()->json(
            Role::with('permissions:id,name,group')->withCount('users')->get(),
        );
    }

    public function show(Role $role)
    {
        return response()->json($role->load('permissions:id,name,group')->loadCount('users'));
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
        // Super Admin bypasses permission checks entirely (see User::hasPermission),
        // so its permission list is cosmetic — editing it would look like it does
        // something without actually restricting access. Block it outright.
        abort_if($role->name === Role::SUPER_ADMIN, 422, 'Super Admin always has every permission — nothing to edit.');

        // Other built-in roles keep their name/display_name/description, but their
        // permission set is still editable — that's how an admin narrows or
        // widens what e.g. "Content Manager" can do without renaming it.
        if (! $role->is_system) {
            $role->update($request->safe()->except('permissions'));
        }

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
