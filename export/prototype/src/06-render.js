/* ---------- Site markup, rendered into both frames ----------
   The site's own Tailwind classes and tokens (03-frame.css), so a page reads like the kit's blocks.
   Each page is a function in PAGES that returns markup; ROUTES gives it a URL. Mark anything a journey step
   or a decision points at with data-j="…", and put a decision's marker beside it with pin('D1'). */

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const decNum = id => id.replace('D', '');

function pin(id, corner) {
    const d = DEC[id];
    if (!d) return '';
    const agreed = d.status === 'agreed';
    return `<span class="wf-pin${agreed ? ' wf-pin--agreed' : ''}${corner ? ' wf-pin--corner' : ''}" data-pin="${id}" role="button" tabindex="0" aria-label="Decision ${decNum(id)}${agreed ? ' (agreed)' : ''}: ${esc(d.title)}">${decNum(id)}</span>`;
}
function flag(text) { return `<span class="wf-flag">${esc(text)}</span>`; }
function img(label, ratio = '3/2', cls = '') {
    return `<div class="wf-img ${cls}" style="aspect-ratio:${ratio}"><span>${esc(label)}</span></div>`;
}
function gw(word, text) {
    const g = GLOSSARY.find(x => x.word === word) || { word, def: '' };
    return `<span class="glossary-word"><button type="button" class="glossary-word__trigger" aria-expanded="false">${esc(text || g.word)}</button><span class="glossary-word__panel" role="tooltip"><span class="glossary-word__term">${esc(g.word)}${g.type ? ` <span class="glossary-word__type">${esc(g.type)}</span>` : ''}</span>${g.also ? `<span class="glossary-word__alternatives">Also: ${esc(g.also)}</span>` : ''}<span>${esc(g.def)}</span></span></span>`;
}
function btn(label, href, style = 'primary') {
    if (style === 'inline') return `<a class="btn-inline" href="${href}"><span>${esc(label)}</span></a>`;
    return `<a class="btn btn-${style}" href="${href}"><span>${esc(label)}</span></a>`;
}
function crumbs(items) {
    return `<nav class="breadcrumbs" aria-label="Breadcrumb">${items.map((c, i) => i < items.length - 1 ? `<a href="${c[1]}">${esc(c[0])}</a><span aria-hidden="true">/</span>` : `<span aria-current="page">${esc(c[0])}</span>`).join('')}</nav>`;
}
function sectionHead(h, sub, extra = '') {
    return `<header class="span-content flex flex-col gap-2 mb-8">
        <h2>${h}${extra}</h2>${sub ? `<p class="text-gray-600 max-w-[60ch]">${sub}</p>` : ''}
    </header>`;
}
function statTiles(items, cls = 'md:grid-cols-4') {
    return `<ul class="grid gap-6 grid-cols-2 ${cls}">${items.map(s => `<li class="flex flex-col gap-2 border-t-2 border-current pt-4"><span class="stat">${s[0]}</span><span class="text-sm">${s[1]}</span>${s[2] ? `<span class="text-xs opacity-70">Source: ${s[2]}</span>` : ''}</li>`).join('')}</ul>`;
}
function shareRow(pins = '') {
    return `<div class="flex flex-wrap items-center gap-2" data-j="share">
        <span class="text-xs font-bold mr-1">Share</span>
        <a class="chip lg:hidden" href="#share">Share…</a><a class="chip" href="#share">Copy link</a><a class="chip" href="#share">Facebook</a><a class="chip" href="#share">LinkedIn</a><a class="chip" href="#share">Email</a>
        ${pins}
    </div>`;
}

function pageHeader({ crumbs: c, eyebrow, title, lede, actions = '', aside = '', badge = '', pins = '' }) {
    return `<section class="fluid-grid pt-8 md:pt-14 relative" data-j="page-header">
        <div class="span-content ${aside ? 'lg:col-start-[content-start] lg:col-span-7' : 'lg:col-start-[content-start] lg:col-span-9'} flex flex-col gap-4">
            ${badge ? flag(badge) : ''}
            ${c ? crumbs(c) : ''}
            ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}
            <h1>${title}${pins}</h1>
            ${lede ? `<p class="lede max-w-[40ch]">${lede}</p>` : ''}
            ${actions ? `<div class="flex flex-wrap gap-3 mt-2">${actions}</div>` : ''}
        </div>
        ${aside ? `<div class="span-content mt-8 lg:mt-0 lg:col-start-[col-9] lg:col-span-4 lg:row-start-1 self-end">${aside}</div>` : ''}
    </section>`;
}

/* ---------- Header and footer ----------
   NAV: { t: 'Menu item', r: '/url', keys: [route keys it is current for], kids: [['Child', '/url']] }
   FOOTER_NAV: ['Link', '/url'] */

const NAV = [
    { t: 'Contact', r: '/contact', keys: ['contact'] }
];
const FOOTER_NAV = [
    ['Contact', '/contact'],
    ['Privacy policy', '#privacy']
];

