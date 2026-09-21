# AGENTS.md

Guidance for AI coding agents working in this repository. Follow these conventions to keep changes consistent, safe, and easy to maintain.

**Scope:** This file applies to the entire repository.

## Project Overview
- **Stack:** Laravel 13 (PHP 8.3+), Statamic 6 (flat-file CMS), Antlers templates, Tailwind CSS 4, Alpine.js, Vite
- **Base:** Forked from [studio1902/statamic-peak](https://github.com/studio1902/statamic-peak) starter kit
- **Content:** File-based under `content/`; no database by default
- **Customizations:** See `CLAUDE.md` for project-specific preferences and structure

## Build recipe
- Before building or changing a page builder block, a text editor set, a collection, a global, the page header, the header or the footer, read Avoca's build recipe at `vendor/avocadesign/statamic-tools/recipe/recipe.md` and follow it. It sets the order for deciding how to build something (use a block the site has, install a library item, change an existing block, build a new block), the conventions for blocks, sets and collections, and the review steps.
- The recipe comes with the avocadesign/statamic-tools package. If the file is missing, the package is not installed: tell the developer before you build anything.

## Local Setup
1. `composer install`
2. `php please make:user` (create Statamic admin user)
3. `npm install`
4. `npm run dev` or `npm run build`
5. Serve: `php artisan serve` or via Laravel Herd

App runs at configured local domain. Statamic Control Panel is at `/cp`.

## Essential Commands
- **Dev server:** `php artisan serve` (if not using Herd)
- **Vite dev/build:** `npm run dev`, `npm run build`
- **Cache control:**
  - `php artisan cache:clear`
  - `php artisan config:clear`
  - `php artisan route:clear`
- **Statamic content cache:** `php please statamic:stache:warm`
- **Static cache:**
  - `php please statamic:static:clear`
  - `php please statamic:static:warm --queue`
- **Search index:** `php please statamic:search:update --all`

## Project Structure (key paths)
- `resources/views/` — Antlers templates
  - `components/` — Reusable UI components
  - `layout/` — Layout partials (header, footer, navigation)
  - `page_builder/` — Page builder block templates
  - `snippets/` — Small reusable snippets
  - `typography/` — Headings and prose partials
- `resources/fieldsets/` — Field definitions (YAML)
  - `article.yaml` — Bard article content fields
  - `common.yaml` — Reusable shared fields
  - `page_builder.yaml` — Page builder block definitions
- `resources/css/` — Stylesheets
  - `site.css` — Main stylesheet (Tailwind v4 import)
- `resources/js/` — JavaScript files
- `content/` — Flat-file content (collections, taxonomies, navigation, globals)
- `public/` — Public assets and build output

## Project-Specific Conventions

### Navigation Structure
- Navigation views live in `resources/views/layout/navigation/`, NOT `resources/views/navigation/`
- Main navigation files:
  - `_main.antlers.html` — Wrapper
  - `_main_desktop.antlers.html` — Desktop navigation
  - `_main_mobile.antlers.html` — Mobile navigation

### Page Builder Blocks and Text Editor Sets
- **Don't rely on a list of blocks in this file.** The blocks and sets this site has, with their fields, options, groups and usage guidance, are listed in `resources/site/catalogue.md`. It is generated from the fieldsets, so it is always current. Read it before adding or changing blocks or page content.
- Each block's guidance is in `resources/site/blocks/<handle>.md` and each set's in `resources/site/sets/<handle>.md`. Site-wide design rules are in `resources/site/design.md`.
- People see the same list with live previews at `/site/content`.
- After changing a fieldset or a guidance file, run `php please avoca:site:catalogue`, then `php please avoca:site:check --strict`.
- **Groups:** a block with its own content fields goes in the Content group. A block that calls in content from elsewhere, such as a form, collection entries or contact details, goes in the Dynamic group.
- **Field naming:** the article fieldset uses the "media" group, not "image_video".

### Component Preferences
- Text component uses `span-lg` class (not upstream's `span-md`)
- Bard fields use `remove_empty_nodes: trim` (not `true`)

## Naming Conventions
- **Antlers templates:** `kebab-case.antlers.html` or `_partial.antlers.html` (partials prefixed with `_`)
- **Fieldset YAML:** `snake_case.yaml`
- **PHP classes:** `PascalCase.php`; methods/variables: `camelCase`
- **CSS classes:** Follow Tailwind conventions

## Styling with Tailwind CSS v4
- Import Tailwind using `@import "tailwindcss";` in CSS (NOT `@tailwind` directives)
- Utilities-first approach; extract repeated patterns into Antlers components/partials
- **Avoid deprecated utilities:**
  - Use `text-ellipsis` (not `overflow-ellipsis`)
  - Use `shrink`/`grow` (not `flex-shrink`/`flex-grow`)
  - Use color opacity like `bg-black/50` (not `bg-opacity-50`)
- **Dark mode:** Check if existing components support dark mode and maintain consistency

### CSS Grid Best Practices
- All sections unless otherwise specified should use `fluid-grid` this is a grid class from the Peak Starter kit that creates a 12 column grid
  - there are classes that help span this grid automatically `span-*`
  - `span-content` is the default and spans all 12 columns
  - Docs are here https://peak.1902.studio/features/fluid-grid.html#placing-items-on-the-grid
  - there is a subgrid class to pass in the grid to children https://peak.1902.studio/features/fluid-grid.html#subgrids


### Spacing Best Practices
- Use `gap` utilities for spacing in flex/grid layouts (not margins)
  ```html
  <div class="flex gap-8">
      <div>Item 1</div>
      <div>Item 2</div>
  </div>
  ```
- Use peaks stack classes for page builders and bard blocks `stack-*`
  - When using `stack-*`, use `no-space-t` to remove space above if asked and `no-space-b` to remove space below if asked. https://peak.1902.studio/features/stacks.html#collapse

## JavaScript & Interactivity
- Use Alpine.js for interactivity
- Keep `x-data` scoped per component
- Avoid large shared global state
- Load complex logic in separate files under `resources/js/`

## Antlers Template Patterns

### Conditional Rendering
```antlers
{{ if field_name }}
    <div>{{ field_name }}</div>
{{ /if }}

{{ unless no_results }}
    <div>Content here</div>
{{ /unless }}
```

### Partials
```antlers
{{# Include a partial #}}
{{ partial:layout/header }}

{{# Pass data to partial #}}
{{ partial:components/button :text="button_text" }}
```

### Navigation
```antlers
{{ nav:main max_depth="2" include_home="true" }}
    <a href="{{ url }}">{{ title }}</a>
{{ /nav:main }}
```

### Collections
```antlers
{{ collection:posts limit="5" }}
    <article>
        <h2>{{ title }}</h2>
        {{ content }}
    </article>
{{ /collection:posts }}
```

## Statamic-Specific Tips
- Content lives under `content/` and is committed to git
- After modifying content/fieldsets, warm caches: `php please statamic:stache:warm`
- Production uses full static caching
- Asset containers defined in `content/assets/` YAML files
- Collections, taxonomies, navigation, and globals are all file-based

## Boundaries & Best Practices
- **Reuse existing components** — Check for existing partials/components before creating new ones
- **Match existing patterns** — Follow neighboring file style and structure
- **Keep changes minimal** — Avoid unrelated refactors
- **Do not introduce:**
  - New top-level directories without approval
  - New dependencies without approval
  - Breaking changes to existing content structure

## Performance & SEO
- Structured data is set up once per site in the SEO global, Globals → SEO → JSON-ld with Type set to Custom, never in a template or a block. The kit ships the business graph in that field, filled from Site Details. A page adds only its own node, in the page's SEO tab. Read the Structured data section of the build recipe before changing any of it.
- Leverage Statamic image transforms (Glide) for responsive images
- Use static caching for production performance
- Write semantic HTML for accessibility
- Optimize for Core Web Vitals

## Git Workflow
- Commit messages should be descriptive and follow conventional format
- Include Claude Code attribution when appropriate:
  ```
  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

## Testing Changes
- Test changes locally before committing
- Check responsive behavior (mobile, tablet, desktop)
- Verify dark mode if applicable
- Clear caches after structural changes
- Test in Control Panel (`/cp`) if relevant

## Documentation Files
- `CLAUDE.md` — Project-specific conventions and preferences for AI agents
- `AGENTS.md` — Comprehensive guidance for AI coding agents
- `CHANGELOG.md` — Version history and changes (inherited from upstream)
- `README.example.md` — Deployment scripts and environment setup examples

## Need Help?
- Check `CLAUDE.md` for project-specific conventions
- Review similar existing files for patterns
- Statamic documentation: https://statamic.dev
- Peak starter kit docs: https://github.com/studio1902/statamic-peak
