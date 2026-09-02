<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/** Persists each admin's own choice of which dashboard stat widgets to show, and in what order. */
class DashboardLayoutController extends Controller
{
    public function show(Request $request)
    {
        return response()->json(['widgets' => $request->user()->dashboard_layout]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'widgets' => ['required', 'array', 'max:30'],
            'widgets.*' => ['string', 'in:' . implode(',', array_keys(DashboardController::WIDGET_PERMISSIONS))],
        ]);

        $request->user()->update(['dashboard_layout' => $data['widgets']]);

        return response()->json(['widgets' => $request->user()->dashboard_layout]);
    }
}
