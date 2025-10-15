# Project-Specific Information

This file contains project-specific conventions and preferences for this Statamic Peak Avoca site. AI agents should follow these guidelines when working on this project.

## Project Structure
- Navigation views are located in `resources/views/layout/navigation/`
- Page builder blocks are in `resources/views/page_builder/`
- Reusable components are in `resources/views/components/`
- Layout partials (header, footer, etc.) are in `resources/views/layout/`

## Page Builder
- Available block groups:
  - **Content** — article, columns, divider
  - **dynamic** — form
- The "cards" block is NOT used in this project

## Component Conventions
- Text component uses `span-lg` class for consistent spacing
- Bard fields use `remove_empty_nodes: trim` setting

## Styling
- Tailwind CSS v4 is used
- Follow existing component patterns for consistency
- Check `resources/css/site.css` for custom styles

## Field Conventions
- Article fieldset uses "media" group for images and videos
- Common reusable fields are defined in `resources/fieldsets/common.yaml`

## Content Management
- All content is file-based in the `content/` directory
- After modifying fieldsets, run: `php please statamic:stache:warm`
- For production, use static caching: `php please statamic:static:warm --queue`

## Development Workflow
- See `agents.md` for comprehensive development guidelines
- Always check existing components before creating new ones
- Match the style and structure of neighboring files
