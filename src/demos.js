import gsap from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const onceVisible = (el, fn, threshold = 0.4) => {
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); fn(); } }, { threshold });
  io.observe(el);
};

/* ---------------------------------------------------------
   Stitch ATS: skill-weighted candidate ranking
   --------------------------------------------------------- */
function initStitch() {
  const skillsEl = $('#stitchSkills');
  const list = $('#stitchList');
  if (!skillsEl) return;
  const SKILLS = ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker'];
  const CANDS = [
    { n: 'Ananya K', s: ['React', 'TypeScript', 'Node.js', 'AWS'], gh: 6 },
    { n: 'Rahul M', s: ['Python', 'Docker', 'AWS'], gh: 4 },
    { n: 'Priya S', s: ['React', 'Python', 'Docker'], gh: 7 },
    { n: 'Vikram R', s: ['TypeScript', 'Node.js', 'Docker'], gh: 3 },
    { n: 'Meera J', s: ['Python', 'AWS', 'React', 'Docker'], gh: 5 },
    { n: 'Arjun P', s: ['React', 'TypeScript'], gh: 8 },
  ];
  const selected = new Set(['React', 'TypeScript', 'Node.js']);

  skillsEl.innerHTML = SKILLS.map((s) => `<button class="chip" aria-pressed="${selected.has(s)}">${s}</button>`).join('');
  CANDS.forEach((c, i) => {
    const li = document.createElement('li');
    li.className = 'cand';
    li.dataset.i = i;
    li.innerHTML = `<span class="cand__rank"></span><span class="cand__av">${c.n.split(' ').map((p) => p[0]).join('')}</span>
      <span class="cand__who"><b>${c.n}</b><span></span></span>
      <span class="cand__score"><span class="cand__bar"><i></i></span><b>0</b></span>`;
    c.el = li;
    c.v = 0;
    list.appendChild(li);
  });

  function rank(animate) {
    const t0 = performance.now();
    const sel = [...selected];
    CANDS.forEach((c) => {
      const hits = c.s.filter((s) => selected.has(s)).length;
      c.score = sel.length ? Math.min(99, Math.round((hits / sel.length) * 84 + c.gh * 1.6 + (hits ? 2 : 0))) : c.gh * 4;
    });
    const order = [...CANDS].sort((a, b) => b.score - a.score || a.n.localeCompare(b.n));
    const ms = (performance.now() - t0).toFixed(2);
    const state = animate ? Flip.getState(list.children) : null;
    order.forEach((c, i) => {
      list.appendChild(c.el);
      $('.cand__rank', c.el).textContent = String(i + 1).padStart(2, '0');
      $('.cand__who span', c.el).innerHTML = c.s.map((s) => (selected.has(s) ? `<i>${s}</i>` : s)).join(' · ');
      $('.cand__bar i', c.el).style.width = c.score + '%';
      const num = $('.cand__score b', c.el);
      gsap.to(c, { v: c.score, duration: 0.8, ease: 'power3.out', onUpdate: () => { num.textContent = Math.round(c.v); } });
    });
    if (state) Flip.from(state, { duration: 0.75, ease: 'power3.inOut', absolute: false });
    $('#stitchMeta').textContent = `${CANDS.length} candidates ranked in ${ms} ms`;
  }

  skillsEl.addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    const s = b.textContent;
    if (selected.has(s)) selected.delete(s); else selected.add(s);
    b.setAttribute('aria-pressed', selected.has(s));
    rank(true);
  });
  rank(false);
}

/* ---------------------------------------------------------
   Kavach: in-browser PII redaction with stable pseudonyms
   --------------------------------------------------------- */
function luhn(digits) {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = +digits[i];
    if (alt) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}
