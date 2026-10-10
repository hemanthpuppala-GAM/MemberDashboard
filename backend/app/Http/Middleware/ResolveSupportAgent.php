<?php

namespace App\Http\Middleware;

use App\Models\Auth\User;
use App\Models\People\Member;
use App\Models\Support\SupportAgent;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Support desk gate. Core support signs in with phone + PIN (token belongs to a SupportAgent);
 * a volunteer signs in with their member Google account and is let in when that email is on
 * the support team as an active volunteer. Admin-panel staff who can see Queries (members.view)
 * work the desk with their admin sign-in. The resolved agent is put on the request.
 */
class ResolveSupportAgent
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $agent = null;

        if ($user instanceof SupportAgent) {
            $agent = ($user->is_active ?? true) ? $user : null;
        } elseif ($user instanceof Member && $user->email) {
            $agent = SupportAgent::where('kind', 'volunteer')
                ->where('is_active', true)
                ->where('email', strtolower($user->email))
                ->first();
        } elseif ($user instanceof User && $user->hasPermission('members.view')) {
            $agent = SupportAgent::forUser($user);
            $agent = ($agent->is_active ?? true) ? $agent : null;
        }

        abort_unless($agent, 403, 'This page is for the support team.');
        $request->attributes->set('support_agent', $agent);

        return $next($request);
    }
}
