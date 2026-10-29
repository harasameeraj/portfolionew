import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initHero } from './hero.js';
import { initTerminal } from './terminal.js';
import { initDemos } from './demos.js';

gsap.registerPlugin(ScrollTrigger);

const EMAIL = 'harasameeraj.7@gmail.com';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

/* ---------------------------------------------------------
   Smooth scroll
   --------------------------------------------------------- */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
$$('.term__body, .cmdk__list, .chat, #piiIn').forEach((el) => el.setAttribute('data-lenis-prevent', ''));

function scrollToTarget(hash) {
  const el = hash === '#top' ? 0 : $(hash);
  if (el === null) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.5, offset: el === 0 ? 0 : -10, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else if (el === 0) window.scrollTo(0, 0);
  else el.scrollIntoView();
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const hash = a.getAttribute('href');
  if (hash.length < 2) return;
  e.preventDefault();
  closeMenu();
  scrollToTarget(hash);
});

/* ---------------------------------------------------------
   Theme (dark / light) with a circular reveal
   --------------------------------------------------------- */
const hero = initHero($('#heroCanvas'), { reduced });
const themeBtn = $('#themeBtn');

function applyTheme(t) {
  root.dataset.theme = t;
  const cs = getComputedStyle(root);
  const v = (k) => cs.getPropertyValue(k).trim();
  hero.setColors(v('--text'), v('--accent'), t === 'light' ? 0.42 : 0.28);
  $('meta[name="theme-color"]').setAttribute('content', v('--bg'));
  themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}
function setTheme(next, x, y) {
  store.set('theme', next);
  if (!document.startViewTransition || reduced) { applyTheme(next); return; }
  const cx = x ?? window.innerWidth - 80;
  const cy = y ?? 34;
  const r = Math.hypot(Math.max(cx, window.innerWidth - cx), Math.max(cy, window.innerHeight - cy));
  const tr = document.startViewTransition(() => applyTheme(next));
  tr.ready.then(() => {
    root.animate(
      { clipPath: [`circle(0px at ${cx}px ${cy}px)`, `circle(${r}px at ${cx}px ${cy}px)`] },
      { duration: 800, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
    );
  });
}
const toggleTheme = (e) => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', e?.clientX || undefined, e?.clientY || undefined);
applyTheme(root.dataset.theme || 'dark');
themeBtn.addEventListener('click', toggleTheme);
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
  if (!store.get('theme')) applyTheme(e.matches ? 'light' : 'dark');
});

/* ---------------------------------------------------------
   Text splitting
   --------------------------------------------------------- */
function splitWords(el, cls, wrap) {
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span');
          w.className = cls;
          if (wrap) { const i = document.createElement('span'); i.textContent = part; w.appendChild(i); }
          else w.textContent = part;
          frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
  };
  walk(el);
}
$$('[data-title]').forEach((t) => splitWords(t, 'tw', true));
const aboutEl = $('[data-words]');
splitWords(aboutEl, 'w', false);

/* ---------------------------------------------------------
   Scramble helper
   --------------------------------------------------------- */
const GLYPHS = '█▓▒░#%&@$01';
function scramble(el, to, dur = 0.7) {
  const from = el.textContent;
  const len = Math.max(from.length, to.length);
  const st = { p: 0 };
  return gsap.to(st, {
    p: 1, duration: dur, ease: 'none',
    onUpdate() {
      let s = '';
      for (let i = 0; i < len; i++) {
        const at = i / len;
        if (st.p > at + 0.2) s += to[i] || '';
        else if (st.p > at) s += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        else s += from[i] || '';
      }
      el.textContent = s;
    },
    onComplete() { el.textContent = to; },
  });
}

/* ---------------------------------------------------------
   Loader + intro
   --------------------------------------------------------- */
const loader = $('#loader');

