# Prototype

The discovery prototype for the site: every page in a desktop and a mobile frame, drawn with the site's own Tailwind tokens, with page notes, user journeys, the sitemap, the content model and the decisions still to make. It shows what goes on each page and how people move through the site, not the final look.

The kit ships an empty shell: Home and Contact, the Pages collection and the contact form. Fill it in for the site, then share it with the client.

## Filling it in

Edit `src/`, then build:

```bash
./build.sh
```

| File | What it holds |
| --- | --- |
| `src/05-data.js` | Everything said about the site: the project's name, who decides, decisions, audiences, page notes, journeys, the content model and the sitemap. Each structure is described in a comment above it. |
| `src/06-render.js` | The pages. Each is a function in `PAGES` that returns the site's markup, and `ROUTES` gives it a URL. `NAV` and `FOOTER_NAV` are the menus. Helpers for page headers, images, buttons, decision markers and glossary words are at the top. |
| `src/07-shell.js` | The interface around the frames. It reads the two files above and never names a page itself, so leave it as it is. |
| `src/01-head.html`, `src/02-body.html` | The interface's styles and markup. |
| `src/03-frame.css`, `src/04-frame.js` | The site's tokens and the placeholder classes inside the frames, and their behaviour: menus, filters and search, glossary tooltips, a horizontal timeline and scroll sync. |

Write for the client: they read the page notes, decisions and journeys. Name things as they see them, never by handle, and say "the plan" rather than naming internal tools. Placeholder copy goes in [square brackets], which the frames shade so it reads as a placeholder.

A decision's id, such as `D3`, is how people refer to it once shared: never renumber one. Mark it on the pages it affects with `pin('D3')` beside the element, and list it in that page's notes.

## The agency

The "Prepared by" corner and the footer credit show the agency in `AGENCY` in `.env`, with its name, link and logos from `public/agencies/<agency>`. Change `AGENCY`, then build again.

## Sharing it from the site

The app serves `index.html` at `/prototype`, controlled by two settings in `.env`:

```
PROTOTYPE_ENABLED=true
PROTOTYPE_PASSWORD=
```

- `PROTOTYPE_ENABLED` off, the default, makes `/prototype` a 404. The files stay in git. Keep it off on the live site.
- With `PROTOTYPE_PASSWORD` set, the browser asks for it with its own sign-in box, and any username works. Always set one on a public server such as staging.
- After changing either on a server with cached config, run `php artisan config:cache`.

The route is in `routes/web.php`, the check in `app/Http/Middleware/PrototypePassword.php`, and the tests in `tests/Feature/PrototypeTest.php`.

`artifact.html` is the same page without the document wrapper, for publishing as a claude.ai Artifact instead.

Nothing in this folder is part of the site build: Tailwind doesn't scan it and the static generator doesn't copy it. The page loads Tailwind's browser build from jsDelivr, so it needs a connection.
