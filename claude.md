# Project-Specific Information

This is Avoca's fork of studio1902/statamic-peak. `upstream` is the Peak remote; merge its tags
(`git merge v22.x.y`), never rebase.

## Merging upstream

- Navigation views: `resources/views/navigation` from upstream should be merged into
  `resources/views/layout/navigation` in this fork.
- Cards: this fork ships its own `cards` block (fieldset + `page_builder/_cards`). Keep ours on merge.
- Text component uses `span-lg` class (not upstream's `span-md`).
- `resources/css/site.css` must only differ from upstream by the two Avoca imports at the end
  (`colours.css`, `avoca.css`). Everything Avoca-specific lives in those two files and in
  `components/buttons.css` (the `.btn` scheme appended after upstream's `.button`).
- Robots: Peak SEO serves `/robots.txt` from the SEO global. The `bots` global only holds `llms.txt`.

## Typography (since Peak v22, "Modern typography")

- The `typography/*` partials are gone upstream and here. Write plain elements: `<h2 class="...">`,
  `<p>`, `<figcaption class="caption">`, `<article class="prose max-w-none">`.
- Body and heading colour come from `--body-color` / `--headings-color` (upstream tokens). Do not
  add `text-neutral` or a colour utility to text inside page-builder blocks: the `.scheme-*`
  classes in `colours.css` invert those tokens (and the `--prose-*` tokens) for dark backgrounds.

## Fresh-install rules (learned from the sandbox check)

- `StarterKitPostInstall.php` is stock upstream except one addition in `cleanUp()`: it deletes the
  skeleton's `public/robots.txt` so Peak SEO's robots route is not shadowed. Re-apply on merge.
- Never name an env key ending in `APP_URL=` (e.g. `VITE_APP_URL`): the post-install does a
  substring replace of `APP_URL=` and corrupts the line. The Vite key is `VITE_SITE_URL`.
- Global values live in `content/globals/default/<handle>.yaml`. Statamic 6 ignores an inline
  `data:` block in the root `content/globals/<handle>.yaml`; the root file holds only the title.
- After any upstream merge: run the "Kit install check" workflow (or the same steps locally in a
  throwaway site) before merging to main. It installs the kit fresh, builds, and renders pages.
- Default robots policy (SEO global → Robots): allow search engines and AI search/assistant
  fetchers, block AI training crawlers. Edit the list in the CP, never in a template; Peak SEO
  appends the Sitemap line itself, so do not add one.

## Colours (decided 14 Sept 2026)

- Every colour token lives in `resources/css/colours.css` (`@theme static`). The palette block in
  upstream `theme.css` and the black/white/grey lines in upstream `peak.css` are removed on purpose;
  re-remove them after an upstream merge.
- One grey scale, spelt `gray` (Peak's and Tailwind's spelling), mapped to Tailwind's slate. There
  is no `neutral` scale and no alias. Never write `neutral` in Avoca views, CSS or content.
- Text colour is `--body-color` (gray-800) and `--headings-color` (gray-900), declared in
  `colours.css`. Upstream `typography.css` is edited so its `--prose-*` tokens read those two instead
  of `--color-neutral`; re-apply after an upstream merge. Do not put a text colour class on ordinary
  text: it inherits the body colour, which is what lets the dark and primary schemes invert it.
