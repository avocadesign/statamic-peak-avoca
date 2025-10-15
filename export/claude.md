# Project context
This is a Statamic CMS project (Laravel-based flat-file CMS) with Antlerstemplating, TailwindCSS, and AlpineJS.

## Project Structure
- Navigation views are located in `resources/views/layout/navigation/`
- Page builder blocks are in `resources/views/page_builder/`
- Reusable components are in `resources/views/components/`
- Layout partials (header, footer, etc.) are in `resources/views/layout/`

### Statamic Patterns
- Reference existing fieldsets in `resources/fieldsets/`
- Content files are in `content/collections/`
- Always consider flat-file structure (no database)
- Scope the field data where appropriate to prevent similarly named fields conflicting when mutliple collections are using the same partial or being displayed on the same template

## Component Conventions
- Bard fields use `remove_empty_nodes: trim` setting

## Styling
- Tailwind CSS v4 is used
- Custom styles: Use `@apply` in component CSS files
- Follow existing component patterns for consistency
- Follow mobile-first responsive design
- Check `resources/css/site.css` for custom styles

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
- See `agents.md` for comprehensive development guidelines
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