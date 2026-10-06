/* ---------- The project ----------
   Everything the prototype says about this site lives in this file and in 06-render.js. The shell (07-shell.js)
   reads it and never names a page, decision or journey itself. Fill these in from the portal brief and the
   client's documents; anything left empty shows an empty state rather than breaking. */

const PROJECT = {
    key: 'site',                                  // short and unique: keeps each site's saved view settings apart
    name: '[Site name]',                          // shown top left and in the tab title
    subtitle: 'Website prototype · for discussion',
    prepared: 'Prototype, [Month Year]',          // shown under "Prepared by Avoca"
    fromLabel: 'From the brief',                  // heads a decision's `from` note: what its evidence comes from
    decisionsIntro: '',                           // one or two sentences atop the Decisions panel: who decides what
    sitemapIntro: 'Pages marked to confirm are our suggestions, each with the decision that settles it. The rest are agreed, URLs included.'
};

/* ---------- Who decides ----------
   Keys are used in DECISIONS[].who; values are the names people see. */

const WHO = {
    client: '[Client]',
    agency: AGENCY.name                           // AGENCY comes from public/agencies, chosen by AGENCY in .env
};

/* ---------- Decisions ----------
   Each is a numbered marker on the pages it affects, a card in Page notes, and a row in the Decisions tab.
   Never renumber an id once shared: feedback and conversations refer to it.

   { id: 'D1', title: 'A question, short', who: ['client'], pages: ['home'],   // pages: route keys from ROUTES
     q: 'The question in a sentence or two.',
     from: 'What the brief or the client documents say.',                      // optional, headed by PROJECT.fromLabel
     options: [['Option name', 'What it means and what it costs.'], ['Another', '…']],
     rec: 0,                                                                    // index of the suggested option, or -1 for none
     why: 'Why we suggest it, or why it matters when rec is -1.',
     change: 'What changes in the sitemap or content model if this is agreed.', // optional
     status: 'agreed', agreed: 'What was decided, in a sentence.',              // optional, once decided
     decidedBy: ['agency'] }                                                    // optional: who decided, when not everyone in who
*/

const DECISIONS = [
    { id: 'D1', title: 'Approve the prototype?', who: ['client'], pages: ['home'],
      q: 'Does this prototype show the right pages, what goes on them and how people move through the site, so design can start from it?',
      options: [
          ['Approve it', 'Design starts from this version. Anything that changes later is made in design, or as a new version.'],
          ['Approve it with changes', 'List the changes. We make them as a new version, and design starts from that.'],
          ['Not yet', 'Tell us what’s missing or wrong, and we’ll come back with a new version.']
      ], rec: -1,
      why: 'Design builds on what the prototype settles. Changes are quick here, and slower and costlier once design is under way.' }
];
const DEC = Object.fromEntries(DECISIONS.map(d => [d.id, d]));

/* ---------- Audiences ----------
   key: [name, one line about them]. Used by page notes and journeys. */

const AUD = {};

/* ---------- Page notes ----------
   Keyed by the route keys in ROUTES. A page with no notes still renders, with an empty notes panel.

   home: {
       purpose: 'What the page is for, in a sentence or two.',
       aud: ['audienceKey'],
       content: [['Section', 'What it holds and where it comes from.']],
       decisions: ['D1'],                         // listed first; other markers on the page are picked up as well
       consider: ['Something the client should know.'],  // short and client-facing; three or four at most
       tech: ['A build or performance point.'],   // folded away under Technical notes
       fed: ['modelId'],                          // MODEL ids whose content appears here
       tryit: true                                // optional: show the timeline mode switch (for a page with a timeline)
   }
*/

const NOTES = {
    home: {
        purpose: '',
        aud: [],
        content: [],
        decisions: ['D1'],
        consider: [],
        tech: [],
        fed: ['pages']
    },
    contact: {
        purpose: 'How to get in touch, with the contact form and the contact details from Site Details.',
        aud: [],
        content: [
            ['Contact form', 'Name, email, message and consent. Submissions go to the Site Details email.'],
            ['Contact details', 'Phone, email and address, from Site Details.']
        ],
        decisions: [],
        consider: [],
        tech: [],
        fed: ['pages', 'contact_form', 'site_details']
    }
};

/* Notes that apply to every page, folded at the foot of Page notes with any decisions marked in the header or
   footer: what the client should know, and the build and performance points. */
const SITEWIDE = { consider: [], tech: [] };

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
   's' suggested or 'x' to drop, and an optional fourth, a decision id.

   { id: 'stories', kind: 'Collection', name: 'Stories', handle: 'stories', count: '~20', status: 'suggested',  // only for one of ours: to confirm until dec[0] is agreed
     area: 'stories', route: '/stories/{slug}', dec: ['D3'],
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
   t title, u URL, k route key (opens its page), s one of our suggestions (to confirm until decision d is agreed),
   coll collection entries, count, note, d a decision id, nav 'main' or 'footer', kids children. */

const SITEMAP_ROOT = { t: 'Home', u: '/', k: 'home' };
const SITEMAP = [
    { t: 'Contact', u: '/contact', k: 'contact', nav: 'main' }
];

/* ---------- Background for the panels ----------
   CHANGES: [title, what changed, decision id], since the proposal.
   SOURCE_MAP: [source document or section, where it goes on the site, route to open].
   SOURCE_CHECKS: [title, a discrepancy or gap in the client's documents to fix before launch].
   SITEMAP_DECISIONS and BEFORE_DESIGN: decision ids, for the Sitemap and Decisions panels. */

const CHANGES = [];
const SOURCE_MAP = [];
const SOURCE_CHECKS = [];
const SITEMAP_DECISIONS = [];
const BEFORE_DESIGN = ['D1'];

/* ---------- Glossary ----------
   Words the gw() helper in 06-render.js wraps in the site's tooltip. { word, type, also, def } */

const GLOSSARY = [];
