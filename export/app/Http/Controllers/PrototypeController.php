<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Symfony\Component\HttpFoundation\Response;

class PrototypeController extends Controller
{
    /**
     * How long a browser stays signed in, in minutes: 30 days.
     */
    private const REMEMBER = 60 * 24 * 30;

    /**
     * A version of the prototype, the default one when none is named, or the sign-in page when a password is set
     * and this browser hasn't signed in with it. Each version is a folder in prototype/, outside public/.
     */
    public function show(Request $request, ?string $version = null): Response
    {
        $versions = $this->versions();
        $current = $version === null ? $this->defaultVersion($versions) : ($versions[$version] ?? null);

        abort_unless($current, 404);

        $viewer = $this->viewer($request);

        if ($this->password() !== '' && ! $viewer) {
            return response()->view('prototype.sign-in', ['version' => $version]);
        }

        // Tell the page who is viewing and which versions there are, for its top bar now and for feedback later.
        $json = fn ($value) => json_encode($value, JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $script = '<script>window.PROTOTYPE_VIEWER = '.$json($viewer).'; window.PROTOTYPE_VERSIONS = '.$json(array_values($versions)).';</script>';
        $html = preg_replace('/<head>/', '<head>'.$script, file_get_contents(base_path("prototype/{$current['id']}/index.html")), 1);

        return response($html, 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Cache-Control' => 'no-cache, private',
        ]);
    }

    public function signIn(Request $request): RedirectResponse
    {
        $version = $request->input('version');
        $back = is_string($version) && isset($this->versions()[$version]) ? "/prototype/{$version}" : '/prototype';
        $password = $this->password();

        if ($password === '') {
            return redirect($back);
        }

        $input = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'password' => ['required', 'string'],
        ], [
            'name.required' => 'Enter your name.',
            'password.required' => 'Enter the password.',
        ]);

        if (! hash_equals($password, $input['password'])) {
            return redirect($back)
                ->withErrors(['password' => 'That password isn’t right.'])
                ->withInput($request->only('name'));
        }

        return redirect($back)->withCookie(cookie('prototype', json_encode([
            'name' => trim($input['name']),
            'key' => $this->key($password),
        ]), self::REMEMBER));
    }

    public function signOut(): RedirectResponse
    {
        return redirect('/prototype')->withCookie(Cookie::forget('prototype'));
    }

    /**
     * Every built version, keyed by its folder name and in natural order: 1, 2, 10, then A, B.
     */
    private function versions(): array
    {
        $versions = [];

        foreach (glob(base_path('prototype/*/index.html')) as $page) {
            $folder = dirname($page);
            $id = basename($folder);
            $about = is_file("{$folder}/version.json") ? (json_decode(file_get_contents("{$folder}/version.json"), true) ?: []) : [];

            $versions[$id] = [
                'id' => (string) $id,
                'label' => $about['label'] ?? "Version {$id}",
                'date' => $about['date'] ?? null,
                'notes' => array_values((array) ($about['notes'] ?? [])),
                'default' => (bool) ($about['default'] ?? false),
                'url' => "/prototype/{$id}",
            ];
        }

        uksort($versions, 'strnatcasecmp');

        return $versions;
    }

    /**
     * The version marked "default" in its version.json, or else the last.
     */
    private function defaultVersion(array $versions): ?array
    {
        foreach ($versions as $version) {
            if ($version['default']) {
                return $version;
            }
        }

        return $versions === [] ? null : end($versions);
    }

    /**
     * The name this browser signed in with, while the password it signed in with is still the current one.
     */
    private function viewer(Request $request): ?array
    {
        $cookie = json_decode((string) $request->cookie('prototype'), true);
        $password = $this->password();

        if (! is_array($cookie) || ! is_string($cookie['name'] ?? null) || $cookie['name'] === '') {
            return null;
        }

        if ($password !== '' && ! hash_equals($this->key($password), (string) ($cookie['key'] ?? ''))) {
            return null;
        }

        return ['name' => $cookie['name']];
    }

    private function password(): string
    {
        return (string) config('prototype.password');
    }

    /**
     * Stands in for the password in the cookie, so a new password signs everyone out.
     */
    private function key(string $password): string
    {
        return hash_hmac('sha256', $password, (string) config('app.key'));
    }
}