function intro() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from('.hero__name .ln > span', { yPercent: 110, duration: 1.3, stagger: 0.09 })
    .from('[data-intro]', { autoAlpha: 0, y: 24, duration: 1.1, stagger: 0.08 }, '-=1')
    .from('.nav > *', { autoAlpha: 0, y: -14, duration: 0.9, stagger: 0.06 }, '<')
    .from('.portrait__img', { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.5, ease: 'expo.inOut' }, 0.1)
    .fromTo('.portrait__scan', { top: '0%', autoAlpha: 1 }, { top: '96%', duration: 1.5, ease: 'expo.inOut' }, 0.1)
    .to('.portrait__scan', { autoAlpha: 0, duration: 0.3 }, '>-0.1')
    .from('.portrait__aura', { scale: 0.6, autoAlpha: 0, duration: 1.8, ease: 'power3.out' }, 0.4)
    .from('.portrait__tag', { autoAlpha: 0, x: 16, duration: 0.8 }, 1.4)
    .from('#heroCanvas', { autoAlpha: 0, duration: 2, ease: 'power2.out' }, 0.2);
  // stats count up as they appear
  $$('.stats [data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const dec = +(el.dataset.decimals || 0);
    const o = { v: 0 };
    tl.to(o, { v: end, duration: 1.6, ease: 'power3.out', onUpdate: () => { el.textContent = o.v.toFixed(dec); } }, 0.6);
  });
  return tl;
}

function runLoader() {
  document.body.classList.add('is-loading');
  lenis?.stop();
  window.scrollTo(0, 0);
  const count = $('#loaderCount');
  const bar = $('#loaderBar');
  const line = $('#loaderLine');
  const st = { v: 0 };
  let stage = 0;
  const stages = [[40, 'verifying identity'], [85, 'access granted']];
  gsap.timeline()
    .to(st, {
      v: 100, duration: 1.5, ease: 'power2.inOut',
      onUpdate() {
        const v = Math.round(st.v);
        count.textContent = String(v).padStart(3, '0');
        bar.style.width = v + '%';
        if (stage < stages.length && v >= stages[stage][0]) line.textContent = stages[stage++][1];
      },
    })
    .to(loader, {
      clipPath: 'inset(0% 0% 100% 0%)', duration: 1, ease: 'expo.inOut',
      onComplete() {
        document.body.classList.remove('is-loading');
        lenis?.start();
        loader.remove();
        ScrollTrigger.refresh();
      },
    }, '+=0.1')
    .add(intro(), '-=0.5');
}
if (reduced) loader.remove();
else runLoader();

/* ---------------------------------------------------------
   Scroll-driven motion
   --------------------------------------------------------- */
if (!reduced) {
  ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true, onUpdate: (s) => hero.setScroll(s.progress) });
  gsap.to('.portrait', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__text', { yPercent: -12, autoAlpha: 0.3, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'center top', end: 'bottom top', scrub: true } });

  $$('[data-title]').forEach((t) => {
    gsap.from($$('.tw > span', t), { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: t, start: 'top 88%', once: true } });
  });
  $$('.label').forEach((l) => gsap.from(l, { autoAlpha: 0, x: -16, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: l, start: 'top 92%', once: true } }));

  const reveals = $$('[data-reveal]');
  gsap.set(reveals, { autoAlpha: 0, y: 36 });
  ScrollTrigger.batch(reveals, {
    start: 'top 92%', once: true,
    onEnter: (b) => gsap.to(b, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.07, clearProps: 'transform' }),
  });

  gsap.to($$('.w', aboutEl), { opacity: 1, stagger: 0.04, ease: 'none', scrollTrigger: { trigger: aboutEl, start: 'top 82%', end: 'bottom 50%', scrub: true } });

  $$('.project').forEach((p) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: p, start: 'top 78%', once: true }, defaults: { ease: 'expo.out' } });
    tl.from($$('.project__info > *', p), { autoAlpha: 0, y: 30, duration: 1, stagger: 0.06 })
      .from($('.project__demo', p), { autoAlpha: 0, y: 60, rotate: p.classList.contains('project--flip') ? -1.5 : 1.5, duration: 1.3 }, 0.1);
    gsap.fromTo($('.project__title', p), { xPercent: 0 }, { xPercent: -4, ease: 'none', scrollTrigger: { trigger: p, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  gsap.from('.footer__big > *', { yPercent: 100, duration: 1.4, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.footer', start: 'top 92%', once: true } });
}

// highlighter marks in the about paragraph
$$('.about__lede mark').forEach((m) => ScrollTrigger.create({ trigger: m, start: 'top 72%', once: true, onEnter: () => m.classList.add('is-on') }));

// declassify the contact dossier
const bars = $$('#dossier .bar');
const head = $('#declassHead');
ScrollTrigger.create({
  trigger: '#dossier', start: 'top 78%', once: true,
  onEnter() {
    if (reduced) { head.textContent = 'declassified ✓'; head.classList.add('is-open'); return; }
    gsap.to(bars, { scaleX: 0, duration: 0.7, ease: 'power3.inOut', stagger: 0.12, delay: 0.2 });
    scramble(head, 'declassified ✓', 0.9).then(() => head.classList.add('is-open'));
  },
});

// progress bar
const progress = $('#progressBar');
ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => { progress.style.transform = `scaleX(${s.progress})`; } });

// nav state + active section
const nav = $('#nav');
let lastY = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('is-scrolled', y > 30);
  nav.classList.toggle('is-hidden', !menu.classList.contains('is-open') && y > lastY && y > 500);
  lastY = y;
}, { passive: true });
const navLinks = $$('.nav__links a');
['about', 'experience', 'work', 'skills', 'terminal', 'awards', 'contact'].forEach((id) => {
  ScrollTrigger.create({
    trigger: '#' + id, start: 'top 45%', end: 'bottom 45%',
    onToggle: (s) => { if (s.isActive) navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id)); },
  });
});

