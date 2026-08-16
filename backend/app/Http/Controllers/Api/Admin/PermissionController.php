<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;

class PermissionController extends Controller
{
    public function index()
    {
        return response()->json(
            Permission::orderBy('group')->orderBy('name')->get()->groupBy('group'),
        );
    }
}
