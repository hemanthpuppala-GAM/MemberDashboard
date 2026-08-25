<?php

namespace App\Http\Middleware;

use App\Models\People\Member;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Gate for member-portal routes — rejects admin/practitioner tokens that happen to hit these endpoints. */
class EnsureUserIsMember
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($request->user() instanceof Member, 403, 'Member access required.');

        return $next($request);
    }
}