function siteHeader(key) {
    const desktop = NAV.map(n => {
        const on = n.keys.includes(key) ? 'underline decoration-2 underline-offset-8' : '';
        if (!n.kids) return `<li><a class="text-sm font-bold ${on}" href="#${n.r}"${n.keys.includes(key) ? ' aria-current="page"' : ''}>${n.t}</a></li>`;
        return `<li class="relative" data-dd>
            <a class="flex items-center gap-1 text-sm font-bold ${on}" href="#" data-dd-toggle aria-expanded="false">${n.t}<span aria-hidden="true" class="text-xs">▾</span></a>
            <ul hidden data-dd-menu class="absolute right-0 mt-3 py-2 px-4 bg-white border border-(--border-colour) shadow-sm min-w-64 z-40">
                ${n.kids.map(k => `<li><a class="block py-2 text-xs font-bold whitespace-nowrap" href="#${k[1]}">${k[0]}</a></li>`).join('')}
            </ul>
        </li>`;
    }).join('');
    const mobile = NAV.map(n => `<li><a class="block py-2 text-lg font-bold" href="#${n.r}">${n.t}</a>${n.kids ? `<ul class="pl-4 pb-2">${n.kids.slice(1).map(k => `<li><a class="block py-1.5 text-sm" href="#${k[1]}">${k[0]}</a></li>`).join('')}</ul>` : ''}</li>`).join('');
    return `<header class="fluid-grid py-4 border-b border-(--border-colour) bg-white relative z-40" data-j="header">
        <div class="span-content flex justify-between items-center gap-6">
            <a class="wf-logo" href="#/">${esc(PROJECT.name)}</a>
            <nav class="hidden lg:block" aria-label="Main"><ul class="flex items-center gap-x-6">${desktop}</ul></nav>
        </div>
    </header>
    <nav class="lg:hidden" aria-label="Main">
        <button type="button" data-mnav-toggle class="fixed bottom-0 right-0 z-50 flex items-center justify-center w-16 h-16 mr-6 mb-6 text-xs font-bold text-white rounded-sm bg-primary shadow-lg" aria-expanded="false">Menu</button>
        <div hidden data-mnav-panel class="fixed inset-0 z-40 px-8 pt-8 pb-28 flex flex-col justify-end bg-white overflow-auto">
            <ul class="flex flex-col">${mobile}</ul>
        </div>
    </nav>`;
}

function siteFooter() {
    return `<footer class="fluid-grid mt-auto bg-dark text-white py-12" data-j="footer">
        <div class="span-content grid gap-10 md:grid-cols-12">
            <div class="md:col-span-6 flex flex-col gap-4">
                <span class="wf-logo">${esc(PROJECT.name)}</span>
                <p class="text-sm text-gray-300">[A line about the organisation, from Site Details.]</p>
            </div>
            <nav class="md:col-span-6" aria-label="Footer">
                <ul class="flex flex-col gap-2 text-sm">${FOOTER_NAV.map(l => `<li><a class="underline underline-offset-4" href="${l[1].startsWith('/') ? '#' + l[1] : l[1]}">${esc(l[0])}</a></li>`).join('')}</ul>
            </nav>
        </div>
        <div class="span-content mt-10 pt-4 border-t border-white/20 flex flex-col md:flex-row gap-2 md:justify-between text-xs text-gray-300">
            <span>© [Year] [Organisation]</span>
            <span>Build by ${AGENCY.url ? `<a class="underline underline-offset-4" href="${esc(AGENCY.url)}">${esc(AGENCY.name)}</a>` : esc(AGENCY.name)}</span>
        </div>
    </footer>`;
}

function page(key, inner) {
    return `${siteHeader(key)}<main id="content" class="pb-16 md:pb-24 stack-block flex-1">${inner}</main>${siteFooter()}`;
}

/* ---------- Pages ---------- */

const PAGES = {};

// Until the prototype is drawn, every page says so rather than guessing at its content. Replace these with
// pages built from page(key, inner), the helpers above, and the site's own markup.
function coming(title) {
    return `<main id="content" class="fluid-grid flex-1 content-center py-24" data-j="coming">
        <div class="span-content flex flex-col items-center gap-4 text-center">
            <p class="eyebrow">${esc(title)}</p>
            <h1>The prototype is coming</h1>
            <p class="lede max-w-[40ch]">This page will be drawn here once its content is planned.</p>
        </div>
    </main>`;
}

PAGES.home = () => coming('Home');
PAGES.contact = () => coming('Contact');

/* ---------- Routing ----------
   group: 'Pages', 'Suggested' or 'Entry templates'. A route with :slug renders the page for `sample`. */

const ROUTES = [
    { key: 'home', path: '/', title: 'Home', group: 'Pages' },
    { key: 'contact', path: '/contact', title: 'Contact', group: 'Pages' }
];

function sampleRoute(r) {
    return r.sample ? r.path.replace(':slug', r.sample) : r.path;
}

function parseRoute(route) {
    const [path, qs] = String(route || '/').split('?');
    const params = Object.fromEntries(new URLSearchParams(qs || ''));
    const segs = path.split('/').filter(Boolean);
    for (const r of ROUTES) {
        const rs = r.path.split('/').filter(Boolean);
        if (rs.length !== segs.length) continue;
        let slug = null, ok = true;
        rs.forEach((s, i) => { if (s === ':slug') slug = segs[i]; else if (s !== segs[i]) ok = false; });
        if (ok) return { r, key: r.key, slug, params, path };
    }
    return { r: ROUTES[0], key: ROUTES[0].key, slug: null, params, path: ROUTES[0].path };
}
