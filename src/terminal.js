const EMAIL = 'harasameeraj.7@gmail.com';
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;

const COMMANDS = {
  help: () => [
    '<span class="t-b">Available commands</span>',
    ...[
      ['whoami', 'who is Hara?'],
      ['about', 'the short version'],
      ['experience', 'internships'],
      ['projects', 'things I built'],
      ['skills', 'the stack'],
      ['awards', 'wins & certs'],
      ['github', 'live repos from the GitHub API'],
      ['contact', 'how to reach me'],
      ['resume', 'download my résumé'],
      ['theme', 'theme light | dark'],
      ['cd', 'cd <section> · jump around the page'],
      ['ls', 'list sections'],
      ['clear', 'clear the screen'],
      ['sudo hire-hara', 'you know you want to'],
    ].map(([c, d]) => `  <span class="t-a1">${c.padEnd(16)}</span><span class="t-dim">${d}</span>`),
  ],
  whoami: () => [
    '<span class="t-b">Hara Sameeraj Kuppili</span>',
    '<span class="t-a1">Full-stack AI engineer</span> · security-minded by default',
    'B.Tech CSE @ VIT Chennai (2024 – 2028) · Chennai, India',
    '<span class="t-gold">5× hackathon winner</span> · 2 full-stack internships',
  ],
  about: () => [
    'I take AI products from zero to one · and secure them while doing it.',
    'Production apps wiring GPT-4o, Gemini and local LLMs into React, Node.js and FastAPI.',
    'Comfortable with ambiguity, fast to ship, and I own problems end to end.',
  ],
  experience: () => [
    '<span class="t-a2">▸</span> <span class="t-b">Qcerebrum</span> · Full Stack Developer Intern <span class="t-dim">(May – Jul 2026)</span>',
    '  Orbit SchoolConnect: React Native + Supabase, Row-Level Security, realtime chat & push.',
    '<span class="t-a2">▸</span> <span class="t-b">Apex Techno Soft</span> · Full Stack Developer Intern, AI & Web <span class="t-dim">(Dec 2025 – Apr 2026)</span>',
    '  VendorScan: GPT-4o agents with web search for vendor risk · 40% lower latency.',
  ],
  projects: () => [
    `<span class="t-gold">★</span> <span class="t-b">Stitch ATS</span>        AI applicant tracking · <span class="t-gold">AWS VIT Hackathon winner</span> · ${link('https://stitch-ats-frontend.onrender.com', 'live')}`,
    `<span class="t-a1">◆</span> <span class="t-b">Kavach & Nirva</span>    PII redaction (99.9% recall) + RAG over local LLMs · ${link('https://github.com/harasameeraj/optiv/tree/full-project', 'repo')}`,
    `<span class="t-a1">◆</span> <span class="t-b">Orbit</span>             real-time parent–teacher app · ${link('https://github.com/harasameeraj/orbit', 'repo')}`,
    `<span class="t-a1">◆</span> <span class="t-b">VendorScan</span>        AI vendor-risk reports in minutes · ${link('https://github.com/harasameeraj/vendor-scan', 'repo')}`,
    `<span class="t-gold">★</span> <span class="t-b">Patient Triage</span>    92% accurate risk model · <span class="t-gold">NIT Trichy Vortex'26 winner</span> · ${link('https://github.com/harasameeraj/CODE-RED', 'repo')}`,
  ],
  skills: () => [
    '<span class="t-a1">ai       </span> GPT-4o · Gemini · RAG · embeddings · agents · Ollama · spaCy · Presidio · scikit-learn',
    '<span class="t-a2">security </span> PII/DLP · JWT · scrypt · CSRF · RBAC & RLS · AES-GCM · OWASP Top 10 · threat modelling',
    '<span class="t-a1">frontend </span> React · Next.js · React Native · Vite · Tailwind · Recharts',
    '<span class="t-a1">backend  </span> Node.js · Express · FastAPI · REST · WebSockets · PostgreSQL · MongoDB · SQLAlchemy',
    '<span class="t-a1">lang     </span> TypeScript · JavaScript · Python · SQL · Java · C++ · C · Bash',
    '<span class="t-a1">tools    </span> Git · GitHub Actions · Docker · Linux · Pytest',
  ],
  awards: () => [
    '<span class="t-gold">🏆</span> Winner · AWS VIT Chennai Hackathon 2026',
    "<span class=\"t-gold\">🏆</span> Winner · NIT Trichy Vortex'26",
    '<span class="t-gold">×5</span> Hackathon wins at inter-college events',
    `<span class="t-a1">✓</span> Cisco · Introduction to Cybersecurity (Oct 2026) · ${link('https://www.credly.com/users/hara-sameeraj-kuppili', 'credly')}`,
    '<span class="t-a1">✓</span> McKinsey.org Forward Program (Dec 2025)',
    '<span class="t-a1">✓</span> HackerRank Python 5★ · GitHub Pull Shark · LeetCode regular',
  ],
  contact: () => [
    `email     <a href="mailto:${EMAIL}">${EMAIL}</a>`,
    'phone     <a href="tel:+919063127578">+91 90631 27578</a>',
    `whatsapp  ${link('https://wa.me/919063127578', 'wa.me/919063127578')}`,
    `linkedin  ${link('https://www.linkedin.com/in/hara-sameeraj-8b63072b7/', 'in/hara-sameeraj')}`,
    `github    ${link('https://github.com/harasameeraj', 'github.com/harasameeraj')}`,
  ],
  resume: () => [
    '<a href="/Hara_Sameeraj_Kuppili_Resume.pdf" download>↓ Hara_Sameeraj_Kuppili_Resume.pdf</a>  <span class="t-dim">(full stack · AI)</span>',
    '<a href="/Hara_Sameeraj_Kuppili_Resume_Security.pdf" download>↓ Hara_Sameeraj_Kuppili_Resume_Security.pdf</a>  <span class="t-dim">(security)</span>',
  ],
  ls: () => ['<span class="t-a1">about/  experience/  work/  skills/  terminal/  awards/  contact/</span>'],
  date: () => [new Date().toString()],
  pwd: () => ['/home/recruiter/hara-sameeraj'],
  echo: (args) => [esc(args.join(' '))],
  exit: () => ['<span class="t-dim">nice try. there is no escape from a good hire. 🙂</span>'],
  hello: () => ['hey! 👋 type <span class="t-a1">help</span> to look around.'],
  hi: () => COMMANDS.hello(),
};

