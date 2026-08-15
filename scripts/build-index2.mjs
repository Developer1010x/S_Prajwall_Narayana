/**
 * Builds index2.html, a freelance and contract landing page.
 *
 * The regional pages under /uk, /in, /us and so on are written for someone
 * hiring a full-time engineer. This one is written for someone with a project
 * and a budget: what I can build for you, what you get, proof that I have done
 * it, and one way to start the conversation.
 *
 * Reads assets/data.base.json, the same source of truth the regional pages use,
 * so nothing here can drift from them. Run with `node scripts/build-index2.mjs`.
 * Dependency-free, inlines its own CSS, output is one openable file.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const data = JSON.parse(readFileSync(join(root, 'assets/data.base.json'), 'utf8'));

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const { personal, stats, skills, experience, projects, publications, services } = data;
const allSkills = skills.flatMap((g) => g.items);
const current = experience.find((e) => e.current) || experience[0];

/* Services lead the page: this is what someone is buying. */
const serviceBlocks = (services || [])
  .map((s, i) => {
    const points = (s.points || [])
      .map((p) => `              <li>${esc(p)}</li>`)
      .join('\n');
    return `        <article class="svc">
          <div class="svc-idx">${String(i + 1).padStart(2, '0')}</div>
          <div>
            <h3>${esc(s.title)}</h3>
            <p class="svc-body">${esc(s.body)}</p>
            ${points ? `<ul class="svc-points">\n${points}\n            </ul>` : ''}
          </div>
        </article>`;
  })
  .join('\n');

const statCards = stats
  .map(
    (s) => `        <div class="stat">
          <div class="stat-num">${esc(s.value)}${esc(s.suffix || '')}</div>
          <div class="stat-lbl">${esc(s.label)}</div>
        </div>`
  )
  .join('\n');


/* Proof, not a portfolio dump: the work that backs the offers above. */
const projItems = projects
  .slice(0, 5)
  .map((p, i) => {
    const tags = (p.tags || []).slice(0, 5).map((t) => `<span class="tag">${esc(t)}</span>`).join('');
    const metrics = (p.metrics || []).slice(0, 3).map((m) => `<li>${esc(m)}</li>`).join('');
    return `        <article class="row">
          <div class="row-idx">${String(i + 1).padStart(2, '0')}</div>
          <div class="row-body">
            <h3><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)} <span aria-hidden="true">↗</span></a></h3>
            <p class="row-role">${esc(p.subtitle || '')}</p>
            <p class="row-desc">${esc((p.description || '').slice(0, 300))}${(p.description || '').length > 300 ? '…' : ''}</p>
            ${metrics ? `<ul class="metrics">${metrics}</ul>` : ''}
            <div class="tags">${tags}</div>
          </div>
        </article>`;
  })
  .join('\n');

