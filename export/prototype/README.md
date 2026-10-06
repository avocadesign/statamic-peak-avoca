# Prototype

The discovery prototype for the site: every page in a desktop and a mobile frame, drawn with the site's own Tailwind tokens, with page notes, user journeys, the sitemap, the content model and the decisions still to make. It shows what goes on each page and how people move through the site, not the final look.

The kit ships version 1 as an empty shell: Home and Contact, each saying the prototype is coming; Pages, the contact form, Site Details, the Main navigation and the Images and Files libraries in the content model; one decision, to approve the prototype; and no journeys yet. Fill it in for the site, then share it with the client.

## Filling it in

Each version is a folder, starting with `1/`. Edit its `src/`, then build:

```bash
./build.sh
```

The paths below are inside a version's folder. The font every version uses is in `assets/`.

| File | What it holds |
| --- | --- |
| `src/05-data.js` | Everything said about the site: the project's name, who decides, decisions, audiences, page notes, journeys, the content model and the sitemap. Each structure is described in a comment above it. |
| `src/06-render.js` | The pages. Each is a function in `PAGES` that returns the site's markup, and `ROUTES` gives it a URL. `NAV` and `FOOTER_NAV` are the menus. Helpers for page headers, images, buttons, decision markers and glossary words are at the top. |
| `src/07-shell.js` | The interface around the frames. It reads the two files above and never names a page itself, so leave it as it is. |
| `src/01-head.html`, `src/02-body.html` | The interface's styles and markup. |
| `src/03-frame.css`, `src/04-frame.js` | The site's tokens and the placeholder classes inside the frames, and their behaviour: menus, filters and search, glossary tooltips, a horizontal timeline and scroll sync. |

Write for the client: they read the page notes, decisions and journeys. Name things as they see them, never by handle, and say "the plan" rather than naming internal tools. Placeholder copy goes in [square brackets], which the frames shade so it reads as a placeholder.

A decision's id, such as `D3`, is how people refer to it once shared: never renumber one. Mark it on the pages it affects with `pin('D3')` beside the element, and list it in that page's notes.

## Versions

Each version is a snapshot in a folder of its own: `1/`, `2/`, or a letter such as `B` for an alternative. Start a new version when the prototype goes back to the client, and leave the earlier ones as they were: a later version may add or remove pages, so they aren't compared page by page.

```bash
./new-version.sh 2
```

copies the newest version's `src/` into `2/`, with a `version.json` dated today. `./new-version.sh B "Option B"` gives the new version a label. Edit its `src/`, list what changed under `notes` in its `version.json`, then run `./build.sh 2`. `./build.sh` on its own builds every version.

`version.json` holds the `label` shown in the top bar ("Version 2" when there is none), the `date`, and the `notes` the version menu lists as what changed. Add `"default": true` to open that version at `/prototype` instead of the newest. Set version 1's date when you first share it.

## The agency

The "Prepared by" corner and the footer credit show the agency in `AGENCY` in `.env`, with its name, link and logos from `public/agencies/<agency>`. Change `AGENCY`, then build again.

## Sharing it from the site

The app serves the newest version, or the default, at `/prototype`, and each version at its own address, such as `/prototype/2`. The version menu in the top bar lists them all. Two settings in `.env` control it:

```
PROTOTYPE_ENABLED=true
PROTOTYPE_PASSWORD=
```

- `PROTOTYPE_ENABLED` off, the default, makes `/prototype` a 404. The files stay in git. Keep it off on the live site.
- With `PROTOTYPE_PASSWORD` set, visitors see a sign-in page asking for their name and the password. A browser stays signed in for 30 days, the name shows in the prototype's top bar with a "Not you?" link, and changing the password signs everyone out. Always set one on a public server such as staging.
- After changing either on a server with cached config, run `php artisan config:cache`.

The routes are in `routes/web.php`, the sign-in in `app/Http/Controllers/PrototypeController.php` with its page in `resources/views/prototype/sign-in.blade.php`, the on and off switch in `app/Http/Middleware/PrototypeEnabled.php`, and the tests in `tests/Feature/PrototypeTest.php`.

`artifact.html`, beside each version's `index.html`, is the same page without the document wrapper, for publishing as a claude.ai Artifact instead.

Nothing in this folder is part of the site build: Tailwind doesn't scan it and the static generator doesn't copy it. The page loads Tailwind's browser build from jsDelivr, so it needs a connection.
