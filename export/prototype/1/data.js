/* ---------- The project ----------
   Everything the prototype says about this site lives in this file and in pages.js. The add-on's interface reads
   it and never names a page or journey itself. Fill these in from the portal brief and the client's documents;
   anything left empty shows an empty state rather than breaking. Decisions aren't written here: the team raises
   them from comments on the pages, with feedback on. */

const PROJECT = {
    key: 'site',                                  // short and unique: keeps each site's saved view settings apart
    name: '',                                     // shown top left and in the tab title; empty uses APP_NAME from .env
    subtitle: 'Prototype for approval',
    prepared: 'Prototype, [Month Year]',          // shown under "Prepared by Avoca"
    sitemapIntro: 'Pages with a dashed outline are our suggestions: say what you think in the feedback on the page. The rest are agreed, URLs included.'
};

/* ---------- Audiences ----------
   key: [name, one line about them]. Used by page notes and journeys. */

const AUD = {};

/* ---------- Page notes ----------
   Keyed by the route keys in ROUTES. A page with no notes still renders, with an empty notes panel. Keep notes clean
   and short: they say what is settled. Questions and choices still to agree are comments, raised as decisions.

   home: {
       purpose: 'What the page is for, in a short plain sentence: no system names or where content comes from.',
       aud: ['audienceKey'],
       content: [['Section', 'What it holds.']],          // what the client needs to prepare
       consider: ['Something the client should know.'],  // short and client-facing; three or four at most
       tech: ['How it is built, in a sentence or two.'],  // plain sentences; don't repeat what fed shows
       fed: ['modelId']                           // MODEL ids whose content appears here: the notes link to them
   }
*/

const NOTES = {
    home: {
        purpose: '',
        aud: [],
        content: [],
        consider: [],
        tech: [],
        fed: ['pages']
    },
    contact: {
        purpose: 'How to get in touch, with contact form and contact details',
        aud: [],
        content: [
            ['Contact details', ''],
            ['Email to send the form to', ''],
            ['Any extra questions you’d like to ask in the form', '']
        ],
        consider: [],
        tech: ['Form submissions go to the email address in Site Details.'],
        fed: ['pages', 'contact_form', 'site_details']
    }
};

/* Notes that apply to every page, folded at the foot of each page's notes: what the client should know about the
   header and footer, and the build and performance points. */
const SITEWIDE = { consider: [], tech: [] };

/* ---------- Page options ----------
   Ways a page can be shown, for reviewers to compare before choosing, keyed by route key. They show in a bar above
   the frames on that page, and a comment records which were showing. Name options and choices in a word or two, and
   leave the question out: reviewers say which they prefer in a comment, and the team raises the decision there. pages.js reads the choice with option('id'), and
   the frame's <html> carries data-option-<id> for CSS. frame: 'desktop' or 'mobile' limits one to that frame; mode:
   true makes its choice the timeline's layout (pinned, swipe or vertical) instead of redrawing the page.

   timeline: [
       { id: 'chapters', label: 'Chapters', choices: [['shifts', 'Who decides'], ['years', 'Report years']] },
       { id: 'desktop-timeline', label: 'Desktop timeline', frame: 'desktop', mode: true,
         choices: [['pinned', 'Pinned'], ['swipe', 'Swipe'], ['vertical', 'Vertical']], default: 'pinned' }
   ]
*/

const OPTIONS = {};

/* ---------- Other devices ----------
   The prototype shows each page on a desktop and a phone. A site that needs another size, such as a tablet, adds it
   here: it becomes a choice in Display options, shown on its own, and comments made on it are kept for it.

   { id: 'tablet', label: 'Tablet', width: 820, height: 1180 }
*/

const DEVICES = [];

/* ---------- User journeys ----------
   A visitor's path through the site, one step at a time. A step's `sel` is a CSS selector in the page,
   usually a data-j attribute, that is highlighted when the step opens.

   { id: 'first-visit', name: 'A first visit', aud: 'audienceKey', device: 'mobile',   // or 'desktop'
     who: 'Who they are, in a few words',
     arrives: 'How they arrive',
     goal: 'What they want to do',
     measure: 'Share',                                                                  // how success is counted
     steps: [{ route: '/', sel: '[data-j="page-header"]', t: 'Lands on home', d: 'What they see and do here.' }] }
*/