const RULES = [
  { type: 'EMAIL', re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g },
  { type: 'CARD', re: /\b\d(?:[ -]?\d){12,18}\b/g, ok: (v) => luhn(v.replace(/\D/g, '')) },
  { type: 'AADHAAR', re: /\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/g },
  { type: 'PAN', re: /\b[A-Z]{5}\d{4}[A-Z]\b/g },
  { type: 'PHONE', re: /(?:\+91[\s-]?)?\b[6-9]\d{4}[\s-]?\d{5}\b|\+\d{1,3}[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/g },
  { type: 'IP', re: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g },
  { type: 'PERSON', re: /\b(?:I'm|I am|[Mm]y name is|[Tt]his is|Mr\.?|Ms\.?|Mrs\.?|Dr\.?)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/g, group: 1 },
];

function initKavach() {
  const input = $('#piiIn');
  const out = $('#piiOut');
  if (!input) return;
  const seen = new Set();

  function redact() {
    const t0 = performance.now();
    const text = input.value;
    const spans = [];
    for (const r of RULES) {
      r.re.lastIndex = 0;
      let m;
      while ((m = r.re.exec(text))) {
        let value = m[0];
        let start = m.index;
        if (r.group) { value = m[r.group]; start = m.index + m[0].lastIndexOf(value); }
        const end = start + value.length;
        if (r.ok && !r.ok(value)) continue;
        if (spans.some((s) => start < s.end && end > s.start)) continue;
        spans.push({ start, end, type: r.type, value });
      }
    }
    spans.sort((a, b) => a.start - b.start);
    const ids = {};
    const counters = {};
    let html = '';
    let cur = 0;
    for (const s of spans) {
      const key = s.type + '|' + s.value.toLowerCase();
      if (!ids[key]) { counters[s.type] = (counters[s.type] || 0) + 1; ids[key] = `${s.type}_${counters[s.type]}`; }
      const fresh = !seen.has(key);
      seen.add(key);
      html += esc(text.slice(cur, s.start)) + `<span class="tok${fresh ? ' new' : ''}" title="${s.type}">[${ids[key]}]</span>`;
      cur = s.end;
    }
    html += esc(text.slice(cur));
    out.innerHTML = html || '<span class="muted">Nothing to redact yet.</span>';
    const n = Object.keys(ids).length;
    const ms = (performance.now() - t0).toFixed(2);
    $('#piiCount').textContent = `${spans.length} ${spans.length === 1 ? 'entity' : 'entities'} redacted · ${n} unique · ${ms} ms`;
  }
  let raf;
  input.addEventListener('input', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(redact); });
  redact();
}

/* ---------------------------------------------------------
   Orbit: parent chat + teacher attendance
   --------------------------------------------------------- */
function initOrbit() {
  const phone = $('#orbit');
  if (!phone) return;
  const seg = $('.phone__seg', phone);
  seg.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const v = b.dataset.view;
    seg.classList.toggle('is-teacher', v === 'teacher');
    seg.querySelectorAll('button').forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-selected', x === b); });
    phone.querySelectorAll('.phone__view').forEach((p) => p.classList.toggle('is-on', p.dataset.panel === v));
  });

  const chat = $('#orbitChat');
  const quick = $('#orbitQuick');
  const REPLIES = {
    'Thanks, got it!': 'Great. Aarav did really well on Monday\'s test too.',
    'Is the fee due Friday?': 'Yes, this Friday. A reminder is already set in your app.',
  };
  const bubble = (text, cls = '') => {
    const p = document.createElement('p');
    p.className = 'bub ' + cls;
    p.textContent = text;
    chat.appendChild(p);
    chat.scrollTop = chat.scrollHeight;
    return p;
  };
  quick.addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const q = b.textContent;
    b.remove();
    quick.querySelectorAll('button').forEach((x) => { x.disabled = true; });
    bubble(q, 'me');
    await wait(450);
    const typing = bubble('Ms. Lakshmi is typing…', 'typing');
    await wait(1100);
    typing.remove();
    bubble(REPLIES[q] || 'Noted, thank you!');
    quick.querySelectorAll('button').forEach((x) => { x.disabled = false; });
  });

  const roll = $('#orbitRoll');
  const count = $('#orbitCount');
  const note = $('.phone__note', phone);
  const absent = new Set([7, 19]);
  const N = 24;
  roll.innerHTML = Array.from({ length: N }, (_, i) => `<button aria-label="Student ${i + 1}" class="${absent.has(i + 1) ? 'is-absent' : ''}">${String(i + 1).padStart(2, '0')}</button>`).join('');
  const update = () => { count.textContent = `${N - absent.size} / ${N} present`; };
  roll.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const id = +b.textContent;
    if (absent.has(id)) absent.delete(id); else absent.add(id);
    b.classList.toggle('is-absent', absent.has(id));
    note.textContent = absent.has(id) ? `Parent of #${b.textContent} notified: marked absent.` : `Parent of #${b.textContent} notified: marked present.`;
    update();
  });
  update();
}

/* ---------------------------------------------------------
   VendorScan: staged scan pipeline + risk gauge
   --------------------------------------------------------- */
