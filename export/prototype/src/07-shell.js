/* ---------- Shell ---------- */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const STORE = `${PROJECT.key}-prototype-v1`;
const state = Object.assign({
    view: 'wireframes', route: '/', frames: 'both', annotate: true, rail: 'notes',
    journey: JOURNEYS[0]?.id, step: -1, modes: { desktop: 'pinned', mobile: 'swipe' }, entity: MODEL[0]?.id, who: 'all',
    sync: true, notes: false, side: true
}, (() => { try { return JSON.parse(localStorage.getItem(STORE) || '{}'); } catch (e) { return {}; } })());
state.step = -1;
function save() {
    try { localStorage.setItem(STORE, JSON.stringify({ view: state.view, route: state.route, frames: state.frames, annotate: state.annotate, modes: state.modes, entity: state.entity, journey: state.journey, sync: state.sync, notes: state.notes, side: state.side, welcomed: state.welcomed })); } catch (e) { /* storage unavailable */ }
}
const agreedCount = () => DECISIONS.filter(d => d.status === 'agreed').length;

const whoLabel = w => w.map(k => WHO[k]).join(', ');
const pagesFor = id => ROUTES.filter(r => (NOTES[r.key]?.fed || []).includes(id));

/* ---------- Frames ---------- */

const FRAME_DOC = '<!doctype html><html lang="en" class="antialiased"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
    + '<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.3.3/dist/index.global.js"><\/script>'
    + '<style type="text/tailwindcss">' + document.getElementById('frame-css').textContent + '</style>'
    + '</head><body class="flex flex-col min-h-screen bg-white wf-annotate"><div id="app" class="flex flex-col min-h-screen"></div>'
    + '<script>' + document.getElementById('frame-js').textContent + '<\/script>'
    + '</body></html>';

const FR = {
    desktop: { w: 1280, h: 800, s: 1, ready: false, el: null },
    mobile: { w: 390, h: 844, s: 1, ready: false, el: null }
};

function makeFrames() {
    for (const name of Object.keys(FR)) {
        const f = document.createElement('iframe');
        f.name = name;
        f.title = `${name === 'desktop' ? 'Desktop' : 'Mobile'} prototype`;
        f.srcdoc = FRAME_DOC;
        FR[name].el = f;
        $(`#vp-${name}`).appendChild(f);
    }
}

let pendingHighlight = null;
function renderFrame(name, highlight) {
    const f = FR[name];
    if (!f.ready) return;
    const pr = parseRoute(state.route);
    const html = (PAGES[pr.key] || PAGES[ROUTES[0].key])(pr.slug);
    f.el.contentWindow.postMessage({
        type: 'render', html, title: pr.r.title,
        mode: state.modes[name], annotate: state.annotate,
        phase: pr.params.phase ? Number(pr.params.phase) : null,
        highlight: highlight || null, sync: state.sync
    }, '*');
}
function tellFrames(msg) {
    for (const name of Object.keys(FR)) if (FR[name].ready) FR[name].el.contentWindow.postMessage(msg, '*');
}

function navigate(route, opts = {}) {
    state.route = route;
    pendingHighlight = opts.highlight || null;
    save();
    for (const name of Object.keys(FR)) renderFrame(name, opts.highlight);
    $('#url-desktop').textContent = route;
    $('#url-mobile').textContent = route;
    const pr = parseRoute(route);
    $('#page-title').textContent = pr.r.title;
    $('#page-path').textContent = pr.path;
    closeSidebar();
    renderSidebar();
    requestAnimationFrame(layoutFrames);
    if (state.view !== 'wireframes' && !opts.stay) setView('wireframes');
    else renderRail();
}

window.addEventListener('message', e => {
    const name = Object.keys(FR).find(n => FR[n].el && FR[n].el.contentWindow === e.source);
    if (!name) return;
    const m = e.data || {};
    if (m.source !== 'wf-frame') return;
    if (m.type === 'ready') { FR[name].ready = true; renderFrame(name, pendingHighlight); }
    else if (m.type === 'nav') {
        if (state.step >= 0) {
            const next = activeJourney().steps[state.step + 1];
            if (next && parseRoute(next.route).path === parseRoute(m.route).path) { goStep(state.step + 1); return; }
            endJourney(true);
            toast('You’ve left the journey to look around. Pick it up again from the list on the left.');
        }
        navigate(m.route);
    }
    else if (m.type === 'pin') openDecision(m.id);
    else if (m.type === 'external') toast('Links to other websites are switched off in the prototype.');
    else if (m.type === 'inert') toast(`“${m.label}” is a placeholder in the prototype.`);
    else if (m.type === 'download') toast(`Downloads aren’t served in the prototype (${m.href}).`);
    else if (m.type === 'scroll' && state.sync && state.view === 'wireframes') {
        const other = name === 'desktop' ? 'mobile' : 'desktop';
        if (FR[other].ready && !$(`#dev-${other}`).hidden) FR[other].el.contentWindow.postMessage({ type: 'syncScroll', tl: m.tl, idx: m.idx, frac: m.frac, top: m.top }, '*');
    }
});

