---
title: Video
description: A YouTube or Vimeo video in a player that fits the page, with an optional caption.
---
## When to use

- Showing a YouTube or Vimeo video within a page's text, such as a project walkthrough, a talk or a how-to.
- Add a caption to say what the video shows or how long it runs.
- On a "simple" page, set Size to LG or XL for a video that deserves more width. Inside a block, the video fills the width of the text.

## When not to use

- A video that leads a section, with a heading and short text beside it: use Media and text with Media type set to Video.
- A video file that isn't on YouTube or Vimeo: this set can't play it, so upload it to YouTube or Vimeo first, or ask the developer.
- A podcast or sound recording: use the HTML set with the host's own embed code.

## Notes for AI

- Use the video's normal address, such as a youtube.com/watch, youtu.be, YouTube Shorts or vimeo.com link. The site turns it into an embedded player.
- The player is always 16:9, so a vertical video such as a YouTube Short shows with wide black bars.
- The video must be public or unlisted and allow embedding, or the player shows an error.
- Each player loads a lot of code from YouTube or Vimeo, so use one or two videos per page at most.
- When the site's consent banner asks visitors about embeds, a message replaces the player until the visitor accepts.
- Sum up the video in the text nearby, for people who can't or won't play it.
- Keep the caption to one short sentence. It shows below the player.
- Size labels don't match their saved keys: Normal is `lg`, LG is `xl` and XL is `2xl`. With Size left out, the video is narrower than the text on a simple page.
- Size only works where the text editor sits directly on the page, as on a simple page. Inside every page builder block the video fills its column, whatever Size says.