export function initTerminal({ onNavigate, onTheme, githubRepos }) {
  const body = document.getElementById('termBody');
  const out = document.getElementById('termOut');
  const form = document.getElementById('termForm');
  const input = document.getElementById('termInput');
  const history = [];
  let hIdx = -1;
  let busy = false;

  const print = (lines, cls = '') => {
    for (const l of [].concat(lines)) {
      const d = document.createElement('div');
      if (cls) d.className = cls;
      d.innerHTML = l === '' ? '&nbsp;' : l;
      out.appendChild(d);
    }
    body.scrollTop = body.scrollHeight;
  };
  const prompt = (cmd) => print(`<span class="t-u">recruiter</span>@<span class="t-h">hara</span>:<span class="t-a2">~</span>$ ${esc(cmd)}`);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  async function run(raw) {
    const cmd = raw.trim();
    prompt(cmd);
    if (!cmd) return;
    history.unshift(cmd);
    hIdx = -1;
    const [name, ...args] = cmd.split(/\s+/);
    const key = name.toLowerCase();

    if (key === 'clear') { out.innerHTML = ''; return; }
    if (key === 'sudo') {
      if ((args[0] || '').toLowerCase() === 'hire-hara') return hire();
      print(`<span class="t-a2">recruiter is not in the sudoers file.</span> <span class="t-dim">Try: sudo hire-hara</span>`);
      return;
    }
    if (key === 'cd') {
      const target = (args[0] || '').replace(/[\/.]/g, '').toLowerCase();
      const map = { about: 'about', experience: 'experience', exp: 'experience', projects: 'work', work: 'work', skills: 'skills', awards: 'awards', contact: 'contact', terminal: 'terminal', '': 'top', '~': 'top' };
      if (map[target] !== undefined) { print(`<span class="t-dim">→ /${map[target]}</span>`); onNavigate('#' + map[target]); }
      else print(`<span class="t-a2">cd: no such directory: ${esc(args[0])}</span>`);
      return;
    }
    if (key === 'theme') {
      const t = (args[0] || '').toLowerCase();
      if (['light', 'dark'].includes(t)) { onTheme(t); print(`<span class="t-ok">✓ switched to ${t} mode</span>`); }
      else print('usage: theme <span class="t-a1">light</span> | <span class="t-a1">dark</span>');
      return;
    }
    if (key === 'github') {
      print('<span class="t-dim">GET https://api.github.com/users/harasameeraj/repos …</span>');
      busy = true;
      const repos = await githubRepos();
      busy = false;
      if (!repos) { print('<span class="t-a2">rate-limited by GitHub right now · browse them at </span>' + link('https://github.com/harasameeraj', 'github.com/harasameeraj')); return; }
      print(`<span class="t-ok">200 OK</span> · <span class="t-b">${repos.length}</span> public repos · most recently pushed:`);
      repos.filter((r) => !r.fork).slice(0, 8).forEach((r) => {
        print(`  ${link(r.html_url, r.name)}${' '.repeat(Math.max(1, 26 - r.name.length))}<span class="t-dim">${(r.language || '·').padEnd(18)}${new Date(r.pushed_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>`);
      });
      return;
    }
    const fn = COMMANDS[key];
    if (fn) { print(fn(args)); return; }
    print(`<span class="t-a2">zsh: command not found: ${esc(name)}</span> <span class="t-dim">· try</span> <span class="t-a1">help</span>`);
  }

  async function hire() {
    busy = true;
    print('<span class="t-dim">[sudo] password for recruiter: ••••••••</span>');
    await wait(500);
    const steps = [
      ['Verifying 5× hackathon wins', 'ok'],
      ['Checking production experience (2 internships)', 'ok'],
      ['Scanning for security mindset', 'ok'],
      ['Measuring shipping velocity', 'off the charts'],
    ];
    for (const [s, r] of steps) {
      const d = document.createElement('div');
      d.innerHTML = `<span class="t-a1">›</span> ${s} <span class="t-dim">…</span>`;
      out.appendChild(d);
      body.scrollTop = body.scrollHeight;
      await wait(420);
      d.innerHTML += ` <span class="t-ok">${r}</span>`;
    }
    await wait(300);
    print(['', '<span class="t-ok t-b">✓ ACCESS GRANTED.</span> Excellent decision.', `Opening a draft to <a href="mailto:${EMAIL}">${EMAIL}</a> …`]);
    busy = false;
    await wait(700);
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Let's talk · opportunity for Hara")}&body=${encodeURIComponent('Hi Hara,\n\nI saw your portfolio and would love to chat about ')}`;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (busy) return;
    const v = input.value;
    input.value = '';
    run(v);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); if (hIdx < history.length - 1) input.value = history[++hIdx]; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); hIdx = Math.max(-1, hIdx - 1); input.value = hIdx >= 0 ? history[hIdx] : ''; }
    else if (e.key === 'Tab') {
      e.preventDefault();
      const all = [...Object.keys(COMMANDS), 'clear', 'cd', 'theme', 'github', 'sudo hire-hara'];
      const m = all.filter((c) => c.startsWith(input.value.toLowerCase()));
      if (m.length === 1) input.value = m[0];
      else if (m.length > 1) { prompt(input.value); print(`<span class="t-dim">${m.join('  ')}</span>`); }
    } else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); out.innerHTML = ''; }
  });
  body.addEventListener('click', () => { if (!window.getSelection().toString()) input.focus({ preventScroll: true }); });
  document.querySelectorAll('.term__quick [data-cmd]').forEach((b) =>
    b.addEventListener('click', () => { if (!busy) run(b.dataset.cmd); }),
  );

  // boot text: typed once, when the terminal first scrolls into view
  let booted = false;
  print([
    '<span class="t-dim">Last login: ' + new Date().toDateString() + ' on ttys001</span>',
    '<span class="t-b">Welcome to hara-sameeraj.sh</span> <span class="t-dim">v1.0 · type</span> <span class="t-a1">help</span> <span class="t-dim">to get started.</span>',
    '',
  ]);
  new IntersectionObserver(async ([e], obs) => {
    if (!e.isIntersecting || booted) return;
    booted = true;
    obs.disconnect();
    busy = true;
    const cmd = 'whoami';
    for (let i = 1; i <= cmd.length; i++) { input.value = cmd.slice(0, i); await wait(90); }
    await wait(250);
    input.value = '';
    busy = false;
    run(cmd);
  }, { threshold: 0.5 }).observe(body);
}
