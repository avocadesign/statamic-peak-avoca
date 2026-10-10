/* ---------- This site's pages ----------
   Its header and footer as the prototype draws them, its pages and its routes. The helpers they use, such as
   pageHeader(), img(), btn() and coming(), come from the add-on: a function of the same name defined here
   replaces the add-on's. Placeholder copy goes in [square brackets].

   Backgrounds: white, light and medium greys, and darkish greys down to about gray-700. Nothing darker, the Dark
   scheme included: the interface around the frames is near-black, and a dark band there makes the page seem to end.
   The recipe's prototype section says more. */

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


PAGES.home = () => coming('Home');
PAGES.contact = () => coming('Contact');

/* ---------- Routing ----------
   group: 'Pages', 'Suggested' or 'Entry templates'. A route with :slug renders the page for `sample`. */

const ROUTES = [
    { key: 'home', path: '/', title: 'Home', group: 'Pages' },
    { key: 'contact', path: '/contact', title: 'Contact', group: 'Pages' }
];
