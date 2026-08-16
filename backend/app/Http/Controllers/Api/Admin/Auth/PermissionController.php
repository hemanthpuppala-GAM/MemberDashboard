<?php

namespace App\Http\Controllers\Api\Admin\Auth;

use App\Http\Controllers\Controller;
use App\Models\Auth\Permission;

class PermissionController extends Controller
{
    public function index()
    {
        return response()->json(
            Permission::orderBy('group')->orderBy('name')->get()->groupBy('group'),
        );
    }
}
