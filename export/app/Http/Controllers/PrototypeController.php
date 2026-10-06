<?php

namespace App\Http\Controllers;

use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PrototypeController extends Controller
{
    /**
     * Serve the built prototype page, which lives outside public/.
     */
    public function __invoke(): BinaryFileResponse
    {
        $path = base_path('prototype/index.html');

        abort_unless(is_file($path), 404);

        return response()->file($path, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Cache-Control' => 'no-cache, private',
            'X-Robots-Tag' => 'noindex, nofollow',
        ]);
    }
}
