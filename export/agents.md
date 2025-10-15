# AGENTS.md

Guidance for AI coding agents working in this repository. Follow these conventions to keep changes consistent, safe, and easy to maintain.

**Scope:** This file applies to the entire repository.

## Project Overview
- **Stack:** Laravel 11 (PHP 8.3+), Statamic 5 (flat-file CMS), Antlers templates, Tailwind CSS 4, Alpine.js, Vite
- **Base:** Forked from [studio1902/statamic-peak](https://github.com/studio1902/statamic-peak) starter kit
- **Content:** File-based under `content/`; no database by default
- **Customizations:** See `claude.md` for project-specific preferences and structure

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

### Page Builder Customizations
- **Excluded blocks:** This fork does NOT include the "cards" page builder block from upstream
- **Block groups:**
  - "Content" group (not "image_and_text") — contains article, columns, divider
  - "dynamic" group (not "interactive") — contains form block
- **Field naming:**
  - Article fieldset uses "media" group (not "image_video")

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

### Spacing Best Practices
- Use `gap` utilities for spacing in flex/grid layouts (not margins)
  ```html
  <div class="flex gap-8">
      <div>Item 1</div>
      <div>Item 2</div>
  </div>
  ```

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

## Upstream Sync
- This repo is a fork of `studio1902/statamic-peak`
- Upstream is configured as: `git remote add upstream https://github.com/studio1902/statamic-peak.git`
- When merging upstream changes:
  - Respect customizations documented in `claude.md`
  - Preserve project-specific naming and structure
  - Test thoroughly after merge

## Boundaries & Best Practices
- **Reuse existing components** — Check for existing partials/components before creating new ones
- **Match existing patterns** — Follow neighboring file style and structure
- **Keep changes minimal** — Avoid unrelated refactors
- **Do not introduce:**
  - New top-level directories without approval
  - New dependencies without approval
  - Breaking changes to existing content structure

## Performance & SEO
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
- `claude.md` — Project-specific conventions and preferences for AI agents
- `agents.md` — Comprehensive guidance for AI coding agents
- `CHANGELOG.md` — Version history and changes (inherited from upstream)
- `README.example.md` — Deployment scripts and environment setup examples

## Need Help?
- Check `claude.md` for project-specific conventions
- Review similar existing files for patterns
- Statamic documentation: https://statamic.dev
- Peak starter kit docs: https://github.com/studio1902/statamic-peak