function layoutFrames() {
    const area = $('#frames-wrap');
    const narrow = window.innerWidth <= 1000;
    const W = area.clientWidth - 32;
    const H = area.clientHeight - 32;
    let show = state.frames;
    // Both frames need room for the phone at 55% and the computer at 30%.
    if (show === 'both' && (narrow || W < 390 * 0.55 + 44 + 1280 * 0.3)) show = 'mobile';
    $('#dev-desktop').hidden = show === 'mobile';
    $('#dev-mobile').hidden = show === 'desktop';
    // During a journey, fade the other device, but only while both are on screen.
    const jd = state.step >= 0 && show === 'both' ? activeJourney().device : null;
    $('#dev-desktop').classList.toggle('dim', jd === 'mobile');
    $('#dev-mobile').classList.toggle('dim', jd === 'desktop');

    const label = 26, bar = 34, phoneChrome = 20 + 30;
    const D = FR.desktop, M = FR.mobile;
    if (!narrow) {
        M.w = 390; M.h = 844;
        const fitH = (H - label - phoneChrome) / M.h;
        M.s = show === 'both'
            ? Math.max(0.55, Math.min(0.8, fitH, (W * 0.4 - 44) / M.w))
            : Math.min(1, Math.max(0.5, fitH));
        const mobileW = show === 'both' ? M.w * M.s + 20 + 24 : 0;
        D.w = 1280;
        D.s = Math.min(1, Math.max(0.3, (W - mobileW) / D.w));
        D.h = Math.min(900, Math.max(640, Math.round((H - label - bar) / D.s)));
    } else {
        M.w = 390; M.h = 780;
        M.s = Math.min(1, (W - 20) / M.w);
        D.w = 1280; D.s = Math.min(1, W / D.w); D.h = 900;
    }
    for (const name of ['desktop', 'mobile']) {
        const f = FR[name];
        if (!f.el) continue;
        f.el.style.width = f.w + 'px';
        f.el.style.height = f.h + 'px';
        f.el.style.transform = `scale(${f.s})`;
        const vp = $(`#vp-${name}`);
        vp.style.width = Math.round(f.w * f.s) + 'px';
        vp.style.height = Math.round(f.h * f.s) + 'px';
        $(`#lab-${name}`).textContent = `${f.w} × ${f.h} · ${Math.round(f.s * 100)}%`;
    }
}

/* ---------- Top bar ---------- */

function setView(v) {
    state.view = v;
    save();
    $$('#views [data-view]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.view === v)));
    $$('.view').forEach(s => { s.hidden = s.id !== `view-${v}`; });
    if (v === 'sitemap') renderSitemap();
    if (v === 'model') renderModel();
    if (v === 'decisions') renderDecisions();
    renderRail();
    if (v === 'wireframes') requestAnimationFrame(layoutFrames);
}

let toastTimer;
function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 3200);
}

/* ---------- Decisions ---------- */

function decisionCard(d, { open = false, locate = true, pagesLinks = true } = {}) {
    const agreed = d.status === 'agreed';
    return `<details class="dec${agreed ? ' agreed' : ''}" id="dec-${d.id}" ${open ? 'open' : ''}>
        <summary><span class="pinnum">${decNum(d.id)}</span><span class="t">${esc(d.title)}${agreed ? ' <span class="state">Agreed</span>' : ''}</span><span class="chev" aria-hidden="true">›</span><span class="who">${agreed ? `Agreed${AGREED_ON ? ` ${AGREED_ON}` : ''}` : `Decides: ${esc(whoLabel(d.who))}`}</span></summary>
        <div class="inner">
            ${agreed ? `<p class="agreed-note"><b>Agreed.</b> ${esc(d.agreed)}</p>` : ''}
            <p class="q">${esc(d.q)}</p>
            ${d.from ? `<p class="from"><b>${esc(PROJECT.fromLabel)}.</b> ${esc(d.from)}</p>` : ''}
            <ol class="opts">${d.options.map((o, i) => `<li class="${i === d.rec ? (agreed ? 'chosen' : 'rec') : ''}"><b>${esc(o[0])}</b><span>${esc(o[1])}</span></li>`).join('')}</ol>
            <p class="why"><b>${agreed ? 'Why' : d.rec === -1 ? 'Why it matters' : 'Why we suggest it'}.</b> ${esc(d.why)}</p>
            ${d.change ? `<p class="portal"><b>If agreed:</b> ${esc(d.change)}</p>` : ''}
            <div class="dec-actions">
                ${locate ? `<button type="button" class="chip-btn" data-locate="${d.id}">Show on the page</button>` : ''}
                ${pagesLinks ? (d.pages || []).map(k => { const r = ROUTES.find(x => x.key === k); return r ? `<button type="button" class="chip-btn" data-go="${sampleRoute(r)}" data-pin-after="${d.id}">${esc(r.title)}</button>` : ''; }).join('') : ''}
            </div>
        </div>
    </details>`;
}

function openDecision(id) {
    if (state.view !== 'wireframes') setView('wireframes');
    if (!state.notes) setNotes(true);
    const el = $(`#dec-${id}`);
    if (!el) return;
    el.open = true;
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
}

/* ---------- Rail ---------- */