function initVendor() {
  const pick = $('#vendorPick');
  if (!pick) return;
  const VENDORS = [
    { n: 'Northwind Traders', score: 24, f: [['Adverse news', 'none found', 'lo'], ['Company registry', 'active, filings current', 'lo'], ['Reputation', '4.6 / 5 across sources', 'lo']] },
    { n: 'Globex Metals', score: 61, f: [['Adverse news', '2 late-delivery reports', 'md'], ['Company registry', 'director changed 2025', 'md'], ['Reputation', 'mixed reviews', 'lo']] },
    { n: 'Initech Logistics', score: 87, f: [['Adverse news', 'fraud inquiry reported', 'hi'], ['Company registry', 'filings overdue', 'hi'], ['Reputation', '1.9 / 5', 'md']] },
  ];
  const steps = $('#vendorSteps');
  const fg = $('#gaugeFg');
  const num = $('#gaugeNum');
  const lbl = $('#gaugeLbl');
  const LEN = 264;
  let run = 0;
  pick.innerHTML = VENDORS.map((v, i) => `<button class="chip" data-i="${i}" aria-pressed="false">${v.n}</button>`).join('');

  async function scan(i) {
    const id = ++run;
    const v = VENDORS[i];
    pick.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', +c.dataset.i === i));
    steps.innerHTML = v.f.map(([k]) => `<li><i></i>${k}<small>queued</small></li>`).join('') + '<li><i></i>Risk score<small>queued</small></li>';
    fg.style.strokeDashoffset = LEN;
    num.textContent = '--';
    lbl.textContent = 'scanning';
    const items = steps.querySelectorAll('li');
    for (let s = 0; s < v.f.length; s++) {
      items[s].classList.add('is-run');
      items[s].querySelector('small').textContent = 'checking…';
      await wait(520);
      if (id !== run) return;
      items[s].classList.remove('is-run');
      items[s].classList.add('is-done', 'sev-' + v.f[s][2]);
      items[s].querySelector('small').textContent = v.f[s][1];
    }
    const last = items[items.length - 1];
    last.classList.add('is-done');
    const sev = v.score >= 70 ? 'high' : v.score >= 45 ? 'medium' : 'low';
    last.querySelector('small').textContent = `${v.score} / 100`;
    fg.style.stroke = sev === 'high' ? 'var(--bad)' : sev === 'medium' ? 'var(--warn)' : 'var(--ok)';
    fg.style.strokeDashoffset = LEN * (1 - v.score / 100);
    const o = { v: 0 };
    gsap.to(o, { v: v.score, duration: 1.2, ease: 'power3.out', onUpdate: () => { num.textContent = Math.round(o.v); } });
    lbl.textContent = sev + ' risk';
  }
  pick.addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (b) scan(+b.dataset.i); });
  onceVisible(pick, () => scan(1));
}

/* ---------------------------------------------------------
   Triage: vitals sliders → risk tier
   --------------------------------------------------------- */
function initTriage() {
  const box = $('.triage');
  if (!box) return;
  const hr = $('#tHr');
  const o2 = $('#tO2');
  const tp = $('#tTp');
  const badge = $('#tBadge');
  const note = $('#tNote');
  const fill = (el) => el.style.setProperty('--p', ((el.value - el.min) / (el.max - el.min)) * 100 + '%');

  function update() {
    const h = +hr.value;
    const s = +o2.value;
    const t = tp.value / 10;
    $('#tHrV').textContent = h;
    $('#tO2V').textContent = s;
    $('#tTpV').textContent = t.toFixed(1);
    [hr, o2, tp].forEach(fill);
    let score = 0;
    if (h < 50 || h > 120) score += 2; else if (h > 100) score += 1;
    if (s < 90) score += 3; else if (s < 95) score += 1;
    if (t >= 39 || t < 35.5) score += 2; else if (t >= 38) score += 1;
    const risk = score >= 3 ? 'high' : score >= 1 ? 'med' : 'low';
    box.dataset.risk = risk;
    badge.textContent = { low: 'Low risk', med: 'Medium risk', high: 'High risk' }[risk];
    note.textContent = { low: 'Routine queue', med: 'Review within 30 minutes', high: 'On-call doctor alerted' }[risk];
    box.style.setProperty('--beat', (120 / h).toFixed(2) + 's');
  }
  [hr, o2, tp].forEach((el) => el.addEventListener('input', update));
  update();
}

export function initDemos() {
  initStitch();
  initKavach();
  initOrbit();
  initVendor();
  initTriage();
}