document.fonts?.ready.then(() => ScrollTrigger.refresh());
window.addEventListener('load', () => ScrollTrigger.refresh());

/* ---------------------------------------------------------
   Pointer: cursor, magnetic buttons, index peek, skill tips
   --------------------------------------------------------- */
const peek = $('#peek');
const tip = document.createElement('div');
tip.className = 'tip';
document.body.appendChild(tip);

if (finePointer) {
  const cursor = $('.cursor');
  const label = $('.cursor__label');
  const dx = gsap.quickTo('.cursor__dot', 'x', { duration: 0.08 });
  const dy = gsap.quickTo('.cursor__dot', 'y', { duration: 0.08 });
  const rx = gsap.quickTo('.cursor__ring', 'x', { duration: 0.4, ease: 'power3' });
  const ry = gsap.quickTo('.cursor__ring', 'y', { duration: 0.4, ease: 'power3' });
  const px = gsap.quickTo(peek, 'x', { duration: 0.5, ease: 'power3' });
  const py = gsap.quickTo(peek, 'y', { duration: 0.5, ease: 'power3' });
  window.addEventListener('pointermove', (e) => {
    cursor.classList.remove('is-hidden');
    dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    px(e.clientX + 22); py(e.clientY + 22);
    gsap.set(tip, { x: e.clientX + 14, y: e.clientY - 38 });
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));

  document.addEventListener('pointerover', (e) => {
    const t = e.target;
    const text = t.closest('textarea, input[type="text"], input:not([type]), #termBody');
    const lab = !text && t.closest('[data-cursor]');
    const interactive = t.closest('a, button, input[type="range"], select, .skill-row li[data-used]');
    cursor.classList.toggle('is-text', !!text);
    cursor.classList.toggle('is-hover', !!interactive && !text);
    cursor.classList.toggle('is-label', !!lab && !interactive);
    if (lab) label.textContent = lab.dataset.cursor;
  });

  const pxTo = gsap.quickTo('.portrait__img', 'x', { duration: 1.2, ease: 'power3' });
  const auraTo = gsap.quickTo('.portrait__aura', 'x', { duration: 1.6, ease: 'power3' });
  $('#hero').addEventListener('pointermove', (e) => {
    const k = e.clientX / window.innerWidth - 0.5;
    pxTo(k * 14);
    auraTo(k * -26);
  });

  $$('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.25);
      yTo((e.clientY - r.top - r.height / 2) * 0.3);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });

  $$('[data-peek]').forEach((a) => {
    a.addEventListener('mouseenter', () => {
      peek.innerHTML = `<b>${$('.index__name', a).textContent}</b>${a.dataset.peek}`;
      peek.classList.add('is-on');
    });
    a.addEventListener('mouseleave', () => peek.classList.remove('is-on'));
  });
}

