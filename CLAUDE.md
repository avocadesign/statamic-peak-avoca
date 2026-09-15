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

- `StarterKitPostInstall.php` is stock upstream except for three Avoca additions, to re-apply on merge:
  `cleanUp()` deletes the skeleton's `public/robots.txt` so Peak SEO's robots route is not shadowed, and
  `addAvocaToolsRepository()` and `requireAvocaTools()` add the private avoca-tools repository and require
  the addon. Keep avoca-tools out of `starter-kit.yaml`: Statamic installs a kit's dependencies before the
  hook runs, so a plain `statamic new` can't find a private package listed there.
- New sites require avoca-tools `^0.1`, the addon's current release line (version tags on GitHub, notes in
  the addon's CHANGELOG.md). When an addon release moves the middle number while it is 0.x, such as 0.2.0,
  change the constraint in `requireAvocaTools()` and run `scripts/install-check.sh`.
- Peak Commands, a paid addon, is off by default: `modules.commands.default` is `false` in `starter-kit.yaml`,
  so the install prompt defaults to No and a non-interactive install leaves it out. Upstream Peak defaults it
  on, so re-apply on merge. Avoca's library and `avoca:make:collection` replace its install and make commands.
- Never name an env key ending in `APP_URL=` (e.g. `VITE_APP_URL`): the post-install does a
  substring replace of `APP_URL=` and corrupts the line. The Vite key is `VITE_SITE_URL`.
- Global values live in `content/globals/default/<handle>.yaml`. Statamic 6 ignores an inline
  `data:` block in the root `content/globals/<handle>.yaml`; the root file holds only the title.
- After any upstream merge, and after changing `starter-kit.yaml`, `StarterKitPostInstall.php` or the
  kit's dependencies: run `scripts/install-check.sh` before merging to main. It installs the last commit
  into a new site in a temporary folder, builds, renders pages and runs `avoca:site:check --strict`. It
  runs on this computer rather than in GitHub Actions: it needs read access to the private avoca-tools
  repository, and this repository is public.
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
  The Pull quote set's quotation marks and author dash use `--quote-mark-colour`: the brand colour, white
  on Primary (where the brand colour vanishes) and 60% brand colour mixed with white on Dark (the brand
  colour alone measured 2.79:1 there).

## Bard sets

- The Buttons set uses `span-lg` inside an article, the width of the text around it. Upstream uses
  `span-md`, which starts the buttons in from the text edge.
- The size field saves its XL option as `2xl`. Pull quote and Video had no `2xl` case, upstream too, so XL
  fell back to `span-md`. They now map it to `span-content`, like Image, HTML and Table.

## Page builder blocks

- Heading fields: every block's heading is `heading`, with `sub_heading` where it has one. Cards (once
  `cards_heading` and `cards_subheading`) and Call to action (once `title`) were renamed to match. Keep these
  names if an upstream merge brings the old ones back. Fields inside a repeated item, such as `card_title`, keep
  their own names.
- Scope: block templates read the block's own fields through `block:` (`{{ block:heading }}`, `{{ if block:align == 'centre' }}`,
  `:image="block:image"`), in conditions, switches and attribute values too. Blocks render inside `{{ page_builder scope="block" }}`,
  and an unscoped read of a key the block lacks falls back to the page, then to anything else in scope such as globals. Statamic
  gives every field in a block's fieldset a key, null when empty, so the risk is a name the fieldset lacks: the Call to action and
  Divider have no `colour_scheme` or `block_margins`, so a page value of either name used to style their section.
  - Pass the block's values into shared partials as parameters: `{{ partial:components/buttons :buttons="block:buttons" }}`, and
    `:colour_scheme="block:colour_scheme" :block_margins="block:block_margins"` on every `page_builder/block` call. A parameter is
    set even when it is null, so nothing falls back, and the partial still works as a text editor set, where the set's own fields
    are in scope.
  - A loop over the block's own replicator, grid, group or assets that reads item fields takes a named scope and reads them through
    it: `{{ block:cards scope="card" }}{{ card:card_title }}{{ /block:cards }}`. Loop variables such as `index`, `last` and
    `total_results` stay unscoped.
  - Text editor loops need no scope inside: `{{ block:article }}{{ partial src="components/{type}" }}{{ /block:article }}`. Every
    item has its own `type`, and each set's partial reads its own fields.
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
- Form IDs: each Form block's IDs carry its form's handle, so two different forms can share a page. The
  field views in `resources/views/vendor/statamic/forms/fields/` use Statamic's per-form `{{ id }}` (upstream
  Peak uses the handle); `_form` uses `field:id` for labels and instructions and `block:form:handle` for the
  error summary and honeypot; its error links rebuild Statamic's ID pattern, `{form}-form-{handle}-field` with
  dots and underscores as hyphens (`RendersForms::generateFieldId()`, a private method, so recheck it after a
  Statamic upgrade). `resources/views/vendor/statamic-peak-tools/snippets/_form_handler.antlers.html` is
  Avoca's copy of the Peak Tools handler, changed only to find the summary inside its own form: when Peak
  Tools changes its handler, copy it again and repeat that change. Keep all of this on upstream merges.

## Site guidance and the AI block catalogue

- `resources/site/blocks/<handle>.md` and `resources/site/sets/<handle>.md` are the default guidance for each block
  and set: description, When to use, When not to use and Notes for AI. Sites edit their own copies.
- `resources/site/design.md` holds the rules every block shares, such as colour schemes, spacing and headings.
- `resources/site/catalogue.md` is generated by `php please avoca:site:catalogue` from avocadesign/avoca-tools. Never
  edit it by hand: after changing a fieldset or a guidance file, regenerate it and commit it with the change.
- Placeholder text from a stub never reaches the catalogue, so an unwritten section is left out.