const pubItems = (publications || [])
  .map(
    (p) => `        <article class="note">
          <p class="note-meta">${esc(p.venue || '')}</p>
          <h3>${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)} <span aria-hidden="true">↗</span></a>` : esc(p.title)}</h3>
        </article>`
  )
  .join('\n');

/* How an engagement runs. Stated plainly so nobody has to ask. */
const how = [
  ['A call, no charge', 'Half an hour on what you are trying to ship, what already exists, and where it is stuck. If I am not the right person I will say so on that call.'],
  ['A written scope', 'What gets built, what it costs, and how long. Fixed scope where the work is clear, weekly where it is exploratory. No open-ended hourly billing.'],
  ['Built in the open', 'Work lands in your repository as reviewable pull requests from day one. You see progress continuously rather than at a reveal.'],
  ['Handover that holds', 'Runbooks, tests and a walkthrough. The goal is that your team can keep it running without me, which is the only honest definition of finished.'],
].map(
  ([t, b], i) => `        <div class="card">
          <div class="card-idx">${String(i + 1).padStart(2, '0')}</div>
          <h3>${esc(t)}</h3>
          <p>${esc(b)}</p>
        </div>`
).join('\n');


/* About: the cards that say what I build and how I work. */
const aboutCards = (data.about || [])
  .map((a) => `        <div class="card">
          <h3>${esc(a.title)}</h3>
          <p>${esc(a.body)}</p>
        </div>`)
  .join('\n');

/* Skills, grouped, so the strip above is not the only place they appear. */
const skillGroups = (skills || [])
  .map((g) => `        <div class="card">
          <h3>${esc(g.title)}</h3>
          <div class="tags">${(g.items || []).map((i) => `<span class="tag">${esc(i)}</span>`).join('')}</div>
        </div>`)
  .join('\n');

/* Experience. The first role's title is already in the header, so only the
   later ones are labelled: otherwise a single-role entry prints its own title
   and dates twice, which is what it used to do. */
const expItems = (experience || [])
  .map((e, i) => {
    const roles = e.roles && e.roles.length ? e.roles : [{ bullets: e.bullets || [] }];
    const body = roles
      .map((r, j) => {
        const head = j === 0 || !r.title
          ? ''
          : `<p class="sub"><span class="subtitle">${esc(r.title)}</span>` +
            (r.date ? ` <span class="row-meta">${esc(r.date)}</span>` : '') + `</p>`;
        const list = (r.bullets || []).length
          ? `<ul>${(r.bullets || []).map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`
          : '';
        return head + list;
      })
      .join('\n');
    return `        <article class="row">
          <div class="row-idx">${String(i + 1).padStart(2, '0')}</div>
          <div class="row-body">
            <h3>${esc(e.org)}</h3>
            <p class="row-role">${esc(e.title)}${e.note ? `. ${esc(e.note)}` : ''}</p>
            <p class="row-meta">${esc(e.date)}${e.location ? ` · ${esc(e.location)}` : ''}</p>
            ${body}
          </div>
        </article>`;
  })
  .join('\n');

const eduItems = (data.education || [])
  .map((e) => `        <article class="row">
          <div class="row-idx">01</div>
          <div class="row-body">
            <h3>${esc(e.org)}</h3>
            <p class="row-role">${esc(e.title)}</p>
            <p class="row-meta">${esc(e.date)}${e.location ? ` · ${esc(e.location)}` : ''}</p>
          </div>
        </article>`)
  .join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<script>document.documentElement.className+=" anim";</script>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(personal.displayName)} | Freelance AI and platform engineering</title>
<meta name="description" content="Freelance and contract engineering: RAG systems with real evaluation, LLM and agent pipelines, and the DevOps platform they run on. Based in ${esc(personal.location)}, working remotely.">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<style>
  :root{
    --bg:#0b0b0d; --elev:#111114; --card:#141417; --line:#232329; --line-hi:#33333b;
    --fg:#ededf0; --dim:#a2a2ad; --faint:#6e6e79; --accent:#7c9cff; --good:#4ade80;
    --max:1080px; --radius:14px;
    --sans:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Inter,sans-serif;
    --mono:ui-monospace,"SF Mono","JetBrains Mono",Menlo,monospace;
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{margin:0;background:var(--bg);color:var(--fg);font-family:var(--sans);line-height:1.6;-webkit-font-smoothing:antialiased}
  a{color:inherit;text-decoration:none}
  .wrap{max-width:var(--max);margin:0 auto;padding:0 24px}
  .skip{position:absolute;left:-9999px}
  .skip:focus{left:16px;top:16px;background:var(--fg);color:var(--bg);padding:10px 14px;border-radius:8px;z-index:100}

  header.nav{position:sticky;top:0;z-index:50;background:rgba(11,11,13,.82);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
  .nav-in{display:flex;align-items:center;justify-content:space-between;gap:16px;height:62px}
  .brand{font-weight:600;white-space:nowrap}
  .brand .sep{color:var(--faint);margin:0 6px}
  .brand .role{color:var(--dim);font-weight:400}
  .nav-links{display:flex;gap:2px;align-items:center;overflow-x:auto;scrollbar-width:none}
  .nav-links::-webkit-scrollbar{display:none}
  .nav-links a{padding:7px 11px;border-radius:8px;color:var(--dim);font-size:14px;white-space:nowrap}
  .nav-links a:hover{color:var(--fg);background:var(--elev)}
  .nav-links a.cta{background:var(--fg);color:var(--bg);font-weight:600}
  .nav-links a.cta:hover{background:var(--accent);color:#fff}

  section{padding:74px 0;border-top:1px solid var(--line)}
  .eyebrow{font-family:var(--mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin:0 0 14px}
  h1{font-size:clamp(2.1rem,5vw,3.2rem);line-height:1.09;letter-spacing:-.02em;margin:0 0 18px}
  h2{font-size:clamp(1.5rem,3vw,2rem);letter-spacing:-.02em;margin:0 0 10px}
  h3{margin:0 0 4px;font-size:1.08rem}
  .lead{font-size:1.12rem;color:var(--dim);max-width:680px;margin:0}
  .sub{color:var(--dim);max-width:680px;margin:0 0 30px}

  .avail{display:inline-flex;align-items:center;gap:9px;font-family:var(--mono);font-size:12.5px;color:var(--dim);border:1px solid var(--line-hi);border-radius:999px;padding:6px 14px;margin-bottom:22px}
  .dot{width:8px;height:8px;border-radius:50%;background:var(--good);box-shadow:0 0 0 3px rgba(74,222,128,.16)}

  .hero{padding:80px 0 44px;border-top:none;display:grid;grid-template-columns:1fr 250px;gap:40px;align-items:start}
  .portrait{width:100%;aspect-ratio:1;object-fit:cover;border-radius:var(--radius);border:1px solid var(--line)}
  .btns{display:flex;gap:12px;flex-wrap:wrap;margin-top:26px}
  .btn{display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:10px;font-weight:600;font-size:14px;border:1px solid var(--line-hi);transition:.15s}
  .btn-primary{background:var(--fg);color:var(--bg);border-color:var(--fg)}
  .btn-primary:hover{background:var(--accent);border-color:var(--accent);color:#fff}
  .btn-ghost:hover{border-color:var(--fg);background:var(--elev)}

  .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:40px}
  .stat{border:1px solid var(--line);background:var(--card);border-radius:var(--radius);padding:22px}
  .stat-num{font-size:1.9rem;font-weight:700;letter-spacing:-.02em}
  .stat-lbl{color:var(--dim);font-size:13px;margin-top:4px}

  .run{overflow:hidden;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:16px 0;background:var(--elev)}
  .run-track{display:flex;gap:10px;width:max-content;animation:slide 46s linear infinite}
  .run-track span{font-family:var(--mono);font-size:12.5px;color:var(--dim);border:1px solid var(--line);border-radius:999px;padding:5px 12px;white-space:nowrap}
  @keyframes slide{from{transform:translateX(0)}to{transform:translateX(-50%)}}

  .svc{display:grid;grid-template-columns:46px 1fr;gap:20px;border:1px solid var(--line);background:var(--card);border-radius:var(--radius);padding:26px;margin-bottom:14px}
  .svc-idx{font-family:var(--mono);color:var(--faint);font-size:14px}
  .svc-body{color:var(--dim);margin:6px 0 0}
  .svc-points{margin:14px 0 0;padding-left:18px;color:var(--dim);font-size:14.5px}
  .svc-points li{margin-bottom:5px}
  .svc-points li::marker{color:var(--accent)}

  .row{display:grid;grid-template-columns:46px 1fr;gap:20px;border:1px solid var(--line);background:var(--card);border-radius:var(--radius);padding:24px;margin-bottom:14px}
  .row-idx{font-family:var(--mono);color:var(--faint);font-size:14px}
  .row-role{color:var(--dim);margin:4px 0 8px}
  .row-desc{color:var(--dim);margin:0}
  .metrics{margin:12px 0 0;padding-left:18px;color:var(--dim);font-size:14px}
  .metrics li::marker{color:var(--accent)}
  .row h3 a:hover{color:var(--accent)}
  .tags{display:flex;flex-wrap:wrap;gap:7px;margin-top:14px}
  .tag{font-family:var(--mono);font-size:11.5px;color:var(--dim);border:1px solid var(--line);border-radius:999px;padding:4px 10px}

  .cards{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
  .card{border:1px solid var(--line);background:var(--card);border-radius:var(--radius);padding:24px}
  .card-idx{font-family:var(--mono);color:var(--faint);font-size:13px;margin-bottom:8px}
  .card p{color:var(--dim);margin:6px 0 0;font-size:14.5px}

  .note{border-bottom:1px solid var(--line);padding:18px 0}
  .note:last-child{border-bottom:none}
  .note-meta{font-family:var(--mono);font-size:12.5px;color:var(--faint);margin:0 0 6px}
  .note h3 a:hover{color:var(--accent)}

  .cta-band{border:1px solid var(--line-hi);background:var(--elev);border-radius:var(--radius);padding:34px}

  footer{border-top:1px solid var(--line);padding:50px 0;color:var(--faint)}
  .foot-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:26px}
  footer h4{color:var(--dim);font-size:12px;text-transform:uppercase;letter-spacing:.1em;margin:0 0 12px}
  footer a{color:var(--dim);display:block;padding:3px 0;font-size:14px}
  footer a:hover{color:var(--fg)}
  .copyright{margin-top:32px;font-size:13px}

  /* Nine nav items plus a CTA overflow well before the mobile breakpoint, and
     the CTA is the one item that must never be the one clipped. Wrap the whole
     header onto two rows while there is still room to read it. */
  @media (max-width:1100px){
    .nav-in{flex-wrap:wrap;height:auto;padding:10px 0;gap:8px}
    .nav-links{order:2;width:100%}
  }
  @media (max-width:860px){
    .hero{grid-template-columns:1fr}
    .portrait{max-width:210px}
    .stats,.cards,.foot-grid{grid-template-columns:1fr}
    .svc,.row{grid-template-columns:1fr;gap:10px}
  }

  /* ── motion ──────────────────────────────────────────────────────────────
     Progressive enhancement. Nothing is hidden by CSS alone: the .anim class
     is put on <html> by a script in <head>, so if that script never runs the
     page renders fully visible and static. Hiding first and revealing with JS
     is how content disappears for people with JS off. */
  .anim .reveal{opacity:0;transform:translateY(18px);
    transition:opacity .62s cubic-bezier(.22,.61,.36,1),transform .62s cubic-bezier(.22,.61,.36,1);
    transition-delay:var(--d,0ms);will-change:opacity,transform}
  .anim .reveal.shown{opacity:1;transform:none}

  /* Hero runs on load rather than on scroll: it is already in view. */
  .anim .hero .lift{opacity:0;transform:translateY(20px);animation:rise .7s cubic-bezier(.22,.61,.36,1) forwards;animation-delay:var(--d,0ms)}
  @keyframes rise{to{opacity:1;transform:none}}

  .avail .dot{animation:pulse 2.4s ease-in-out infinite}
  @keyframes pulse{
    0%,100%{box-shadow:0 0 0 3px rgba(74,222,128,.16)}
    50%{box-shadow:0 0 0 7px rgba(74,222,128,.05)}
  }

  .btn{transition:transform .16s ease,background .16s ease,border-color .16s ease,color .16s ease}
  .btn:hover{transform:translateY(-2px)}
  .btn:active{transform:translateY(0)}

  .svc,.row,.card,.stat{transition:transform .22s cubic-bezier(.22,.61,.36,1),border-color .22s ease,box-shadow .22s ease}
  .svc:hover,.row:hover,.card:hover{transform:translateY(-3px);border-color:var(--line-hi);box-shadow:0 10px 30px -18px rgba(0,0,0,.55)}
  .stat:hover{transform:translateY(-3px);border-color:var(--line-hi)}

  .tag{transition:border-color .18s ease,color .18s ease}
  .tag:hover{border-color:var(--accent);color:var(--fg)}

  .row h3 a,.note h3 a{position:relative}
  .row h3 a::after,.note h3 a::after{content:"";position:absolute;left:0;bottom:-2px;height:1px;width:0;
    background:var(--accent);transition:width .26s cubic-bezier(.22,.61,.36,1)}
  .row h3 a:hover::after,.note h3 a:hover::after{width:100%}

  header.nav{transition:box-shadow .25s ease,background .25s ease}
  header.nav.stuck{box-shadow:0 1px 0 var(--line),0 10px 30px -22px rgba(0,0,0,.7)}

  .nav-links a{position:relative}
  .nav-links a:not(.cta)::after{content:"";position:absolute;left:11px;right:11px;bottom:4px;height:1px;
    background:var(--accent);transform:scaleX(0);transform-origin:left;transition:transform .24s cubic-bezier(.22,.61,.36,1)}
  .nav-links a:not(.cta):hover::after{transform:scaleX(1)}

  /* One switch turns all of it off, including the marquee handled above. */
  @media (prefers-reduced-motion:reduce){
    .anim .reveal{opacity:1!important;transform:none!important;transition:none!important}
    .anim .hero .lift{opacity:1!important;transform:none!important;animation:none!important}
    .avail .dot{animation:none}
    .btn:hover,.svc:hover,.row:hover,.card:hover,.stat:hover{transform:none}
    header.nav{transition:none}
  }
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

<header class="nav">
  <div class="wrap nav-in">
    <a class="brand" href="#top">${esc(personal.displayName)}<span class="sep">/</span><span class="role">Freelance</span></a>
    <nav class="nav-links">
      <a href="#about">About</a>
      <a href="#skills">Skills</a>
      <a href="#experience">Experience</a>
      <a href="#education">Education</a>
      <a href="#projects">Projects</a>
      <a href="#services">Services</a>
      <a href="#publications">Publications</a>
      <a href="#contact">Contact</a>
      <a class="cta" href="mailto:${esc(personal.email)}?subject=Freelance%20enquiry">Start a project</a>
    </nav>
  </div>
</header>

<main id="main">
<div id="top"></div>

<section class="wrap hero">
  <div>
    <span class="avail lift" style="--d:0ms"><span class="dot"></span> Taking on freelance and contract work</span>
    <h1 class="lift" style="--d:70ms">I build LLM systems, and the platform that keeps them up.</h1>
    <p class="lead lift" style="--d:140ms">Most teams can get a demo working. The hard part is the version that survives real traffic, real data and a bad Tuesday. That is the part I do: retrieval and agent systems with evaluation wired into CI, and the deployment, monitoring and on-call underneath them.</p>
    <div class="btns lift" style="--d:210ms">
      <a class="btn btn-primary" href="mailto:${esc(personal.email)}?subject=Freelance%20enquiry">Start a project</a>
      <a class="btn btn-ghost" href="#services">What I build →</a>
      <a class="btn btn-ghost" href="${esc(personal.github)}" target="_blank" rel="noopener">GitHub ↗</a>
    </div>
    <div class="stats lift" style="--d:280ms">
${statCards}
    </div>
  </div>
  <img class="portrait lift" style="--d:150ms" src="${esc(personal.profileImage)}" alt="${esc(personal.profileImageAlt)}">
</section>


<section class="wrap" id="about">
  <p class="eyebrow">About</p>
  <h2>What I build, and how I work</h2>
  <div class="cards">
${aboutCards}
  </div>
</section>

<section class="wrap" id="skills">
  <p class="eyebrow">Skills</p>
  <h2>The stack I actually use</h2>
  <p class="sub">Grouped by what it is for, rather than listed as one wall of logos.</p>
  <div class="cards">
${skillGroups}
  </div>
</section>

<section class="wrap" id="experience">
  <p class="eyebrow">Experience</p>
  <h2>Where I have shipped</h2>
${expItems}
</section>

<section class="wrap" id="education">
  <p class="eyebrow">Education</p>
  <h2>Education</h2>
${eduItems}
</section>

<section class="wrap" id="projects">
  <p class="eyebrow">Projects</p>
  <h2>Work that backs the offers below</h2>
  <p class="sub">Every one is public and every claim is checkable. Read the code before you hire me.</p>
${projItems}
</section>

<section class="wrap" id="services">
  <p class="eyebrow">Services</p>
  <h2>Three things I am genuinely good at</h2>
  <p class="sub">Scoped as projects, not as hours. Each one ships with the tests, instrumentation and runbooks that make it somebody else's to maintain afterwards.</p>
${serviceBlocks}
  <div class="cards" style="margin-top:26px">
${how}
  </div>
</section>

<section class="wrap" id="publications">
  <p class="eyebrow">Publications</p>
  <h2>Peer-reviewed work</h2>
${pubItems}
</section>

<section class="wrap" id="contact">
  <p class="eyebrow">Contact</p>
  <h2>Have something that needs to work in production?</h2>
  <p class="sub">Tell me what you are building and where it is stuck. If I am not the right person for it, I will tell you that, and usually who is.</p>
  <div class="btns">
    <a class="btn btn-primary" href="mailto:${esc(personal.email)}?subject=Freelance%20enquiry">Email me</a>
    <a class="btn btn-ghost" href="${esc(personal.github)}" target="_blank" rel="noopener">GitHub ↗</a>
    <a class="btn btn-ghost" href="./">Regional CVs →</a>
  </div>
  <p style="color:var(--faint);font-size:13.5px;margin:22px 0 0">Currently ${esc(current.title)} at ${esc(current.org)}. Freelance work is taken alongside that, so I am honest about capacity before agreeing to anything.</p>
</section>
</main>

<footer>
  <div class="wrap foot-grid">
    <div>
      <strong>${esc(personal.displayName)}</strong>
      <p style="color:var(--faint);margin:6px 0 0;font-size:14px">Freelance AI and platform engineering. ${esc(personal.location)}, working remotely.</p>
    </div>
    <div>
      <h4>This page</h4>
      <a href="#about">About</a>
      <a href="#experience">Experience</a>
      <a href="#projects">Projects</a>
      <a href="#services">Services</a>
      <a href="#publications">Publications</a>
    </div>
    <div>
      <h4>Elsewhere</h4>
      <a href="${esc(personal.github)}" target="_blank" rel="noopener">GitHub ↗</a>
      <a href="mailto:${esc(personal.email)}">Email</a>
      <a href="./">Full CV and regional versions</a>
    </div>
  </div>
  <div class="wrap copyright">© ${new Date().getFullYear()} ${esc(personal.name)}. Generated from assets/data.base.json.</div>
</footer>

<script>
(function () {
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Everything inside a section reveals in sequence. Marking the elements here
  // rather than in the markup keeps the generator's HTML readable.
  var groups = document.querySelectorAll('main section');
  groups.forEach(function (sec) {
    var kids = sec.querySelectorAll(':scope > .eyebrow, :scope > h2, :scope > .sub, :scope > .cards > *, :scope > .svc, :scope > .row, :scope > .note, :scope > .btns, :scope > .cta-band');
    kids.forEach(function (el, i) {
      if (el.closest('.hero')) return;          // the hero animates on load instead
      el.classList.add('reveal');
      el.style.setProperty('--d', Math.min(i * 55, 330) + 'ms');
    });
  });

  if (reduced || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('shown'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('shown');
        io.unobserve(e.target);                  // reveal once, never re-hide
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  }

  // Stat numbers count up the first time they are seen. The text is already in
  // the DOM, so a crawler and a reduced-motion visitor read the final value.
  var nums = document.querySelectorAll('.stat-num');
  if (!reduced && 'IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, full = el.textContent.trim();
        var m = full.match(/^(\d+)(.*)$/);        // "12+" -> 12 and "+"
        if (m) {
          var target = parseInt(m[1], 10), suffix = m[2], t0 = null;
          var step = function (ts) {
            if (!t0) t0 = ts;
            var k = Math.min((ts - t0) / 900, 1);
            k = 1 - Math.pow(1 - k, 3);           // ease out
            el.textContent = Math.round(target * k) + suffix;
            if (k < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
        io2.unobserve(el);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { io2.observe(el); });
  }

  var nav = document.querySelector('header.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('stuck', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
</script>
</body>
</html>
`;

writeFileSync(join(root, 'index2.html'), html);
const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
console.log(`  wrote index2.html  (${kb} KB)  ${services.length} services, ${projects.length} projects, ${publications.length} publications`);
