@php
    $agency = config('agency.handle');
    $logo = $agency && is_file(public_path("agencies/{$agency}/logo.svg")) ? "/agencies/{$agency}/logo.svg" : null;
    $about = $agency && is_file(public_path("agencies/{$agency}/agency.json")) ? json_decode(file_get_contents(public_path("agencies/{$agency}/agency.json")), true) : null;
@endphp
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>Sign in · {{ config('app.name') }} prototype</title>
    <script>
        // The light or dark choice made in the prototype; with none saved, the computer's setting decides.
        try { const t = localStorage.getItem('prototype-theme'); if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t; } catch (e) {}
    </script>
    <style>
        :root { --bg: #f4f4f3; --surface: #fff; --ink: #1d1d1f; --ink-2: #47474b; --muted: #6f6f75; --line: #cfcfcb; --error: #b23a2a; --focus: #0997be; color-scheme: light; }
        @media (prefers-color-scheme: dark) {
            :root:not([data-theme="light"]) { --bg: #121213; --surface: #1b1b1d; --ink: #f2f2f3; --ink-2: #c8c8cc; --muted: #9b9ba2; --line: #3e3e43; --error: #f08b78; --focus: #41c7f5; color-scheme: dark; }
        }
        :root[data-theme="dark"] { --bg: #121213; --surface: #1b1b1d; --ink: #f2f2f3; --ink-2: #c8c8cc; --muted: #9b9ba2; --line: #3e3e43; --error: #f08b78; --focus: #41c7f5; color-scheme: dark; }
        * { box-sizing: border-box; }
        body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px 16px; background: var(--bg); color: var(--ink); font: 15px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
        main { width: 100%; max-width: 380px; display: flex; flex-direction: column; gap: 20px; }
        .card { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 28px 24px; display: flex; flex-direction: column; gap: 18px; }
        h1 { margin: 0; font-size: 22px; line-height: 1.25; }
        .site { margin: 0 0 4px; font-size: 13px; color: var(--muted); }
        p { margin: 0; color: var(--ink-2); }
        form { display: flex; flex-direction: column; gap: 14px; }
        label { display: flex; flex-direction: column; gap: 6px; font-size: 14px; font-weight: 600; }
        input { font: inherit; color: inherit; background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 10px 12px; }
        input:focus-visible, button:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
        input[aria-invalid="true"] { border-color: var(--error); }
        .error { font-size: 13px; font-weight: 500; color: var(--error); }
        button { font: inherit; font-weight: 600; cursor: pointer; border: 0; border-radius: 8px; padding: 11px 14px; background: var(--ink); color: var(--bg); margin-top: 4px; }
        .note { font-size: 13px; color: var(--muted); }
        footer { display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 13px; color: var(--muted); }
        footer img { width: 36px; height: 36px; }
    </style>
</head>
<body>
    <main>
        <div class="card">
            <div>
                <p class="site">{{ config('app.name') }}</p>
                <h1>Website prototype</h1>
            </div>
            <p>Enter your name and the password you were given.</p>
            <form method="post" action="/prototype" novalidate>
                @csrf
                @if ($version)<input type="hidden" name="version" value="{{ $version }}">@endif
                <label>Your name
                    <input type="text" name="name" value="{{ old('name') }}" autocomplete="name" maxlength="80" required @error('name') aria-invalid="true" aria-describedby="name-error" @enderror autofocus>
                    @error('name')<span class="error" id="name-error">{{ $message }}</span>@enderror
                </label>
                <label>Password
                    <input type="password" name="password" autocomplete="current-password" required @error('password') aria-invalid="true" aria-describedby="password-error" @enderror>
                    @error('password')<span class="error" id="password-error">{{ $message }}</span>@enderror
                </label>
                <button type="submit">View the prototype</button>
            </form>
            <p class="note">This browser stays signed in for 30 days.</p>
        </div>
        @if ($about)
            <footer>
                @if ($logo)<img src="{{ $logo }}" alt="">@endif
                <span>Prepared by {{ $about['name'] }}</span>
            </footer>
        @endif
    </main>
</body>
</html>
