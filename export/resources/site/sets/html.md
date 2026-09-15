---
title: HTML
description: Embed code from a trusted outside service, such as a map, booking calendar or sign-up form.
---
## When to use

- Embedding a tool from a service the business already uses and trusts, such as a map, a booking calendar, a newsletter sign-up or a social media post.
- When that service gives you code to copy from its own embed or share option.
- On a "simple" page, set Size to LG or XL for an embed that needs more width, such as a map. Inside a block, the embed fills the width of the text.

## When not to use

- A YouTube or Vimeo video: use Video, which sizes the player for phones, adds a caption and waits for cookie consent when the site asks for it.
- A contact or enquiry form: use the Form block, which checks what people enter, blocks spam and sends each submission to the business.
- Buttons, a table, an image or contact details: use the Buttons, Table, Image or Contact Details set, which match the site's design.
- Tracking or analytics code for the whole site: ask the developer, because it belongs in the site's SEO settings, not on one page.
- Code from a website or person you don't know: ask the developer to check it before anything is added.
- Changing how the page looks: ask the developer.

## Notes for AI

- Only add embed code from a service the person names, copied from that service's own embed option. Never write your own scripts, and never paste code from an unknown site: a script can change the page, read what visitors type or send them elsewhere.
- When a service offers an iframe embed as well as a script, use the iframe, because a script runs with full access to the page.
- Give every iframe a `title` that says what it shows, such as `title="Map of our Nelson office"`, so screen readers can announce it.
- Offer another way to get the same information, such as the address in text beside a map, because many embeds are hard to use with a keyboard or screen reader.
- Set the embed's width to 100% rather than a fixed number of pixels, so it fits on phones.
- Every embed loads code from another company and slows the page. Add `loading="lazy"` to iframes below the top of the page, use one or two embeds per page at most, and never add the same script twice.
- The HTML set isn't held back by the site's cookie consent banner, unlike Video, so an embed that sets cookies loads before visitors agree.
- The code isn't checked. Close every tag you open, because a broken tag can break the layout of everything below it.
- Put headings and text in the text editor around the embed, because the HTML set sits outside the site's text styling.
- On a site generated as static files, the embed must not call this site's own server, such as a form that posts to the site or a search of its pages, because there is no server to answer. Embeds that load everything from the outside service still work.
- Size labels don't match their saved keys: Normal is `lg`, LG is `xl` and XL is `2xl`. With Size left out, the embed takes the width of the text, the same as Normal.
- Size only works where the text editor sits directly on the page, as on a simple page. Inside every page builder block the embed fills its column, whatever Size says.
