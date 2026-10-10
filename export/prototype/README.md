# Prototype

The discovery prototype for the site: every page in a desktop and a mobile frame, drawn with the site's own CSS, with
page notes, user journeys, the sitemap and the content model. It shows what goes on each page and how people move
through the site, not the final look. With feedback on, reviewers comment on the pages themselves, and the team raises
the comments that need one as decisions.

The interface, the route and the sign-in come from the Avoca Tools add-on. This folder holds only what the prototype
says, one folder per version:

| File | What it holds |
| --- | --- |
| `data.js` | The project, audiences, page notes, journeys, the content model and the sitemap. |
| `pages.js` | The site's header and footer as the prototype draws them, its pages and its routes. |
| `version.json` | The version's label, date and notes on what changed, and `"default": true` to open it at `/prototype`. |

Start a new version when the prototype goes back to the client with `php please avoca:prototype:version 2`, and leave
earlier versions as they were. The add-on's README has the rest: switching it on, the password and reviewers, and
how comments work.