// skills: hover (or tap) a skill to see where it shipped
const skillsBox = $('#skillsList');
function showTip(li, e) {
  if (!li.dataset.used) { tip.classList.remove('is-on'); return; }
  tip.innerHTML = `used in <b>${li.dataset.used}</b>`;
  if (!finePointer) {
    const r = li.getBoundingClientRect();
    gsap.set(tip, { x: Math.min(r.left, window.innerWidth - tip.offsetWidth - 16), y: r.top - 40 });
  }
  tip.classList.add('is-on');
}
skillsBox.addEventListener('pointerover', (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  skillsBox.classList.add('is-hovering');
  showTip(li, e);
});
skillsBox.addEventListener('pointerleave', () => { skillsBox.classList.remove('is-hovering'); tip.classList.remove('is-on'); });
window.addEventListener('scroll', () => { if (!finePointer) tip.classList.remove('is-on'); }, { passive: true });

/* ---------------------------------------------------------
   Clock, menu
   --------------------------------------------------------- */
const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
const tickClock = () => { $('#clock').textContent = fmt.format(new Date()); };
tickClock();
setInterval(tickClock, 15000);

const burger = $('#burger');
const menu = $('#menu');
function closeMenu() {
  if (!menu.classList.contains('is-open')) return;
  menu.classList.remove('is-open');
  menu.setAttribute('aria-hidden', 'true');
  burger.setAttribute('aria-expanded', 'false');
  lenis?.start();
}
burger.addEventListener('click', () => {
  if (menu.classList.contains('is-open')) return closeMenu();
  menu.classList.add('is-open');
  menu.setAttribute('aria-hidden', 'false');
  burger.setAttribute('aria-expanded', 'true');
  nav.classList.remove('is-hidden');
  lenis?.stop();
});

/* ---------------------------------------------------------
   GitHub (live)
   --------------------------------------------------------- */
