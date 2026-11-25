// .mer(made). — one renderer for build (node), live (Netlify function) and the admin preview (browser).
import { LOGO } from './logo.mjs';
import { CSS, JS, HEADJS } from './inline.mjs';

const PAGES = {
  home: { el: '', en: 'en/' },
  sessions: { el: 'synedries/', en: 'en/sessions/' },
  blog: { el: 'blog/', en: 'en/blog/' },
  privacy: { el: 'aporrito/', en: 'en/privacy/' },
};
export function pathFor(page, lang, slug) {
  if (page === 'post') return (lang === 'en' ? 'en/blog/' : 'blog/') + slug + '/';
  return PAGES[page][lang];
}
export function routes(state) {
  const out = [];
  for (const lang of ['el', 'en']) {
    for (const page of Object.keys(PAGES)) out.push({ page, lang, path: pathFor(page, lang) });
    for (const p of visiblePosts(state)) out.push({ page: 'post', lang, slug: p.slug, path: pathFor('post', lang, p.slug) });
  }
  return out;
}
export function matchRoute(state, pathname) {
  let p = pathname.replace(/^\/+/, '').replace(/index\.html$/, '');
  if (p && !p.endsWith('/')) p += '/';
  return routes(state).find((r) => r.path === p) || null;
}
export function visiblePosts(state) {
  return (state.posts || []).filter((p) => !p.hidden && p.slug).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (s) => String(s ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const MONTHS = {
  el: ['Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου', 'Απριλίου', 'Μαΐου', 'Ιουνίου', 'Ιουλίου', 'Αυγούστου', 'Σεπτεμβρίου', 'Οκτωβρίου', 'Νοεμβρίου', 'Δεκεμβρίου'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
function fmtDate(d, lang) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || '');
  if (!m) return '';
  const day = +m[3], mo = MONTHS[lang][+m[2] - 1];
  return lang === 'el' ? `${day} ${mo} ${m[1]}` : `${mo} ${day}, ${m[1]}`;
}
function minutes(html) { return Math.max(1, Math.ceil(strip(html).split(' ').length / 200)); }

// ---------- logo ----------
const MARK_VB = '440 228 452 490', WORD_VB = '240 735 852 165', TAG_VB = '415 922 495 46';
const COL = { ring: 'var(--lg-c)', horizon: 'var(--lg-c)', spine: 'var(--lg-c)', dot: 'var(--lg-d)', leaf: 'var(--lg-l)', word: 'var(--lg-w)', tag: 'var(--lg-t)' };
function logoDefs() {
  const sym = (k, vb) => `<symbol id="lg-${k}" viewBox="${vb}"><path style="fill:${COL[k]}" d="${LOGO[k]}"/></symbol>`;
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>${['ring', 'horizon', 'spine', 'leaf', 'dot'].map((k) => sym(k, MARK_VB)).join('')}${sym('word', WORD_VB)}${sym('tag', TAG_VB)}<symbol id="lg-mark" viewBox="${MARK_VB}">${['ring', 'horizon', 'spine', 'leaf', 'dot'].map((k) => `<path style="fill:${COL[k]}" d="${LOGO[k]}"/>`).join('')}</symbol></defs></svg>`;
}
const LAYERS = [['ring', -7], ['horizon', 0], ['spine', 0.2], ['leaf', 6], ['dot', 11]];
function mark3d(cls = '', extrude = 0) {
  let l = '';
  for (const [k, z] of LAYERS) {
    if (extrude && k !== 'dot' && k !== 'leaf') {
      for (let i = extrude; i >= 1; i--) l += `<svg class="m3-l m3-x" style="--z:${z - i * 0.55}" viewBox="0 0 452 490" aria-hidden="true"><use href="#lg-${k}"/></svg>`;
    }
    if (extrude && k === 'leaf') l += `<svg class="m3-l m3-x" style="--z:${z - 0.6}" viewBox="0 0 452 490" aria-hidden="true"><use href="#lg-leaf"/></svg>`;
    l += `<svg class="m3-l m3-${k}" style="--z:${z}" viewBox="0 0 452 490" aria-hidden="true"><use href="#lg-${k}"/></svg>`;
  }
  return `<span class="m3 ${cls}"><span class="m3-in">${l}</span></span>`;
}
const wordmark = (cls = '') => `<svg class="wm ${cls}" viewBox="0 0 852 165" role="img" aria-label=".mer(made)."><use href="#lg-word"/></svg>`;
const tagline = (cls = '') => `<svg class="tg ${cls}" viewBox="0 0 495 46" role="img" aria-label="Be you again"><use href="#lg-tag"/></svg>`;

const FLAG = {
  el: '<svg viewBox="0 0 27 18" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="27" height="18" fill="#0D5EAF"/><g fill="#fff"><rect y="2" width="27" height="2"/><rect y="6" width="27" height="2"/><rect y="10" width="27" height="2"/><rect y="14" width="27" height="2"/></g><rect width="10" height="10" fill="#0D5EAF"/><rect x="4" width="2" height="10" fill="#fff"/><rect y="4" width="10" height="2" fill="#fff"/></svg>',
  en: '<svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><clipPath id="ukc"><path d="M0,0 v30 h60 v-30 z"/></clipPath><clipPath id="ukt"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath><g clip-path="url(#ukc)"><path d="M0,0 v30 h60 v-30 z" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#ukt)" stroke="#C8102E" stroke-width="4"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/></g></svg>',
};

// ---------- main ----------
export function render(state, route, opts = {}) {
  const base = opts.base ?? '/';
  const edit = !!opts.edit;
  const { page, lang } = route;
  const o = lang === 'el' ? 'en' : 'el';
  const S = state.settings || {};
  const tx = (k, l = lang) => { const v = state.t[k]; if (!v) return ''; return (v[l] ?? '') !== '' ? v[l] : (v.el || v.en || ''); };
  const E = (tag, k, cls = '', attrs = '') => `<${tag}${cls ? ` class="${cls}"` : ''} data-k="${k}"${attrs ? ' ' + attrs : ''}>${tx(k)}</${tag}>`;
  const url = (p) => base + p;
  const asset = (src) => (!src ? '' : /^(data:|https?:|\/)/.test(src) ? src : base + src);
  const link = (pg, slug) => url(pathFor(pg, lang, slug));
  const IMG = (key, { cls = '', sizes = '100vw', eager = false, view = true } = {}) => {
    const im = state.img[key];
    if (!im) return '';
    const ss = im.srcset && im.srcset.length ? ` srcset="${im.srcset.map(([w, p]) => `${asset(p)} ${w}w`).join(', ')}" sizes="${sizes}"` : '';
    const alt = esc(strip((im.alt && (im.alt[lang] || im.alt.el)) || ''));
    return `<img${cls ? ` class="${cls}"` : ''} data-i="${key}"${view ? ' data-view' : ''} src="${esc(asset(im.src))}"${ss} width="${im.w}" height="${im.h}" alt="${alt}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;
  };
  const ratio = (key) => { const im = state.img[key]; return im ? `${im.w} / ${im.h}` : '1'; };
  const tel = (S.phone || '').replace(/[^+\d]/g, '');
  const mail = S.email || '';
  const posts = visiblePosts(state);

  // ---- titles / meta
  let title, desc, ogImg = 'home-hero', body = '', jsonld = [];
  const postOf = (slug) => (state.posts || []).find((p) => p.slug === slug);
  const pt = (p, f) => (p[f] && (p[f][lang] || p[f][o])) || '';
  if (page === 'post') {
    const p = postOf(route.slug);
    title = strip(pt(p, 'title')) + ' | .mer(made).';
    desc = strip(pt(p, 'excerpt')).slice(0, 158);
    ogImg = p.cover;
  } else if (page === 'privacy') {
    title = (lang === 'el' ? 'Πολιτική απορρήτου' : 'Privacy policy') + ' | .mer(made).';
    desc = lang === 'el' ? 'Πώς χρησιμοποιούνται τα στοιχεία σας στην ιστοσελίδα .mer(made).' : 'How your information is used on the .mer(made). website.';
  } else {
    title = strip(tx(`meta.${page}.title`));
    desc = strip(tx(`meta.${page}.desc`));
    if (page === 'sessions') ogImg = 'session-one';
  }

  // ---- header
  const navA = (pg, k) => `<a href="${link(pg)}"${page === pg || (pg === 'blog' && page === 'post') ? ' aria-current="page"' : ''} data-k="${k}">${tx(k)}</a>`;
  const altPath = page === 'post' ? pathFor('post', o, route.slug) : pathFor(page, o);
  const flags = `<span class="fl-w"><a class="fl${lang === 'el' ? ' on' : ''}" href="${url(lang === 'el' ? pathFor(page === 'post' ? 'post' : page, 'el', route.slug) : altPath)}" hreflang="el" lang="el" aria-label="Ελληνικά"><span class="fl-b">${FLAG.el}</span></a><a class="fl${lang === 'en' ? ' on' : ''}" href="${url(lang === 'en' ? pathFor(page === 'post' ? 'post' : page, 'en', route.slug) : altPath)}" hreflang="en" lang="en" aria-label="English"><span class="fl-b">${FLAG.en}</span></a></span>`;
  const musicBtn = S.music ? `<button class="mu" type="button" aria-pressed="false" aria-label="${esc(tx('ui.music'))}" data-src="${esc(asset(S.musicSrc))}"><span class="mu-b"><i></i><i></i><i></i><i></i></span><span class="mu-t" data-k="ui.music">${tx('ui.music')}</span></button>` : '';
  const socials = [S.instagram && `<a href="${esc(S.instagram)}" rel="noopener" target="_blank">Instagram</a>`, S.facebook && `<a href="${esc(S.facebook)}" rel="noopener" target="_blank">Facebook</a>`].filter(Boolean).join('');
  const header = `
<a class="skip" href="#main">${lang === 'el' ? 'Μετάβαση στο περιεχόμενο' : 'Skip to content'}</a>
<header class="hd" id="hd">
  <div class="hd-l">
    <button class="hm" type="button" aria-expanded="false" aria-controls="card" aria-label="${lang === 'el' ? 'Στοιχεία επικοινωνίας' : 'Contact details'}">${mark3d('m3-hd')}</button>
    <a class="hw" href="${link('home')}" aria-label=".mer(made). — ${lang === 'el' ? 'Αρχική' : 'Home'}">${wordmark()}</a>
  </div>
  <nav class="hn" aria-label="${lang === 'el' ? 'Κύριο μενού' : 'Main menu'}">${navA('home', 'nav.home')}${navA('sessions', 'nav.sessions')}${navA('blog', 'nav.blog')}</nav>
  <div class="hd-r">${musicBtn}${flags}<button class="bg" type="button" aria-expanded="false" aria-controls="mn" aria-label="Menu"><i></i><i></i></button></div>
</header>
<div class="card" id="card" role="dialog" aria-modal="false" aria-label="${esc(tx('ui.cardtitle'))}">
  <div class="card-in">
    <button class="card-x" type="button" aria-label="${lang === 'el' ? 'Κλείσιμο' : 'Close'}"><i></i><i></i></button>
    <p class="card-k">.mer(made). · Be you again</p>
    <p class="card-t" data-k="ui.cardtitle">${tx('ui.cardtitle')}</p>
    <p class="card-n" data-k="ui.cardnote">${tx('ui.cardnote')}</p>
    <a class="card-l" href="tel:${tel}"><span>${lang === 'el' ? 'Τηλέφωνο' : 'Phone'}</span><b>${esc(S.phone)}</b></a>
    <a class="card-l" href="mailto:${esc(mail)}"><span>Email</span><b>${esc(mail)}</b></a>
    ${socials ? `<p class="card-s">${socials}</p>` : ''}
    <a class="card-c" href="${link('sessions')}#syndesi">${lang === 'el' ? 'Κλείσε μια συνεδρία' : 'Book a session'} <span aria-hidden="true">→</span></a>
  </div>
</div>
<div class="mn" id="mn" aria-hidden="true">
  <nav aria-label="Menu">${navA('home', 'nav.home')}${navA('sessions', 'nav.sessions')}${navA('blog', 'nav.blog')}<a href="#epikoinonia" class="mn-c">${tx('ui.contact')}</a></nav>
  <div class="mn-f">${flags}<a href="tel:${tel}">${esc(S.phone)}</a><a href="mailto:${esc(mail)}">${esc(mail)}</a></div>
</div>`;

  // ---- sections
  const label = (num, k) => `<p class="lb rv" data-rv="up"><span class="lb-n">${num}</span><span class="lb-r"></span><span data-k="${k}">${tx(k)}</span></p>`;
  const contactSection = `
<section class="ct" id="epikoinonia" aria-labelledby="ct-t">
  <div class="wrap ct-g">
    <figure class="ct-fig rv" data-rv="ink" style="aspect-ratio:${ratio('home-contact')}">${IMG('home-contact', { sizes: '(max-width: 900px) 80vw, 40vw', cls: 'ct-img' })}</figure>
    <div class="ct-x">
      ${label(page === 'home' ? '03' : '—', 'c.label')}
      <h2 class="h2 rv" data-rv="up" id="ct-t" data-k="c.title">${tx('c.title')}</h2>
      ${E('p', 'c.text', 'p rv', 'data-rv="up"')}
      <div class="ct-lines rv" data-rv="up">
        <a class="ct-line" href="tel:${tel}"><span class="ct-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6.6 3.5 9 3l1.6 4-2 1.4a12 12 0 0 0 6.9 6.9l1.4-2 4 1.6-.5 2.4a2 2 0 0 1-2 1.6A16.5 16.5 0 0 1 5 5.5a2 2 0 0 1 1.6-2Z"/></svg></span><span><small data-k="ui.call">${tx('ui.call')}</small><b>${esc(S.phone)}</b></span></a>
        <a class="ct-line" href="mailto:${esc(mail)}"><span class="ct-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/></svg></span><span><small data-k="ui.mail">${tx('ui.mail')}</small><b>${esc(mail)}</b></span></a>
      </div>
    </div>
  </div>
</section>`;

  const postCard = (p, i) => `<article class="pc rv" data-rv="up" style="--i:${i}">
    <a href="${link('post', p.slug)}" class="pc-a">
      ${p.cover && state.img[p.cover] ? `<span class="pc-f" style="aspect-ratio:${ratio(p.cover)}">${IMG(p.cover, { sizes: '(max-width: 900px) 92vw, 44vw', view: false })}</span>` : ''}
      <span class="pc-m">${fmtDate(p.date, lang)} · ${minutes(pt(p, 'body'))} ${tx('po.min')}</span>
      <span class="pc-t">${pt(p, 'title')}</span>
      <span class="pc-e">${pt(p, 'excerpt')}</span>
      <span class="pc-r">${tx('j.read')} <span aria-hidden="true">→</span></span>
    </a></article>`;

  if (page === 'home') {
    body = `
<section class="hero" aria-labelledby="h-t">
  <div class="hero-m" style="aspect-ratio:${ratio('home-hero')}">${IMG('home-hero', { eager: true, cls: 'hero-img', sizes: '100vw', view: false })}<span class="hero-sun" aria-hidden="true"></span></div>
  <div class="hero-x">
    <p class="kick hx" data-k="h.kick">${tx('h.kick')}</p>
    <h1 class="h1 hx" id="h-t"><span class="sr">.mer(made). — </span><span data-k="h.title">${tx('h.title')}</span></h1>
    ${E('p', 'h.lead', 'lead hx')}
    <div class="hero-b hx"><a class="btn" href="${link('sessions')}" data-k="h.cta1">${tx('h.cta1')}</a><a class="tl" href="#epikoinonia" data-k="h.cta2">${tx('h.cta2')}</a></div>
  </div>
  <span class="cue" aria-hidden="true"><i></i></span>
</section>

<section class="sec intent" aria-labelledby="i-t">
  <div class="wrap two">
    <figure class="fig light rv" data-rv="light" style="aspect-ratio:${ratio('home-intention')}">${IMG('home-intention', { sizes: '(max-width: 900px) 92vw, 46vw' })}<span class="sweep" aria-hidden="true"></span></figure>
    <div class="tx">
      <span class="big-n rv" data-rv="num" aria-hidden="true">01</span>
      ${label('01', 'i.label')}
      <h2 class="h2 rv" data-rv="up" id="i-t" data-k="i.title">${tx('i.title')}</h2>
      ${E('p', 'i.text', 'p rv', 'data-rv="up"')}
    </div>
  </div>
</section>

<section class="sec sess" aria-labelledby="s-t">
  <div class="wrap two rev">
    <div class="tx">
      <span class="big-n rv" data-rv="num" aria-hidden="true">02</span>
      ${label('02', 's.label')}
      <h2 class="h2 rv" data-rv="up" id="s-t" data-k="s.title">${tx('s.title')}</h2>
      ${E('p', 's.text', 'p rv', 'data-rv="up"')}
      <ol class="paths rv" data-rv="up">
        ${[1, 2, 3].map((n) => `<li><a href="${link('sessions')}#x${n}"><span class="paths-n">0${n}</span><span data-k="x${n}.title">${tx(`x${n}.title`)}</span><span class="paths-a" aria-hidden="true">→</span></a></li>`).join('')}
      </ol>
    </div>
    <figure class="fig stone rv" data-rv="rise" style="aspect-ratio:${ratio('home-sessions')}">${IMG('home-sessions', { sizes: '(max-width: 900px) 92vw, 40vw' })}</figure>
  </div>
  <div class="wrap quote rv" data-rv="up"><p class="q" data-k="s.quote">${tx('s.quote')}</p><a class="btn" href="${link('sessions')}" data-k="s.cta">${tx('s.cta')}</a></div>
</section>

<section class="bya" aria-labelledby="b-t">
  <div class="wrap bya-g">
    <div class="bya-m" aria-hidden="true">${mark3d('m3-big', 5)}<span class="bya-sh"></span></div>
    <div class="bya-x">
      <p class="kick rv" data-rv="up" data-k="b.kick">${tx('b.kick')}</p>
      <h2 class="bya-t rv" data-rv="up" id="b-t" data-k="b.title">${tx('b.title')}</h2>
      ${E('p', 'b.text', 'p rv', 'data-rv="up"')}
      <ul class="vals">${[1, 2, 3, 4].map((n) => `<li class="rv" data-rv="up" style="--i:${n}"><span class="vals-d" aria-hidden="true"></span><span data-k="b.v${n}">${tx(`b.v${n}`)}</span></li>`).join('')}</ul>
    </div>
  </div>
</section>

${posts.length ? `<section class="sec jr" aria-labelledby="j-t">
  <div class="wrap">
    <div class="jr-h">${label('—', 'j.label')}<h2 class="h2 rv" data-rv="up" id="j-t" data-k="j.title">${tx('j.title')}</h2><a class="tl rv" data-rv="up" href="${link('blog')}" data-k="j.all">${tx('j.all')}</a></div>
    <div class="pcs pcs-${Math.min(posts.length, 2)}">${posts.slice(0, 2).map(postCard).join('')}</div>
  </div>
</section>` : ''}
${contactSection}`;
  } else if (page === 'sessions') {
    const ses = [['x1', 'session-one'], ['x2', 'session-story'], ['x3', 'session-multi']];
    body = `
<section class="sh" aria-labelledby="sp-t">
  <div class="wrap sh-g">
    <div class="sh-x">
      <p class="kick hx" data-k="sp.kick">${tx('sp.kick')}</p>
      <h1 class="h1 h1s hx" id="sp-t"><span class="sr">${lang === 'el' ? 'Συνεδρίες .mer(made). — ' : '.mer(made). sessions — '}</span><span data-k="sp.title">${tx('sp.title')}</span></h1>
      ${E('p', 'sp.intro', 'lead hx')}
    </div>
    <div class="sh-m hx" aria-hidden="true"><span class="sh-sun"></span>${mark3d('m3-big m3-sh', 5)}<span class="bya-sh"></span></div>
  </div>
</section>
<section class="sec xs" aria-label="${esc(strip(tx('sp.paths')))}">
  <svg class="thread" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M50 0 C 20 120, 80 220, 50 330 S 18 560, 52 660 S 84 880, 50 1000"/></svg>
  ${ses.map(([k, im], i) => `
  <article class="x" id="x${i + 1}" aria-labelledby="${k}-t">
    <div class="wrap two${i % 2 ? ' rev' : ''}">
      <figure class="fig rv" data-rv="${['rise', 'page', 'turn'][i]}" style="aspect-ratio:${ratio(im)}">${IMG(im, { sizes: '(max-width: 900px) 92vw, 46vw' })}</figure>
      <div class="tx">
        <span class="big-n rv" data-rv="num" aria-hidden="true">0${i + 1}</span>
        <p class="lb rv" data-rv="up"><span class="lb-n">0${i + 1}</span><span class="lb-r"></span><span data-k="${k}.en">${tx(k + '.en')}</span></p>
        <h2 class="h2 rv" data-rv="up" id="${k}-t" data-k="${k}.title">${tx(k + '.title')}</h2>
        ${E('p', k + '.lead', 'lead-s rv', 'data-rv="up"')}
        ${E('p', k + '.text', 'p rv', 'data-rv="up"')}
        ${E('p', k + '.close', 'close rv', 'data-rv="up"')}
        <a class="btn btn-o rv" data-rv="up" href="#syndesi" data-pick="${i + 1}"><span data-k="x.cta">${tx('x.cta')}</span></a>
      </div>
    </div>
  </article>`).join('')}
</section>
<section class="sec hc" id="syndesi" aria-labelledby="hc-t">
  <div class="wrap hc-g">
    <div>
      ${label('—', 'sp.paths')}
      <h2 class="h2 rv" data-rv="up" id="hc-t" data-k="hc.title">${tx('hc.title')}</h2>
      ${E('p', 'hc.text', 'p rv', 'data-rv="up"')}
    </div>
    <form class="cmp rv" data-rv="up" data-mail="${esc(mail)}" novalidate>
      <fieldset class="chips"><legend class="sr">${esc(strip(tx('sp.paths')))}</legend>
        ${[1, 2, 3].map((n) => `<label class="chip"><input type="radio" name="path" value="${esc(strip(tx(`x${n}.en`)))}"${n === 1 ? ' checked' : ''}><span><b>0${n}</b> ${tx(`x${n}.title`)}</span></label>`).join('')}
        <label class="chip"><input type="radio" name="path" value="${esc(strip(tx('hc.any')))}"><span data-k="hc.any">${tx('hc.any')}</span></label>
      </fieldset>
      <label class="fld"><span data-k="hc.name">${tx('hc.name')}</span><input name="name" autocomplete="name"></label>
      <label class="fld"><span data-k="hc.msg">${tx('hc.msg')}</span><textarea name="msg" rows="4"></textarea></label>
      <div class="cmp-b"><button class="btn" type="submit"><span data-k="hc.send">${tx('hc.send')}</span></button><a class="tl" href="tel:${tel}">${esc(S.phone)}</a></div>
      <p class="cmp-n" data-k="hc.note">${tx('hc.note')}</p>
    </form>
  </div>
</section>`;
  } else if (page === 'blog') {
    body = `
<section class="bh" aria-labelledby="bp-t">
  <div class="wrap bh-g">
    <p class="kick hx" data-k="bp.kick">${tx('bp.kick')}</p>
    <h1 class="h1 hx" id="bp-t"><span class="sr">Blog .mer(made). — </span><span data-k="bp.title">${tx('bp.title')}</span></h1>
    ${E('p', 'bp.lead', 'lead hx')}
  </div>
</section>
<section class="sec bl" aria-label="Blog">
  <div class="wrap">${posts.length ? `<div class="pcs pcs-${Math.min(posts.length, 2)}">${posts.map(postCard).join('')}</div>` : `<p class="empty" data-k="bp.empty">${tx('bp.empty')}</p>`}</div>
</section>`;
  } else if (page === 'post') {
    const p = postOf(route.slug);
    const i = posts.findIndex((x) => x.slug === p.slug);
    const nx = posts.length > 1 ? posts[(i + 1) % posts.length] : null;
    const shareUrl = S.domain ? `https://${S.domain}/${pathFor('post', lang, p.slug)}` : '';
    body = `
<article class="po" aria-labelledby="po-t">
  <header class="po-h wrap">
    <a class="tl po-back hx" href="${link('blog')}"><span aria-hidden="true">←</span> <span data-k="po.back">${tx('po.back')}</span></a>
    <p class="kick hx">${fmtDate(p.date, lang)} · ${minutes(pt(p, 'body'))} ${tx('po.min')}</p>
    <h1 class="h1 po-t hx" id="po-t">${pt(p, 'title')}</h1>
    <p class="lead hx">${pt(p, 'excerpt')}</p>
  </header>
  ${p.cover && state.img[p.cover] ? `<figure class="po-f wrap hx" style="--ar:${ratio(p.cover)}"><span class="po-fi" style="aspect-ratio:${ratio(p.cover)}">${IMG(p.cover, { eager: true, sizes: '(max-width: 1100px) 92vw, 1040px' })}</span></figure>` : ''}
  <div class="po-b wrap">
    <div class="prose">${pt(p, 'body')}</div>
    <aside class="po-s"><p class="kick" data-k="po.share">${tx('po.share')}</p><button type="button" class="tl cp" data-url="${esc(shareUrl)}">${lang === 'el' ? 'Αντιγραφή συνδέσμου' : 'Copy link'}</button></aside>
  </div>
  <div class="po-end wrap">
    ${nx && nx.slug !== p.slug ? `<a class="po-nx" href="${link('post', nx.slug)}"><span class="kick" data-k="po.next">${tx('po.next')}</span><span class="po-nt">${pt(nx, 'title')}</span></a>` : ''}
    <div class="po-cta"><p class="h3" data-k="po.cta">${tx('po.cta')}</p><a class="btn" href="${link('sessions')}#syndesi">${lang === 'el' ? 'Κλείσε μια συνεδρία' : 'Book a session'}</a></div>
  </div>
</article>`;
    jsonld.push({ '@type': 'BlogPosting', headline: strip(pt(p, 'title')), datePublished: p.date, dateModified: p.updated || p.date, inLanguage: lang, author: { '@type': 'Organization', name: '.mer(made).' }, description: strip(pt(p, 'excerpt')), ...(S.domain ? { mainEntityOfPage: `https://${S.domain}/${pathFor('post', lang, p.slug)}` } : {}) });
  } else if (page === 'privacy') {
    body = `<section class="pv wrap" aria-labelledby="pv-t">${privacyHtml(lang, S)}</section>`;
  }

  // ---- footer
  const footer = `
<footer class="ft">
  <div class="wrap ft-g">
    <a class="ft-logo" href="${link('home')}" aria-label=".mer(made).">
      <svg class="ft-mk" viewBox="0 0 452 490" aria-hidden="true"><use href="#lg-mark"/></svg>${wordmark('ft-wm')}${tagline('ft-tg')}
    </a>
    <p class="ft-tag"><span>.mer(made).</span> <span data-k="f.tag">${tx('f.tag')}</span></p>
    <nav class="ft-n" aria-label="Footer">${navA('home', 'nav.home')}${navA('sessions', 'nav.sessions')}${navA('blog', 'nav.blog')}</nav>
    <p class="ft-c"><a href="tel:${tel}">${esc(S.phone)}</a><span aria-hidden="true">·</span><a href="mailto:${esc(mail)}">${esc(mail)}</a>${socials ? `<span aria-hidden="true">·</span>${socials}` : ''}</p>
    <p class="ft-s">© 2026 .mer(made). <span data-k="f.rights">${tx('f.rights')}</span> · <a href="${link('privacy')}">${lang === 'el' ? 'Απόρρητο &amp; cookies' : 'Privacy &amp; cookies'}</a> · <a class="ft-adv" href="https://advonmedia.com" rel="noopener" target="_blank">Designed by <b class="adv">Advon Media</b></a></p>
  </div>
</footer>
<div class="lbx" hidden role="dialog" aria-modal="true" aria-label="${lang === 'el' ? 'Προβολή εικόνας' : 'Image viewer'}"><button class="lbx-x" type="button" aria-label="${lang === 'el' ? 'Κλείσιμο' : 'Close'}"><i></i><i></i></button><img alt="" role="presentation"><p class="lbx-c"></p></div>
<div class="intro" aria-hidden="true"><div class="intro-c">${mark3d('m3-intro', 4)}${wordmark('intro-wm')}${tagline('intro-tg')}</div></div>`;

  // ---- head
  const dom = S.domain ? `https://${S.domain}/` : '';
  const thisPath = page === 'post' ? pathFor('post', lang, route.slug) : pathFor(page, lang);
  const otherPath = page === 'post' ? pathFor('post', o, route.slug) : pathFor(page, o);
  const ogi = state.img[ogImg] || state.img['home-hero'];
  const ogSrc = ogi ? (ogi.srcset && ogi.srcset.length ? ogi.srcset[Math.min(1, ogi.srcset.length - 1)][1] : ogi.src) : '';
  const org = {
    '@type': 'ProfessionalService', '@id': (dom || base) + '#mermade', name: '.mer(made).', alternateName: ['mer(made)', 'mermade', 'Be you again'], slogan: 'Be you again',
    description: strip(tx('meta.home.desc')), telephone: S.phone, email: mail, inLanguage: ['el', 'en'],
    knowsAbout: lang === 'el' ? ['Ατομικές συνεδρίες coaching', 'Αυτογνωσία', 'Επαγγελματική ιστορία και βιογραφικό', 'Σειρά συνεδριών επανασύνδεσης'] : ['One on one coaching sessions', 'Self-awareness', 'Professional story and resume rewriting', 'Multi-session connection'],
    ...(dom ? { url: dom, logo: dom + 'assets/img/mermade-logo.png', image: dom + ogSrc } : {}),
    ...(S.instagram || S.facebook ? { sameAs: [S.instagram, S.facebook].filter(Boolean) } : {}),
  };
  const graph = { '@context': 'https://schema.org', '@graph': [org, { '@type': 'WebSite', name: '.mer(made).', alternateName: ['mermade', 'Be you again'], inLanguage: lang, ...(dom ? { url: dom } : {}) }, ...jsonld] };
  const head = `<!DOCTYPE html>
<html lang="${lang}" class="${edit ? 'ed' : ''}" data-base="${base}" data-page="${page}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<script id="advon-draft-guard">(function(){var h=location.hostname;if(/(^|\\.)drafts\\.advonmedia\\.com$|github\\.io$|netlify\\.app$/.test(h)){var m=document.createElement('meta');m.name='robots';m.content='noindex,nofollow';document.head.appendChild(m)}})();</script>
<meta name="theme-color" content="#F3EEE6">
<meta name="color-scheme" content="light only">
${dom ? `<link rel="canonical" href="${dom}${thisPath}">
<link rel="alternate" hreflang="${lang}" href="${dom}${thisPath}">
<link rel="alternate" hreflang="${o}" href="${dom}${otherPath}">
<link rel="alternate" hreflang="x-default" href="${dom}${lang === 'el' ? thisPath : otherPath}">` : ''}
<meta property="og:type" content="${page === 'post' ? 'article' : 'website'}">
<meta property="og:site_name" content=".mer(made).">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:locale" content="${lang === 'el' ? 'el_GR' : 'en_GB'}">
${ogSrc ? `<meta property="og:image" content="${dom ? dom + ogSrc : esc(asset(ogSrc))}">` : ''}
${dom ? `<meta property="og:url" content="${dom}${thisPath}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<!-- advon-icons -->
<link rel="icon" href="${base}favicon.ico" sizes="48x48">
<link rel="icon" href="${base}assets/icons/favicon.svg" type="image/svg+xml">
<link rel="icon" href="${base}assets/icons/favicon-96.png" type="image/png" sizes="96x96">
<link rel="apple-touch-icon" href="${base}assets/icons/apple-touch-icon.png">
<link rel="manifest" href="${base}site.webmanifest">
<!-- /advon-icons -->
<link rel="preload" href="${base}assets/fonts/noto-serif-display-greek-300-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${base}assets/fonts/commissioner-greek-300-normal.woff2" as="font" type="font/woff2" crossorigin>
<style id="advon-fonts">${fontCss(base)}</style>
<style>${CSS}</style>
<script>${HEADJS}</script>
<script type="application/ld+json">${JSON.stringify(graph).replace(/</g, '\\u003c')}</script>
</head>
<body>
${logoDefs()}
${opts.trialBar ? `<div class="trial">${lang === 'el' ? 'Βλέπετε δοκιμαστικές αλλαγές από τον πίνακα — μόνο σε αυτόν τον υπολογιστή.' : 'You are seeing trial changes from the panel — on this computer only.'} <button type="button" data-trial-off>${lang === 'el' ? 'Απόρριψη' : 'Discard'}</button></div>` : ''}
${header}
<main id="main">${body}</main>
${footer}
<script>${JS}</script>
</body>
</html>`;
  return head;
}

function fontCss(base) {
  const G = 'U+0370-0377,U+037A-037F,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03FF';
  const L = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
  const f = (fam, file, w, st) => ['greek', 'latin'].map((s) => `@font-face{font-family:'${fam}';font-style:${st};font-weight:${w};font-display:swap;src:url(${base}assets/fonts/${file.replace('%s', s)}) format('woff2');unicode-range:${s === 'greek' ? G : L}}`).join('');
  return f('Noto Serif Display', 'noto-serif-display-%s-300-normal.woff2', 300, 'normal') + f('Noto Serif Display', 'noto-serif-display-%s-300-italic.woff2', 300, 'italic') + f('Noto Serif Display', 'noto-serif-display-%s-400-normal.woff2', 400, 'normal') + f('Commissioner', 'commissioner-%s-300-normal.woff2', 300, 'normal') + f('Commissioner', 'commissioner-%s-400-normal.woff2', 400, 'normal') + f('Commissioner', 'commissioner-%s-500-normal.woff2', 500, 'normal');
}

function privacyHtml(lang, S) {
  const mail = S.email || '';
  if (lang === 'el') return `<p class="kick">.mer(made).</p><h1 class="h1 pv-t" id="pv-t">Πολιτική απορρήτου &amp; cookies</h1>
<p class="p">Τελευταία ενημέρωση: 25 Νοεμβρίου 2026</p>
<h2 class="h3">1. Ποιος είναι υπεύθυνος</h2><p class="p">Υπεύθυνη για την ιστοσελίδα είναι η Μερόπη Φωτιάδου (.mer(made).), τηλ. ${S.phone || ''}, email <a href="mailto:${mail}">${mail}</a>.</p>
<h2 class="h3">2. Τι στοιχεία συλλέγονται</h2><p class="p">Η ιστοσελίδα δεν έχει φόρμα που αποθηκεύει στοιχεία και δεν χρησιμοποιεί cookies παρακολούθησης, εργαλεία στατιστικών ή διαφημίσεων. Όταν μας γράφετε, το μήνυμα ανοίγει στο δικό σας πρόγραμμα email ή στο τηλέφωνό σας· ό,τι μας στείλετε το χρησιμοποιούμε μόνο για να σας απαντήσουμε.</p>
<h2 class="h3">3. Τι αποθηκεύεται στη συσκευή σας</h2><p class="p">Για να θυμάται η σελίδα αν θέλετε τη μουσική ανοιχτή και αν έχετε ήδη δει την εισαγωγή, κρατά δύο μικρές ρυθμίσεις στον περιηγητή σας (local/session storage). Δεν περιέχουν προσωπικά στοιχεία και δεν στέλνονται πουθενά.</p>
<h2 class="h3">4. Φιλοξενία</h2><p class="p">Η ιστοσελίδα φιλοξενείται σε πάροχο φιλοξενίας (hosting), ο οποίος για λόγους ασφαλείας μπορεί να καταγράφει τεχνικά στοιχεία πρόσβασης (π.χ. διεύθυνση IP) για περιορισμένο χρόνο. Οι γραμματοσειρές, οι εικόνες και η μουσική φορτώνουν από την ίδια την ιστοσελίδα, όχι από άλλες εταιρείες.</p>
<h2 class="h3">5. Τα δικαιώματά σας</h2><p class="p">Έχετε δικαίωμα πρόσβασης, διόρθωσης και διαγραφής των στοιχείων σας, καθώς και εναντίωσης. Γράψτε μας στο <a href="mailto:${mail}">${mail}</a>. Μπορείτε επίσης να απευθυνθείτε στην Αρχή Προστασίας Δεδομένων Προσωπικού Χαρακτήρα (<a href="https://www.dpa.gr" rel="noopener" target="_blank">dpa.gr</a>).</p>`;
  return `<p class="kick">.mer(made).</p><h1 class="h1 pv-t" id="pv-t">Privacy &amp; cookies policy</h1>
<p class="p">Last updated: 25 November 2026</p>
<h2 class="h3">1. Who is responsible</h2><p class="p">The website is run by Meropi Fotiadou (.mer(made).), phone ${S.phone || ''}, email <a href="mailto:${mail}">${mail}</a>.</p>
<h2 class="h3">2. What information is collected</h2><p class="p">The website has no form that stores information and uses no tracking cookies, statistics or advertising tools. When you write to us, the message opens in your own email app or phone; we use what you send only to reply to you.</p>
<h2 class="h3">3. What is stored on your device</h2><p class="p">To remember whether you want the music on and whether you have already seen the opening, the page keeps two small settings in your browser (local/session storage). They contain no personal data and are not sent anywhere.</p>
<h2 class="h3">4. Hosting</h2><p class="p">The website is hosted by a hosting provider, which may log technical access data (such as your IP address) for a limited time for security reasons. Fonts, images and music load from the website itself, not from other companies.</p>
<h2 class="h3">5. Your rights</h2><p class="p">You have the right to access, correct and delete your data, and to object. Write to us at <a href="mailto:${mail}">${mail}</a>. You may also contact the Hellenic Data Protection Authority (<a href="https://www.dpa.gr" rel="noopener" target="_blank">dpa.gr</a>).</p>`;
}

export function sitemap(state, domain) {
  if (!domain) return '';
  const urls = routes(state).filter((r) => r.lang === 'el').map((r) => {
    const en = r.page === 'post' ? pathFor('post', 'en', r.slug) : pathFor(r.page, 'en');
    return `<url><loc>https://${domain}/${r.path}</loc><xhtml:link rel="alternate" hreflang="el" href="https://${domain}/${r.path}"/><xhtml:link rel="alternate" hreflang="en" href="https://${domain}/${en}"/></url><url><loc>https://${domain}/${en}</loc><xhtml:link rel="alternate" hreflang="el" href="https://${domain}/${r.path}"/><xhtml:link rel="alternate" hreflang="en" href="https://${domain}/${en}"/></url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>\n`;
}
