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
