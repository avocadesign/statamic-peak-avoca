---
title: Anchor
description: An invisible marker between blocks that a link can jump to.
---
## When to use

- Letting a link or button jump straight to a section further down a long page, such as "See our prices".
- A short list of links at the top of a long page, where each link jumps to its section.
- Sharing a link that opens a page at a particular section, such as the prices on a services page.

## When not to use

- Linking to another page, or to the top of a page: link to the page itself, because no anchor is needed.
- Adding space between blocks: use Block Margins in a block's display settings, because an Anchor shows nothing and adds no space.
- Marking the start of a section people can see: use a heading in a Text block, or a Divider, because an Anchor is invisible.

## Notes for AI

- Place the Anchor directly above the block people should land on. A link to it scrolls smoothly to the top of that block.
- Use a short, lowercase ID of a word or two joined by hyphens, such as `pricing` or `our-team`. The field turns what is typed into that form.
- Every ID must be unique on the page. `content` is already used by the page's main content area, and a Form block uses `summary` and its form's field handles, such as `name` and `email` in the Contact form.
- An Anchor does nothing on its own, so add the link that points to it in the same change: `#pricing` in a button's URL or a text link on the same page, or `/services#pricing` from another page.
- When you rename or remove an Anchor, update every link that points to it.
- An Anchor only sits between blocks, so it can't mark a heading inside a block's text. Place it above that block instead.
