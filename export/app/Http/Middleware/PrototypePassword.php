<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PrototypePassword
{
    /**
     * Hide the prototype unless it is enabled, then ask for the password,
     * when one is set, with the browser's own sign-in box. Any username works.
     */
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless(config('prototype.enabled'), 404);

        $password = (string) config('prototype.password');

        if ($password !== '' && ! hash_equals($password, (string) $request->getPassword())) {
            return response('Enter the prototype password to continue.', 401, [
                'WWW-Authenticate' => 'Basic realm="Prototype", charset="UTF-8"',
                'X-Robots-Tag' => 'noindex, nofollow',
            ]);
        }

        return $next($request);
    }
}
