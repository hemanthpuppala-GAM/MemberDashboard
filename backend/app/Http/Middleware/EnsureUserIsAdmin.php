<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Gate for routes that only need "authenticated staff member", not a specific permission (dashboard, /me, notifications). */
class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($request->user()?->roles->isNotEmpty(), 403, 'Admin access required.');

        return $next($request);
    }
}
