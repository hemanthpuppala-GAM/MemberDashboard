<?php

namespace App\Http\Controllers\Api\Admin\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Auth\UserRequest;
use App\Models\Auth\User;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(
            User::with('primaryRole:id,name,display_name')
                ->withCount('assignedMembers as members_assigned')
                ->orderBy('name')
                ->get(),
        );
    }

    public function store(UserRequest $request)
    {
        $generatedPassword = null;
        $password = $request->validated('password');

        if (! $password) {
            $generatedPassword = Str::password(14);
            $password = $generatedPassword;
        }

        $user = User::create([
            ...$request->safe()->except(['password', 'roles']),
            'password' => $password,
        ]);

        $user->roles()->sync(array_unique([...$request->validated('roles', []), $request->validated('primary_role_id')]));

        $payload = $user->load('primaryRole', 'roles')->toArray();
        if ($generatedPassword) {
            $payload['generated_password'] = $generatedPassword;
        }

        return response()->json($payload, 201);
    }

    public function update(UserRequest $request, User $user)
    {
        $data = $request->safe()->except(['password', 'roles']);

        if ($password = $request->validated('password')) {
            $data['password'] = $password;
        }

        $user->update($data);
        $user->roles()->sync(array_unique([...$request->validated('roles', []), $request->validated('primary_role_id')]));

        return response()->json($user->load('primaryRole', 'roles'));
    }

    public function destroy(User $user)
    {
        abort_if($user->isSuperAdmin() && User::whereHas('roles', fn ($q) => $q->where('name', 'super_admin'))->count() <= 1, 422, 'At least one super admin must remain.');

        $user->delete();

        return response()->json(null, 204);
    }
}