const JOURNEYS = [];

/* ---------- Content model ----------
   Collections, taxonomies, globals and navigations. `area` places the card on the diagram's grid, named in
   MODEL_LAYOUT (CSS grid-template-areas, three columns), with Pages always in the top row. Fields are [handle, type] with an optional third value,
   's' suggested or 'x' to drop.

   { id: 'stories', kind: 'Collection', name: 'Stories', handle: 'stories', count: '~20', status: 'suggested',  // only for one of ours, until it's agreed
     area: 'stories', route: '/stories/{slug}',
     fields: [['title', 'text, required'], ['summary', 'textarea', 's']], terms: 'Optional: a taxonomy's terms' }

   kind is Collection, Taxonomy, Form, Global, Navigation or Assets. Navigation and Assets (asset libraries) sit in
   sections of their own below the diagram, so they need no area.

   RELS: [fromId, toId, 'label', suggested?]. Use the label 'taxonomy' for a collection's taxonomy: it reads as
   "Stories uses the Story type taxonomy".
*/

const MODEL = [
    { id: 'pages', kind: 'Collection', name: 'Pages', handle: 'pages', count: '2', area: 'pages', route: '/{parent_uri}/{slug}',
      fields: [
          ['title', 'text, required'], ['page header', 'type, heading, lede, image, buttons'], ['page_builder', 'blocks'],
          ['seo', 'title, description, social image'], ['parent', 'the page above it']
      ] },
    { id: 'contact_form', kind: 'Form', name: 'Contact form', handle: 'contact', count: 'submissions', area: 'form',
      fields: [['name', 'text, required'], ['email', 'email, required'], ['message_body', 'textarea, required'], ['consent', 'toggle, required']] },
    { id: 'site_details', kind: 'Global', name: 'Site Details', handle: 'site_details', area: 'details',
      fields: [
          ['phone', 'text'], ['mobile', 'text'], ['email', 'text: where enquiries go'],
          ['address', 'street, town, region, postcode, country, map position'], ['address shown', 'text: replaces the address on the page'],
          ['logo', 'image for search engines'], ['social_media', 'links']
      ] },
    { id: 'nav_main', kind: 'Navigation', name: 'Main', handle: 'main',
      fields: [['items', 'chosen from Pages, up to two levels']] },
    { id: 'images', kind: 'Assets', name: 'Images', handle: 'images',
      fields: [['alt', 'text: alt text, required unless exempt'], ['exempt_from_alt', 'toggle: for decorative images']] },
    { id: 'files', kind: 'Assets', name: 'Files', handle: 'files', fields: [] }
];
const MODEL_LAYOUT = '"pages form ." "details . ."';  // CSS grid-template-areas, three columns
const RELS = [
    ['pages', 'contact_form', 'show'],
    ['pages', 'site_details', 'show'],
    ['contact_form', 'site_details', 'sends to the email in']
];

/* ---------- Sitemap ----------
   The home page sits above the columns. Each column is a top level page with its children.
   t title, u URL, k route key (opens its page), s one of our suggestions (until it's agreed),
   coll collection entries, count, note, nav 'main' or 'footer', kids children. */

const SITEMAP_ROOT = { t: 'Home', u: '/', k: 'home' };
const SITEMAP = [
    { t: 'Contact', u: '/contact', k: 'contact', nav: 'main' }
];

/* ---------- Background for the panels ----------
   CHANGES: [title, what changed], since the proposal.
   SOURCE_MAP: [source document or section, where it goes on the site, route to open].
   SOURCE_CHECKS: [title, a discrepancy or gap in the client's documents to fix before launch]. */

const CHANGES = [];
const SOURCE_MAP = [];
const SOURCE_CHECKS = [];

/* ---------- Glossary ----------
   Words the gw() helper wraps in the site's tooltip. { word, type, also, def } */

const GLOSSARY = [];