const LANG_COLORS = { JavaScript: '#e8c547', TypeScript: '#3a7bd5', Python: '#4b8bbe', HTML: '#e06c3c', CSS: '#7d5bbe', 'Jupyter Notebook': '#e0913c', TeX: '#4f7a3a', Java: '#b07219', 'C++': '#d6457a' };
let reposPromise = null;
function githubRepos() {
  if (reposPromise) return reposPromise;
  reposPromise = (async () => {
    try { const c = sessionStorage.getItem('gh'); if (c) return JSON.parse(c); } catch { /* ignore */ }
    try {
      const r = await fetch('https://api.github.com/users/harasameeraj/repos?per_page=100&sort=pushed');
      if (!r.ok) throw new Error(r.status);
      const data = (await r.json()).map(({ name, html_url, language, fork, pushed_at }) => ({ name, html_url, language, fork, pushed_at }));
      try { sessionStorage.setItem('gh', JSON.stringify(data)); } catch { /* ignore */ }
      return data;
    } catch { reposPromise = null; return null; }
  })();
  return reposPromise;
}
githubRepos().then((repos) => {
  const headEl = $('#ghHead');
  let counts;
  if (repos) {
    counts = {};
    repos.filter((r) => !r.fork && r.language).forEach((r) => { counts[r.language] = (counts[r.language] || 0) + 1; });
    const last = repos.reduce((a, r) => (r.pushed_at > a ? r.pushed_at : a), '');
    headEl.textContent = `GitHub, live · ${repos.length} public repos · ${Object.keys(counts).length} languages · last push ${new Date(last).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  } else {
    counts = { JavaScript: 7, Python: 5, HTML: 4, CSS: 2, 'Jupyter Notebook': 2, TypeScript: 1, TeX: 1 };
    headEl.textContent = 'GitHub · github.com/harasameeraj';
  }
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, n]) => s + n, 0);
  $('#ghBar').innerHTML = entries.map(([l, n]) => `<span style="background:${LANG_COLORS[l] || '#8b8792'}" data-g="${n}" title="${l}"></span>`).join('');
  $('#ghLegend').innerHTML = entries.map(([l, n]) => `<li><i style="background:${LANG_COLORS[l] || '#8b8792'}"></i>${l} ${Math.round((n / total) * 100)}%</li>`).join('');
  const grow = () => $$('#ghBar span').forEach((s) => { s.style.flexGrow = s.dataset.g; });
  if (reduced) grow();
  else ScrollTrigger.create({ trigger: '#ghBar', start: 'top 95%', once: true, onEnter: grow });
});

/* ---------------------------------------------------------
   Demos + terminal
   --------------------------------------------------------- */
initDemos();
initTerminal({ onNavigate: scrollToTarget, onTheme: (t) => setTheme(t), githubRepos });

/* ---------------------------------------------------------
   Contact: copy, form
   --------------------------------------------------------- */
const toastEl = $('#toast');
let toastT;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => toastEl.classList.remove('show'), 2200);
}
async function copyEmail() {
  try { await navigator.clipboard.writeText(EMAIL); }
  catch {
    const ta = document.createElement('textarea');
    ta.value = EMAIL;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  toast('Email copied');
  const c = $('#copied');
  c.textContent = 'copied ✓';
  c.classList.add('is-done');
  setTimeout(() => { c.textContent = 'click to copy'; c.classList.remove('is-done'); }, 2000);
}
$('#copyEmail').addEventListener('click', copyEmail);

$('#contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.currentTarget;
  const name = f.name.value.trim();
  const org = f.org.value.trim();
  const type = f.type.value;
  const msg = f.message.value.trim();
  const err = $('#formErr');
  $$('.field', f).forEach((x) => x.classList.remove('is-error'));
  if (!name || !msg) {
    if (!name) f.name.closest('.field').classList.add('is-error');
    if (!msg) f.message.closest('.field').classList.add('is-error');
    err.textContent = 'Add your name and a short message first.';
    if (!reduced) gsap.fromTo(f, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
    return;
  }
  err.textContent = '';
  const subject = `${type}: ${name}${org ? ' at ' + org : ''}`;
  const body = `${msg}\n\n${name}${org ? '\n' + org : ''}`;
  window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  toast('Opening your email app…');
});

/* ---------------------------------------------------------
   Command menu (⌘K)
   --------------------------------------------------------- */
const cmdk = $('#cmdk');
const cmdkInput = $('#cmdkInput');
const cmdkList = $('#cmdkList');
const open = (url) => window.open(url, '_blank', 'noopener');
const download = (href) => { const a = document.createElement('a'); a.href = href; a.download = ''; document.body.appendChild(a); a.click(); a.remove(); };
const ACTIONS = [
  { g: 'Go to', ic: '01', t: 'About', run: () => scrollToTarget('#about') },
  { g: 'Go to', ic: '02', t: 'Experience', run: () => scrollToTarget('#experience') },
  { g: 'Go to', ic: '03', t: 'Selected work', run: () => scrollToTarget('#work') },
  { g: 'Go to', ic: '04', t: 'Skills', run: () => scrollToTarget('#skills') },
  { g: 'Go to', ic: '05', t: 'Terminal', run: () => scrollToTarget('#terminal') },
  { g: 'Go to', ic: '06', t: 'Recognition', run: () => scrollToTarget('#awards') },
  { g: 'Go to', ic: '07', t: 'Contact', run: () => scrollToTarget('#contact') },
  { g: 'Contact', ic: '@', t: 'Copy email address', hint: EMAIL, run: copyEmail },
  { g: 'Contact', ic: '✉', t: 'Write an email', run: () => { window.location.href = `mailto:${EMAIL}`; } },
  { g: 'Contact', ic: '☎', t: 'Call +91 90631 27578', run: () => { window.location.href = 'tel:+919063127578'; } },
  { g: 'Contact', ic: 'wa', t: 'Message on WhatsApp', run: () => open('https://wa.me/919063127578') },
  { g: 'Contact', ic: 'in', t: 'LinkedIn profile', run: () => open('https://www.linkedin.com/in/hara-sameeraj-8b63072b7/') },
  { g: 'Contact', ic: 'gh', t: 'GitHub profile', run: () => open('https://github.com/harasameeraj') },
  { g: 'Résumé', ic: '↓', t: 'Download résumé · Full-stack & AI', run: () => download('/Hara_Sameeraj_Kuppili_Resume.pdf') },
  { g: 'Résumé', ic: '↓', t: 'Download résumé · Security', run: () => download('/Hara_Sameeraj_Kuppili_Resume_Security.pdf') },
  { g: 'Projects', ic: '01', t: 'Stitch ATS · open live app', run: () => open('https://stitch-ats-frontend.onrender.com') },
  { g: 'Projects', ic: '02', t: 'Kavach & Nirva · try the redaction demo', run: () => scrollToTarget('#piiIn') },
  { g: 'Theme', ic: '◐', t: 'Toggle light / dark mode', run: () => toggleTheme() },
];
let filtered = ACTIONS;
let sel = 0;
function renderCmdk() {
  const q = cmdkInput.value.trim().toLowerCase();
  filtered = ACTIONS.filter((a) => (a.t + ' ' + a.g).toLowerCase().includes(q));
  sel = Math.min(sel, Math.max(0, filtered.length - 1));
  if (!filtered.length) { cmdkList.innerHTML = '<li class="cmdk__empty">No matches. Try "email" or "résumé".</li>'; return; }
  let html = '';
  let g = '';
  filtered.forEach((a, i) => {
    if (a.g !== g) { g = a.g; html += `<li class="cmdk__group">${g}</li>`; }
    html += `<li class="cmdk__item${i === sel ? ' is-sel' : ''}" role="option" data-i="${i}"><span class="ic">${a.ic}</span>${a.t}${a.hint ? `<span class="hint">${a.hint}</span>` : ''}</li>`;
  });
  cmdkList.innerHTML = html;
  $('.is-sel', cmdkList)?.scrollIntoView({ block: 'nearest' });
}
function openCmdk() {
  cmdk.classList.add('is-open');
  cmdk.setAttribute('aria-hidden', 'false');
  cmdkInput.value = '';
  sel = 0;
  renderCmdk();
  lenis?.stop();
  setTimeout(() => cmdkInput.focus(), 50);
}
function closeCmdk() {
  if (!cmdk.classList.contains('is-open')) return;
  cmdk.classList.remove('is-open');
  cmdk.setAttribute('aria-hidden', 'true');
  lenis?.start();
}
function runSel(i) {
  const a = filtered[i];
  if (!a) return;
  closeCmdk();
  a.run();
}
$('#openPalette').addEventListener('click', openCmdk);
cmdk.addEventListener('click', (e) => {
  if (e.target.closest('[data-close]')) return closeCmdk();
  const it = e.target.closest('.cmdk__item');
  if (it) runSel(+it.dataset.i);
});
cmdkList.addEventListener('mousemove', (e) => {
  const it = e.target.closest('.cmdk__item');
  if (it && +it.dataset.i !== sel) { sel = +it.dataset.i; $$('.cmdk__item', cmdkList).forEach((x) => x.classList.toggle('is-sel', +x.dataset.i === sel)); }
});
cmdkInput.addEventListener('input', () => { sel = 0; renderCmdk(); });
cmdkInput.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % filtered.length; renderCmdk(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + filtered.length) % filtered.length; renderCmdk(); }
  else if (e.key === 'Enter') { e.preventDefault(); runSel(sel); }
});
window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); cmdk.classList.contains('is-open') ? closeCmdk() : openCmdk(); }
  else if (e.key === 'Escape') { closeCmdk(); closeMenu(); }
});
if (!/Mac|iPhone|iPad/.test(navigator.platform)) $('#openPalette kbd').textContent = 'Ctrl';

/* ---------------------------------------------------------
   Small things
   --------------------------------------------------------- */
const baseTitle = document.title;
document.addEventListener('visibilitychange', () => { document.title = document.hidden ? 'Still here when you are · Hara' : baseTitle; });
console.log(
  '%cHi, fellow developer.%c\nThis site is hand-built with Vite, Three.js and GSAP. Say hello: ' + EMAIL + '\nTry ⌘K, or `sudo hire-hara` in the terminal.',
  'font: 600 16px system-ui; color:#ffb020', 'font: 13px system-ui; color:#999',
);