function renderRail() {
    const body = $('#rail-body');
    // Page notes fold to a strip; the other views always show their panel.
    const folded = state.view === 'wireframes' && !state.notes;
    $('.body').classList.toggle('notes-off', folded);
    $('#rail').classList.toggle('mini', folded);
    if (state.view !== 'wireframes' || state.step < 0) $$('.device').forEach(d => d.classList.remove('dim'));
    if (folded) body.innerHTML = notesStrip();
    else if (state.view === 'wireframes') body.innerHTML = notesRail();
    else if (state.view === 'sitemap') body.innerHTML = sitemapRail();
    else if (state.view === 'model') body.innerHTML = modelRail();
    else body.innerHTML = decisionsRail();
}

function notesRail() {
    const pr = parseRoute(state.route);
    const n = Object.assign({ purpose: '', aud: [], content: [], decisions: [], consider: [], fed: [] }, NOTES[pr.key]);
    const r = pr.r;
    const onPage = pinsOn(pr);
    const listed = n.decisions.filter(id => DEC[id]);
    const extra = onPage.filter(id => !listed.includes(id)).sort((a, b) => decNum(a) - decNum(b));
    const modeSeg = name => `<div class="seg" data-mode-for="${name}">${['pinned', 'swipe', 'vertical'].map(m => `<button type="button" data-mode="${m}" aria-pressed="${state.modes[name] === m}">${m[0].toUpperCase() + m.slice(1)}</button>`).join('')}</div>`;

    return `<div class="rail-top"><h2 class="side-h">Page notes</h2><button type="button" class="icon-btn tiny" data-notes="close" aria-label="Collapse page notes" title="Collapse page notes">${ICON.panelR}</button></div>
        <div class="rail-head">
            <h2>${esc(r.title)}</h2>
            <p class="path">${esc(r.path)}${r.sample ? `  ·  showing ${esc(pr.slug)}` : ''}</p>
            <div class="badges">
                ${n.badge ? `<span class="badge sugg">${esc(n.badge)}: not in the plan yet</span>` : `<span class="badge">In the sitemap${n.plannedAs ? ` as ${esc(n.plannedAs)}` : ''}</span>`}
                ${n.aud.filter(a => AUD[a]).map(a => `<span class="badge aud" title="${esc(AUD[a][1])}">${AUD[a][0]}</span>`).join('')}
            </div>
        </div>
        ${n.purpose ? `<p class="purpose">${esc(n.purpose)}</p>` : ''}
        ${n.tryit ? `<div class="tryit">
            <h3 style="margin:0">Try the interaction</h3>
            <div class="tryit-row"><span>Desktop frame</span>${modeSeg('desktop')}</div>
            <div class="tryit-row"><span>Mobile frame</span>${modeSeg('mobile')}</div>
            <p class="note-line">Scroll or swipe inside either frame; with scroll sync on, the other follows to the same moment. Filters and the arrow keys work too.</p>
        </div>` : ''}
        ${n.content.length ? `<section>
            <h3>Content to prepare</h3>
            <ul class="content-list">${n.content.map(c => `<li><b>${esc(c[0])}</b>${c[1] ? `<span>${esc(c[1])}</span>` : ''}</li>`).join('')}</ul>
        </section>` : ''}
        ${listed.length || extra.length ? `<section>
            <h3>Decisions on this page</h3>
            ${listed.map(id => decisionCard(DEC[id])).join('')}
            ${extra.length ? `${listed.length ? '<p class="note-line" style="margin:14px 0 8px">Also marked on this page</p>' : ''}${extra.map(id => decisionCard(DEC[id])).join('')}` : ''}
        </section>` : ''}
        ${n.consider.length ? `<section>
            <h3>Considerations</h3>
            <ul class="bullets">${n.consider.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
        </section>` : ''}
        ${n.fed.length ? `<section>
            <h3>Content comes from</h3>
            <div class="chips">${n.fed.map(id => { const e = MODEL.find(m => m.id === id); return e ? `<button type="button" class="chip-btn" data-entity="${id}">${esc(e.name)} <span class="muted">${esc(e.kind.toLowerCase())}</span></button>` : ''; }).join('')}</div>
        </section>` : ''}
        ${SITEWIDE.consider.length ? `<details class="fold">
            <summary>Site-wide: header, footer, menus</summary>
            <div><ul class="bullets">${SITEWIDE.consider.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>
        </details>` : ''}`;
}

// The decisions marked on a page, in its markup.
function pinsOn(pr) {
    const html = (PAGES[pr.key] || PAGES[ROUTES[0].key])(pr.slug);
    return [...new Set([...html.matchAll(/data-pin="(D\d+)"/g)].map(m => m[1]))].filter(id => DEC[id]);
}

function notesStrip() {
    const pr = parseRoute(state.route);
    const ids = new Set([...(NOTES[pr.key]?.decisions || []).filter(id => DEC[id]), ...pinsOn(pr)]);
    const open = [...ids].filter(id => DEC[id].status !== 'agreed').length;
    return `<button type="button" class="fold-tab" data-notes="open" aria-label="Show page notes${open ? `, ${open} open decisions` : ''}" title="Show page notes">
        ${ICON.panelR}<span class="fold-tab-label">Page notes</span>${open ? `<span class="fold-tab-count" title="${open} open decisions on this page">${open}</span>` : ''}
    </button>`;
}

const ICON = {
    mobile: '<svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true"><rect x="2.5" y="1" width="9" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M6 12.5h2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    desktop: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="2" width="13" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M6 14h4M8 11v3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    panel: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="2.5" width="13" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M6 2.5v11" stroke="currentColor" stroke-width="1.4"/></svg>',
    panelR: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="2.5" width="13" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10 2.5v11" stroke="currentColor" stroke-width="1.4"/></svg>',
    chev: '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
const activeJourney = () => JOURNEYS.find(x => x.id === state.journey) || JOURNEYS[0];

const narrowMQ = matchMedia('(max-width: 1000px)');
const sideCollapsed = () => state.side === false && !narrowMQ.matches;

function renderSidebar() {
    const live = state.step >= 0;
    const collapsed = sideCollapsed();
    $('.body').classList.toggle('side-off', collapsed);
    $('#sidebar').classList.toggle('mini', collapsed);
    if (collapsed) {
        $('#side-scroll').innerHTML = `<button type="button" class="fold-tab" data-side="open" aria-label="Show journeys" title="Show journeys">${ICON.panel}<span class="fold-tab-label">Journeys</span></button>`;
        return;
    }
    const journeys = JOURNEYS.map(j => {
        const on = live && j.id === state.journey;
        const open = on && state.jopen !== false;
        return `<li>
            <button type="button" class="jbtn" data-journey="${j.id}" aria-pressed="${on}"${on ? ` aria-expanded="${open}"` : ''}>
                <span class="jicon">${ICON[j.device]}</span>
                <span><b>${esc(j.name)}</b><small>${on && !open ? `Step ${state.step + 1} of ${j.steps.length}: ${esc(j.steps[state.step].t)}` : esc(j.who)}</small></span>
                ${on ? `<span class="jchev">${ICON.chev}</span>` : ''}
            </button>
            ${open ? `<div class="jpanel">
                <dl class="jmeta"><dt>Arrives</dt><dd>${esc(j.arrives)}</dd><dt>Wants to</dt><dd>${esc(j.goal)}</dd><dt>Success</dt><dd>A ${esc(j.measure.toLowerCase())}, counted in Plausible</dd></dl>
                <ol class="steps">${j.steps.map((st, i) => `<li class="${i < state.step ? 'done' : ''}" ${i === state.step ? 'aria-current="step"' : ''}><button type="button" data-step="${i}"><span class="n">${i < state.step ? '✓' : i + 1}</span><span>${esc(st.t)}</span></button>${i === state.step ? `<p class="step-desc">${esc(st.d)}</p>` : ''}</li>`).join('')}</ol>
                <div class="jnav">
                    <button type="button" class="jb-btn" data-jstep="-1" ${state.step === 0 ? 'disabled' : ''}>← Back</button>
                    <button type="button" class="jb-btn primary" data-jstep="1">${state.step === j.steps.length - 1 ? 'Finish' : 'Next →'}</button>
                    <button type="button" class="jend" data-journey-end>End journey</button>
                </div>
            </div>` : ''}
        </li>`;
    }).join('');
    $('#side-scroll').innerHTML = `
        <section>
            <div class="side-hrow"><h2 class="side-h">Follow a journey</h2><button type="button" class="icon-btn tiny side-collapse" data-side="close" aria-label="Collapse the journeys panel" title="Collapse the journeys panel">${ICON.panel}</button></div>
            <p class="side-help">${JOURNEYS.length ? 'See the site the way a particular visitor would, one step at a time.' : 'Journeys appear here once they’re planned.'}</p>
            ${JOURNEYS.length ? `<ul class="jlist">${journeys}</ul>` : ''}
        </section>`;
    const nav = $('#side-scroll .jnav');
    if (nav) nav.scrollIntoView({ block: 'nearest' });
}

function setSide(open) {
    state.side = open;
    save();
    renderSidebar();
    if (state.view === 'wireframes') requestAnimationFrame(layoutFrames);
}
narrowMQ.addEventListener('change', renderSidebar);

function goStep(i) {
    const j = activeJourney();
    const s = j.steps[i];
    if (!s) return;
    if (state.view !== 'wireframes') setView('wireframes');
    state.step = i;
    if (state.frames !== 'both' && state.frames !== j.device) setFrames(j.device);
    if (parseRoute(s.route).path === parseRoute(state.route).path && !s.phase) {
        state.route = s.route;
        tellFrames({ type: 'highlight', sel: s.sel });
        renderSidebar();
        renderRail();
        requestAnimationFrame(layoutFrames);
    } else {
        navigate(s.route, { highlight: s.sel });
    }
}

function endJourney(quiet) {
    if (state.step < 0) return;
    state.step = -1;
    $$('.device').forEach(d => d.classList.remove('dim'));
    if (!quiet) { renderSidebar(); requestAnimationFrame(layoutFrames); }
}

function finishJourney() {
    const j = activeJourney();
    endJourney();
    toast(`Journey complete. On the live site this is counted as a ${j.measure.toLowerCase()} in Plausible.`);
}

/* ---------- Help and the narrow-screen drawer ---------- */

let helpReturn = null;
function openHelp() {
    helpReturn = document.activeElement;
    $('#help').hidden = false;
    $('#help .help-card').focus();
}
function closeHelp() {
    $('#help').hidden = true;
    if (!state.welcomed) { state.welcomed = true; save(); }
    if (helpReturn && helpReturn.focus) helpReturn.focus();
}
function openSidebar() { $('#sidebar').classList.add('open'); $('#scrim').hidden = false; $('#nav-toggle').setAttribute('aria-expanded', 'true'); }
function closeSidebar() { $('#sidebar').classList.remove('open'); $('#scrim').hidden = true; $('#nav-toggle').setAttribute('aria-expanded', 'false'); }

/* ---------- Sitemap ---------- */

function smNode(n, top) {
    const cls = ['node', top ? 'top' : '', n.s ? 's' : '', n.count ? 'c' : ''].join(' ');
    const tags = [
        n.nav === 'main' ? 'main menu' : '', n.nav === 'footer' || n.foot ? 'footer' : '',
        n.count ? `${n.count} ${n.coll ? n.coll.toLowerCase() + ' entries' : 'entries'}` : ''
    ].filter(Boolean);
    const inner = `<span class="nt">${esc(n.t)}</span><span class="nu">${esc(n.u)}</span>${n.note ? `<span class="muted" style="font-size:12px">${esc(n.note)}</span>` : ''}${tags.length ? `<span class="nm">${tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</span>` : ''}${n.d && DEC[n.d] ? `<span class="pinnum" data-open-dec="${n.d}" title="${esc(DEC[n.d].title)}">${decNum(n.d)}</span>` : ''}`;
    const r = n.k ? ROUTES.find(x => x.key === n.k) : null;
    return r ? `<button type="button" class="${cls}" data-go="${sampleRoute(r)}">${inner}</button>` : `<div class="${cls}">${inner}</div>`;
}
function smKids(kids) {
    return `<ul class="sm-kids">${kids.map(k => `<li>${smNode(k)}${k.kids ? smKids(k.kids) : ''}</li>`).join('')}</ul>`;
}
function renderSitemap() {
    $('#view-sitemap').innerHTML = `<div class="canvas">
        <div class="canvas-head">
            <div><h2>Sitemap</h2><p>The pages the site will have, with our suggested additions. Select a page to open it; select a number to read the decision.</p></div>
            <div class="legend">
                <span><i class="sw"></i>Planned</span>
                <span><i class="sw s"></i>Suggested</span>
                <span><i class="sw c"></i>Collection entries</span>
                <span><span class="pinnum" style="min-width:16px;height:16px;font-size:9px">1</span>Decision</span>
            </div>
        </div>
        <div class="scroll-x"><div class="sm">
            <div class="sm-root">${smNode(SITEMAP_ROOT, true)}</div>
            <div class="sm-cols">${SITEMAP.map(c => `<div class="sm-col">${smNode(c, true)}${c.kids ? smKids(c.kids) : ''}</div>`).join('')}</div>
        </div></div>
    </div>`;
}
function sitemapRail() {
    const footer = SITEMAP.flatMap(c => [c, ...(c.kids || [])]).filter(c => c.nav === 'footer' || c.foot);
    return `
        <div class="rail-head"><h2>About the sitemap</h2><p class="purpose" style="font-size:14px">${esc(PROJECT.sitemapIntro)}</p></div>
        <section><h3>Menus</h3>
            <div class="navs">
                <div><p style="font-weight:600;margin-bottom:6px">Main</p><ol>${NAV.map(n => `<li>${esc(n.t)}${n.kids ? ' ▾' : ''}</li>`).join('')}</ol></div>
                <div><p style="font-weight:600;margin-bottom:6px">Footer</p><ol>${(FOOTER_NAV.length ? FOOTER_NAV.map(l => l[0]) : footer.map(c => c.t)).map(t => `<li>${esc(t)}</li>`).join('')}</ol></div>
            </div>
        </section>
        ${SOURCE_MAP.length ? `<section><h3>Where the source documents go</h3>${sourceMap()}</section>` : ''}
        ${CHANGES.length ? `<section><h3>What changed since the proposal</h3>${changesList()}</section>` : ''}
        ${SITEMAP_DECISIONS.length ? `<section><h3>Sitemap decisions</h3>${SITEMAP_DECISIONS.filter(id => DEC[id]).map(id => decisionCard(DEC[id], { locate: false })).join('')}</section>` : ''}`;
}
function sourceMap() {
    return `<ul class="changes">${SOURCE_MAP.map(r => `<li><b>${esc(r[0])}</b><span>${esc(r[1])}</span>${r[2] ? `<button type="button" class="chip-btn" data-go="${r[2]}" style="grid-row:1/span 2">Open</button>` : ''}</li>`).join('')}</ul>`;
}
function sourceChecks() {
    return `<ul class="changes">${SOURCE_CHECKS.map(c => `<li><b>${esc(c[0])}</b><span>${esc(c[1])}</span></li>`).join('')}</ul>`;
}
function changesList() {
    return `<ul class="changes">${CHANGES.map(c => `<li><b>${esc(c[0])}</b><span>${esc(c[1])}</span><button type="button" data-open-dec="${c[2]}" aria-label="Decision ${decNum(c[2])}"><span class="pinnum">${decNum(c[2])}</span></button></li>`).join('')}</ul>`;
}

/* ---------- Content model ---------- */

function renderModel() {
    const card = e => `<button type="button" class="ent ${e.status === 'suggested' ? 's' : e.status === 'built' ? 'b' : ''}" style="grid-area:${e.area}" data-ent="${e.id}" aria-pressed="${state.entity === e.id}">
        <span class="ent-h">
            <span class="ent-k"><span>${e.kind}</span><span>${esc(e.count)}</span></span>
            <span class="ent-n">${esc(e.name)} ${(e.dec || []).map(id => `<span class="pinnum">${decNum(id)}</span>`).join('')}</span>
            <span class="mono muted" style="font-size:11px">${esc(e.handle)}${e.route ? ` · ${esc(e.route)}` : ''}</span>
        </span>
        <ul class="ent-f">${e.fields.map(f => `<li class="${f[2] || ''}"><span class="fn">${esc(f[0])}</span><span class="ft">${esc(f[1])}</span></li>`).join('')}</ul>
        ${e.terms ? `<span class="ent-t">${esc(e.terms)}</span>` : ''}
    </button>`;
    $('#view-model').innerHTML = `<div class="canvas">
        <div class="canvas-head">
            <div><h2>Content model</h2><p>The collections, taxonomies, forms and globals behind the site, with the fields we suggest adding. Select one to see where it appears and what it depends on.</p></div>
            <div class="legend">
                <span><i class="sw"></i>Planned</span>
                <span><i class="sw b"></i>Already built</span>
                <span><i class="sw s"></i>Suggested</span>
                <span><span class="mono" style="color:var(--sugg-line)">+ field</span>suggested field</span>
                <span><span class="mono" style="color:var(--drop);text-decoration:line-through">field</span>drop</span>
            </div>
        </div>
        ${MODEL.length ? `<div class="model" id="model" style="grid-template-areas:${esc(MODEL_LAYOUT)}"><svg aria-hidden="true" id="model-svg"></svg>${MODEL.map(card).join('')}</div>` : '<p class="note-line">No content model yet.</p>'}
    </div>`;
    requestAnimationFrame(drawRels);
}

function drawRels() {
    const wrap = $('#model'), svg = $('#model-svg');
    if (!wrap || !svg || getComputedStyle(svg).display === 'none') return;
    const box = wrap.getBoundingClientRect();
    const rect = id => { const r = $(`[data-ent="${id}"]`, wrap).getBoundingClientRect(); return { l: r.left - box.left, t: r.top - box.top, r: r.right - box.left, b: r.bottom - box.top, cx: (r.left + r.right) / 2 - box.left, cy: (r.top + r.bottom) / 2 - box.top }; };
    const sel = state.entity;
    let out = '';
    RELS.forEach(([a, b, label, sug]) => {
        const A = rect(a), B = rect(b);
        const dx = B.cx - A.cx, dy = B.cy - A.cy;
        let x1, y1, x2, y2, d;
        const sameRow = Math.abs(dy) < Math.min(A.b - A.t, B.b - B.t) / 2 && Math.abs(A.t - B.t) < 40;
        if (sameRow || (Math.abs(dx) > Math.abs(dy) * 1.6)) {
            x1 = dx > 0 ? A.r : A.l; x2 = dx > 0 ? B.l : B.r;
            y1 = Math.min(A.b - 20, Math.max(A.t + 20, (B.t + B.b) / 2));
            y2 = Math.min(B.b - 20, Math.max(B.t + 20, y1));
            const mx = (x1 + x2) / 2;
            d = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
        } else {
            y1 = dy > 0 ? A.b : A.t; y2 = dy > 0 ? B.t : B.b;
            x1 = Math.abs(dx) < 40 ? A.cx : (dx > 0 ? A.l + (A.r - A.l) * 0.8 : A.l + (A.r - A.l) * 0.2);
            x2 = Math.abs(dx) < 40 ? B.cx : (dx > 0 ? B.l + (B.r - B.l) * 0.25 : B.l + (B.r - B.l) * 0.75);
            const my = (y1 + y2) / 2;
            d = `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`;
        }
        const on = sel === a || sel === b;
        out += `<path d="${d}" class="${sug ? 's' : ''} ${on ? 'on' : ''}"/>`;
        out += `<text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 + 4}" text-anchor="middle" class="${on ? 'on' : ''}">${esc(label)}</text>`;
    });
    svg.innerHTML = out;
    const related = new Set([sel]);
    RELS.forEach(([a, b]) => { if (a === sel) related.add(b); if (b === sel) related.add(a); });
    $$('.ent', wrap).forEach(el => { el.classList.toggle('dim', !!sel && !related.has(el.dataset.ent)); el.setAttribute('aria-pressed', String(el.dataset.ent === sel)); });
}

// A relationship as a sentence: a taxonomy reads "Stories uses the Story type taxonomy".
function relSentence(r, a, b) {
    return r[2] === 'taxonomy' ? `${esc(a.name)} uses the ${esc(b.name)} taxonomy` : `${esc(a.name)} ${esc(r[2])} ${esc(b.name)}`;
}

function modelRail() {
    const e = MODEL.find(m => m.id === state.entity) || MODEL[0];
    if (!e) return '<div class="rail-head"><h2>Content model</h2><p class="purpose" style="font-size:14px">Nothing here yet.</p></div>';
    const rels = RELS.filter(r => r[0] === e.id || r[1] === e.id);
    const pages = pagesFor(e.id);
    return `
        <div class="rail-head">
            <p class="mono muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.06em">${e.kind} · ${esc(e.handle)}</p>
            <h2>${esc(e.name)}</h2>
            <div class="badges">
                <span class="badge ${e.status === 'suggested' ? 'sugg' : e.status === 'built' ? 'built' : ''}">${e.status === 'suggested' ? 'Suggested' : e.status === 'built' ? 'Already built' : 'Planned'}</span>
                ${e.count ? `<span class="badge">${esc(e.count)}${/^[~\d]/.test(e.count) ? (e.kind === 'Taxonomy' ? ' terms' : ' entries') : ''}</span>` : ''}
                ${e.route ? `<span class="badge mono" style="font-size:11px">${esc(e.route)}</span>` : ''}
            </div>
        </div>
        <section><h3>Fields</h3><table class="ftable">${e.fields.map(f => `<tr class="${f[2] || ''}"><td>${f[2] === 's' ? '+ ' : ''}${esc(f[0])}</td><td>${esc(f[1])}${f[3] ? ` <span class="pinnum" style="min-width:18px;height:18px;font-size:10px">${decNum(f[3])}</span>` : ''}</td></tr>`).join('')}</table>
            ${e.terms ? `<p class="note-line" style="margin-top:10px">${esc(e.terms)}</p>` : ''}</section>
        ${rels.length ? `<section><h3>Relationships</h3><ul class="bullets">${rels.map(r => { const other = MODEL.find(m => m.id === (r[0] === e.id ? r[1] : r[0])); return `<li>${r[0] === e.id ? relSentence(r, e, other) : relSentence(r, other, e)}${r[3] ? ' (suggested)' : ''}</li>`; }).join('')}</ul></section>` : ''}
        ${pages.length ? `<section><h3>Appears on</h3><div class="chips">${pages.map(r => `<button type="button" class="chip-btn" data-go="${sampleRoute(r)}">${esc(r.title)}</button>`).join('')}</div></section>` : ''}
        ${(e.dec || []).filter(id => DEC[id]).length ? `<section><h3>Decisions</h3>${e.dec.filter(id => DEC[id]).map(id => decisionCard(DEC[id], { locate: false })).join('')}</section>` : ''}
        ${CHANGES.length ? `<details class="fold"><summary>What changed since the proposal</summary><div>${changesList()}</div></details>` : ''}
        ${SOURCE_CHECKS.length ? `<details class="fold"><summary>Checked against the source documents</summary><div>${sourceChecks()}</div></details>` : ''}`;
}

/* ---------- Decisions view ---------- */

function renderDecisions() {
    const list = DECISIONS.filter(d => state.who === 'all' || d.who.includes(state.who));
    $('#view-decisions').innerHTML = `<div class="canvas">
        <div class="canvas-head">
            <div><h2>Decisions</h2><p>${DECISIONS.length ? `Every question the prototype raises, with the options and what we suggest. ${agreedCount()} are agreed; the rest are open. Numbers match the markers on the pages.` : 'Questions to settle appear here as the prototype raises them, each with its options and what we suggest.'}</p></div>
            <div class="seg" id="who-pick">${[['all', 'All']].concat(Object.entries(WHO)).map(([k, v]) => `<button type="button" data-who="${k}" aria-pressed="${state.who === k}">${esc(v)}</button>`).join('')}</div>
        </div>
        <div class="dgrid">${list.map(d => decisionCard(d, { open: d.status !== 'agreed', locate: false })).join('')}</div>
    </div>`;
}
function decisionsRail() {
    const counts = Object.entries(WHO).map(([k, v]) => [v, DECISIONS.filter(d => d.who.includes(k)).length]);
    const agreed = DECISIONS.filter(d => d.status === 'agreed');
    const before = BEFORE_DESIGN.filter(id => DEC[id]);
    return `
        <div class="rail-head"><h2>${DECISIONS.length ? `${DECISIONS.length} decisions, ${agreedCount()} agreed` : 'No decisions yet'}</h2>${PROJECT.decisionsIntro ? `<p class="purpose" style="font-size:14px">${esc(PROJECT.decisionsIntro)}</p>` : ''}</div>
        ${agreed.length ? `<section><h3>Agreed</h3><ul class="changes">${agreed.map(d => `<li><b>${esc(d.title)}</b><span>${esc(d.agreed)}</span><button type="button" data-open-dec="${d.id}" aria-label="Decision ${decNum(d.id)}"><span class="pinnum">${decNum(d.id)}</span></button></li>`).join('')}</ul></section>` : ''}
        ${before.length ? `<section><h3>Needed before design starts</h3><ul class="bullets">${before.map(id => `<li>${esc(DEC[id].title)} (${decNum(id)})</li>`).join('')}</ul></section>` : ''}
        ${DECISIONS.length ? `<section><h3>Who decides</h3><div class="counts">${counts.map(c => `<span>${esc(c[0])}</span><b>${c[1]}</b>`).join('')}</div></section>` : ''}
        ${SOURCE_CHECKS.length ? `<section><h3>Checked against the source documents</h3><p class="note-line" style="margin-bottom:10px">Things to fix in the client's documents before they reach the site.</p>${sourceChecks()}</section>` : ''}
        ${CHANGES.length ? `<section><h3>What changed since the proposal</h3>${changesList()}</section>` : ''}`;
}

/* ---------- Events ---------- */

document.addEventListener('click', e => {
    const t = e.target.closest('button, [data-open-dec]');
    if (!t) return;
    if (t.id === 'help-open') { openHelp(); return; }
    if (t.id === 'help-close' || t.id === 'help-done') { closeHelp(); return; }
    if (t.id === 'nav-toggle') { $('#sidebar').classList.contains('open') ? closeSidebar() : openSidebar(); return; }
    if (t.hasAttribute('data-journey-end')) { endJourney(); return; }
    if (t.dataset.view) { setView(t.dataset.view); return; }
    if (t.dataset.frames) { setFrames(t.dataset.frames); return; }
    if (t.dataset.openDec) { e.preventDefault(); e.stopPropagation(); openDecision(t.dataset.openDec); return; }
    if (t.dataset.go) { endJourney(true); navigate(t.dataset.go, t.dataset.pinAfter ? { highlight: `[data-pin="${t.dataset.pinAfter}"]` } : {}); return; }
    if (t.dataset.locate) {
        const id = t.dataset.locate;
        const html = PAGES[parseRoute(state.route).key](parseRoute(state.route).slug);
        if (html.includes(`data-pin="${id}"`)) tellFrames({ type: 'highlight', sel: `[data-pin="${id}"]` });
        else { const r = ROUTES.find(x => x.key === (DEC[id].pages || [])[0]); if (r) navigate(sampleRoute(r), { highlight: `[data-pin="${id}"]` }); }
        return;
    }
    if (t.dataset.entity) { state.entity = t.dataset.entity; setView('model'); return; }
    if (t.dataset.ent) { state.entity = t.dataset.ent; save(); drawRels(); renderRail(); return; }
    if (t.dataset.who) { state.who = t.dataset.who; renderDecisions(); return; }
    if (t.dataset.side) { setSide(t.dataset.side === 'open'); return; }
    if (t.dataset.notes) { setNotes(t.dataset.notes === 'open'); return; }
    if (t.dataset.journey) {
        // The active journey's row opens and closes its steps.
        if (state.step >= 0 && state.journey === t.dataset.journey) { state.jopen = state.jopen === false; renderSidebar(); return; }
        state.journey = t.dataset.journey; state.jopen = true; save(); goStep(0); return;
    }
    if (t.dataset.step) { goStep(Number(t.dataset.step)); return; }
    if (t.dataset.jstep) {
        const next = state.step + Number(t.dataset.jstep);
        if (next >= activeJourney().steps.length) finishJourney(); else goStep(Math.max(0, next));
        return;
    }
    if (t.dataset.mode) {
        const name = t.closest('[data-mode-for]').dataset.modeFor;
        state.modes[name] = t.dataset.mode;
        save();
        if (FR[name].ready) FR[name].el.contentWindow.postMessage({ type: 'mode', mode: t.dataset.mode }, '*');
        $$(`[data-mode-for="${name}"] button`).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === t.dataset.mode)));
        return;
    }
});

$('#scrim').addEventListener('click', closeSidebar);
$('#help').addEventListener('click', e => { if (e.target.id === 'help') closeHelp(); });
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (!$('#help').hidden) closeHelp(); else closeSidebar(); return; }
    if (state.step < 0 || !$('#help').hidden || e.target.closest('input, select, textarea, [contenteditable]')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); const next = state.step + 1; if (next >= activeJourney().steps.length) finishJourney(); else goStep(next); }
    if (e.key === 'ArrowLeft' && state.step > 0) { e.preventDefault(); goStep(state.step - 1); }
});

function setFrames(f) {
    state.frames = f;
    save();
    $$('#frame-pick [data-frames]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.frames === f)));
    layoutFrames();
}

$('#sync').addEventListener('change', e => {
    state.sync = e.target.checked;
    save();
    tellFrames({ type: 'sync', on: state.sync });
});

function setNotes(on) {
    state.notes = on;
    save();
    renderRail();
    if (state.view === 'wireframes') requestAnimationFrame(layoutFrames);
    if (on) $('#rail').scrollTop = 0;
}

$('#annotate').addEventListener('change', e => {
    state.annotate = e.target.checked;
    save();
    tellFrames({ type: 'annotate', on: state.annotate });
});

/* ---------- Start ---------- */

document.title = `${PROJECT.name} prototype`;
$('#brand-name').textContent = PROJECT.name;
$('#brand-sub').textContent = PROJECT.subtitle;
$('#prepared').textContent = PROJECT.prepared;
if (!AGENCY.url) { $('.agency').removeAttribute('href'); $('.agency').removeAttribute('target'); }
$('#dec-count').textContent = DECISIONS.length ? `${DECISIONS.length - agreedCount()} open` : '';
$('#sync').checked = state.sync;
$('#annotate').checked = state.annotate;
renderSidebar();
makeFrames();
setFrames(state.frames);
new ResizeObserver(() => { if (state.view === 'wireframes') layoutFrames(); if (state.view === 'model') drawRels(); }).observe($('#stage'));
new ResizeObserver(() => { if (state.view === 'wireframes') layoutFrames(); }).observe($('#frames-wrap'));
const startView = state.view;
navigate(state.route || '/', { stay: true });
setView(startView);
if (!state.welcomed) openHelp();
