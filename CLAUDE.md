# Project-Specific Information

This is Avoca's fork of studio1902/statamic-peak. `upstream` is the Peak remote; merge its tags
(`git merge v22.x.y`), never rebase.

## Merging upstream

- Navigation views: `resources/views/navigation` from upstream should be merged into
  `resources/views/layout/navigation` in this fork.
- Cards: this fork ships its own `cards` block (fieldset + `page_builder/_cards`). Keep ours on merge.
- Text component uses `span-lg` class (not upstream's `span-md`).
- `resources/css/site.css` differs from upstream by two imports: `components/clickable-parent.css`
  (in the components layer, beside upstream's buttons and caption) and `colours.css` at the end.
  `.lede` is a typography token and rule in `typography.css`; the `.btn` scheme is appended to
  `components/buttons.css` after upstream's `.button`. There is no `avoca.css`.
- Robots: Peak SEO serves `/robots.txt` from the SEO global. The `bots` global only holds `llms.txt`.

## Typography (since Peak v22, "Modern typography")

- The `typography/*` partials are gone upstream and here. Write plain elements: `<h2 class="...">`,
  `<p>`, `<figcaption class="caption">`, `<article class="prose max-w-none">`.
- Peak's `.prose` rules only style content inside a wrapper element that is the direct child of
  `.prose` (Bard chunks render as `<div>`). Hand-written prose must be wrapped the same way:
  `<article class="prose"><div>…</div></article>`, never bare headings or lists in the article.
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
- Heading sizes are the `--typography-h1…h6` tokens at the top of `typography.css` (one step per
  level: 4xl, 2xl, xl, lg, base, sm). That block differs from upstream on purpose, as do the
  prose colour tokens beside it; re-apply both after an upstream merge.
- Block subheadings (the `<h3>` under the `<h2>` in text, media and text, columns, cards and two
  images) carry `.subheading`, declared in `typography.css`: the h4 size in medium weight. Restyle
  subheadings there, not in the partials.
- Card titles in the Cards block are `<h3>` elements carrying `.card-heading`, declared in
  `typography.css`: the h4 size. Restyle card titles there, not in the partial.
- `--font-weight-medium: 500` is enabled in `theme.css` (upstream leaves it commented out). A custom font needs a
  500 file in `fonts.css`, or medium falls back to the regular face.
- Heading line height is `--typography-headings-line-height` in `typography.css`, set to 1.2.
  Upstream uses Tailwind's `--leading-tight` (1.25) directly. The `.heading-size-*` classes take it too.
  Size a heading with `heading-size-*`, never `text-*` or `leading-*`: Tailwind's text utilities carry
  their own line height and would override the token.
- Lines, borders and tables read tokens from `colours.css`, never a grey class, so each colour scheme can
  override them: `--divider-colour` (the Divider block), `--border-colour` (the generic border, used by text
  cards and the desktop navigation), and `--table-border-colour`, `--table-header-bg` and `--table-cell-bg`
  (the Table set). Light, Primary and Dark override them, so tables keep readable text on dark backgrounds.
  Use `border-(--border-colour)` for any new bordered element.

## Bard sets

- The Buttons set uses `span-lg` inside an article, the width of the text around it. Upstream uses
  `span-md`, which starts the buttons in from the text edge.
- The size field saves its XL option as `2xl`. Pull quote and Video had no `2xl` case, upstream too, so XL
  fell back to `span-md`. They now map it to `span-content`, like Image, HTML and Table.

## Page builder blocks

- Call to action: the panel takes a colour scheme class, `scheme-{panel_scheme}`, Primary by default, with
  Dark and Light as options. Its heading, text and buttons use that scheme's tokens, so a Primary button shows
  white with brand-colour text on the Primary panel. The field is `panel_scheme`, not `colour_scheme`, because
  the block wrapper applies `colour_scheme` to the whole section.
- Cards: the buttons sit at the foot of each card (`mt-auto`), level across a row, and the image, title
  and text are stacked (`stack-6`, `stack-4`). The card text article is no longer `contents`.
- Form: the heading field is `heading`, labelled Heading, like the other blocks. The template used to read
  `title`, so the heading never showed, and the contact page content moved from `title` to `heading` with the fix.
  The heading and text sit together in a `header` (`gap-2`), and the form column is `stack-8`.
  Required markers and inline errors use `--form-error` from `colours.css`: red on Default and Light, white on
  Primary and a light red on Dark, so they stay readable on every scheme. The consent link hover uses
  `--btn-inline-hover-text` for the same reason, and the success message uses `heading-size-6`.

## Site guidance and the AI block catalogue

- `resources/site/blocks/<handle>.md` and `resources/site/sets/<handle>.md` are the default guidance for each block
  and set: description, When to use, When not to use and Notes for AI. Sites edit their own copies.
- `resources/site/design.md` holds the rules every block shares, such as colour schemes, spacing and headings.
- `resources/site/catalogue.md` is generated by `php please avoca:site:catalogue` from avocadesign/avoca-tools. Never
  edit it by hand: after changing a fieldset or a guidance file, regenerate it and commit it with the change.
- Placeholder text from a stub never reaches the catalogue, so an unwritten section is left out.
