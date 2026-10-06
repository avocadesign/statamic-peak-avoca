<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PrototypeEnabled
{
    /**
     * The prototype is a 404 unless PROTOTYPE_ENABLED is on, and never indexed when it is.
     */
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless(config('prototype.enabled'), 404);

        $response = $next($request);
        $response->headers->set('X-Robots-Tag', 'noindex, nofollow');

        return $response;
    }
}
