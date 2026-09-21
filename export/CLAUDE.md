# Project context
This is a Statamic CMS project (Laravel-based flat-file CMS) with Antlers templating, TailwindCSS, and AlpineJS.

## Build recipe
Avoca's build recipe comes from the avocadesign/statamic-tools package. Follow it when building or extending this site: it sets the order for deciding how to build something, the conventions for blocks, sets and collections, and the review steps.

@vendor/avocadesign/statamic-tools/recipe/recipe.md

## Project Structure
- Navigation views are located in `resources/views/layout/navigation/`
- Page builder blocks are in `resources/views/page_builder/`
- The blocks and sets this site has, with their fields, options and usage guidance, are listed in `resources/site/catalogue.md`. Read it rather than relying on any list of blocks written elsewhere.
- Reusable components for sets are in `resources/views/components/`
- Common utility partials are in `resources/views/components/utilities`
- Layout partials (header, footer, etc.) are in `resources/views/layout/`

### Statamic Patterns
- Reference existing fieldsets in `resources/fieldsets/`
- Content files are in `content/collections/`
- Always consider flat-file structure (no database)
- Page builder blocks read their own fields through the `block:` scope (`{{ block:heading }}`, `{{ if block:align == 'centre' }}`), in conditions, switches and attribute values too. An unscoped read of a field the block doesn't have falls back to the page, then to anything else in scope such as globals, so a block can pick up a page value of the same name.
  - Pass a block's values into shared partials as parameters: `{{ partial:components/buttons :buttons="block:buttons" }}`, and `:colour_scheme="block:colour_scheme" :block_margins="block:block_margins"` on `page_builder/block`. A parameter is set even when it is null, so nothing falls back, and the partial still works as a text editor set.
  - When a loop over the block's own replicator, grid, group or assets reads item fields, give it a named scope: `{{ block:cards scope="card" }}{{ card:card_title }}{{ /block:cards }}`. Text editor loops need none: `{{ block:article }}{{ partial src="components/{type}" }}{{ /block:article }}`.

## Component Conventions
- Bard fields use `remove_empty_nodes: trim` setting

## Styling
- Tailwind CSS v4 is used
- Check `resources/css/site.css` for custom styles
- Custom styles: Use `@apply` in site.css
- Follow existing component patterns for consistency
- Follow mobile-first responsive design

## Field Conventions
- Article fieldset uses "media" group for images and videos
- Common reusable fields are defined in `resources/fieldsets/common.yaml`

## Content Management
- All content is file-based in the `content/` directory
- After modifying fieldsets, run: `php please statamic:stache:warm`
- For production, use static caching: `php please statamic:static:warm --queue`

### JavaScript Guidelines
- Use AlpineJS for interactivity
- Keep `x-data` simple and focused
- Place complex logic in separate JS files in `resources/js/`

## Development Workflow
- See `AGENTS.md` for comprehensive development guidelines
- Use partials for reusable template fragments
- Always check existing components before creating new ones
- Match the style and structure of neighboring files
- Prefer composition over inheritance
- Follow PSR-12 for PHP

### Code Quality
- Follow PSR-12 for PHP
- Keep Antlers templates minimal and readable
- include Antlers comments for structural elements like sections or divs that are placed on a CSS grid `{{# comment #}}`
  - use a descriptive term `{{# content wrapper #}}`
- Use partials for reusable template fragments
- Prefer composition over inheritance

### When Uncertain
- Check AGENTS.md for detailed context
- Follow existing patterns in the codebase
- Use Statamic CLI commands over manual file creation
- Remember this is a marketing website (consider SEO)