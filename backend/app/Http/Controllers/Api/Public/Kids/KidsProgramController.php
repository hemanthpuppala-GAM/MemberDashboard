<?php

namespace App\Http\Controllers\Api\Public\Kids;

use App\Http\Controllers\Controller;
use App\Services\Kids\KidsProgram;

/** Public facts for /kids and the register form. Never includes Zoom details. */
class KidsProgramController extends Controller
{
    public function show()
    {
        return response()->json(KidsProgram::info());
    }
}
