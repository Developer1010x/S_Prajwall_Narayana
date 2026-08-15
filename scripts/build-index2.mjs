/**
 * Builds index2.html: the single-page engineering profile.
 *
 * The regional pages under /uk, /in, /us and so on are CVs, formatted for an
 * applicant tracking system. This one is the page you send someone directly.
 * It leads with the systems, states the work plainly, and puts the proof next
 * to every claim.
 *
 * Deliberately restrained: hairline rules instead of a grid of cards, mono
 * reserved for metadata, one accent colour used sparingly. Boxes-inside-boxes
 * and a wall of pills are what a template looks like.
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
const current = experience.find((e) => e.current) || experience[0];
const n2 = (i) => String(i + 1).padStart(2, '0');

/* A section header: number, label, rule. The number is decorative and hidden
   from assistive technology, which reads the heading that follows instead. */
const head = (num, label, title, sub) => `  <div class="sec-head">
    <span class="sec-num" aria-hidden="true">${num}</span>
    <span class="sec-label">${esc(label)}</span>
  </div>
  <h2>${esc(title)}</h2>${sub ? `\n  <p class="sub">${esc(sub)}</p>` : ''}`;

/* Stats read as a spec strip, not as three marketing tiles. */
const statStrip = stats
  .map(
    (s) => `      <div class="stat">
        <span class="stat-num">${esc(s.value)}${esc(s.suffix || '')}</span>
        <span class="stat-lbl">${esc(s.label)}</span>
      </div>`
  )
  .join('\n');

/* About and Skills share one shape: a label on the left, the substance on the
   right, separated by a hairline. It scans like a spec sheet. */
const defRow = (label, body) => `    <div class="drow">
      <div class="drow-k">${esc(label)}</div>
      <div class="drow-v">${body}</div>
    </div>`;

const aboutRows = (data.about || [])
  .map((a) => defRow(a.title, `<p>${esc(a.body)}</p>`))
  .join('\n');

const skillRows = (skills || [])
  .map((g) => defRow(g.title, `<p class="mono-list">${(g.items || []).map(esc).join(' &middot; ')}</p>`))
  .join('\n');

const expItems = (experience || [])
  .map((e) => {
    const roles = e.roles && e.roles.length ? e.roles : [{ bullets: e.bullets || [] }];
    const body = roles
      .map((r, j) => {
        // The first role's title is already the entry title. Repeating it here
        // is what made single-role entries print themselves twice.
        const label = j === 0 || !r.title
          ? ''
          : `<p class="role-head"><span class="role-title">${esc(r.title)}</span>${r.date ? ` <span class="mono-meta">${esc(r.date)}</span>` : ''}</p>`;
        const list = (r.bullets || []).length
          ? `<ul>${(r.bullets || []).map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`
          : '';
        return label + list;
      })
      .join('\n');
    return `    <article class="entry">
      <div class="entry-rail">
        <span class="mono-meta">${esc(e.date)}</span>
        ${e.location ? `<span class="mono-meta faint">${esc(e.location)}</span>` : ''}
      </div>
      <div class="entry-body">
        <h3>${esc(e.org)}</h3>
        <p class="entry-sub">${esc(e.title)}${e.note ? ` &middot; ${esc(e.note)}` : ''}</p>
        ${body}
      </div>
    </article>`;
  })
  .join('\n');

const eduItems = (data.education || [])
  .map((e) => `    <article class="entry">
      <div class="entry-rail">
        <span class="mono-meta">${esc(e.date)}</span>
        ${e.location ? `<span class="mono-meta faint">${esc(e.location)}</span>` : ''}
      </div>
      <div class="entry-body">
        <h3>${esc(e.org)}</h3>
        <p class="entry-sub">${esc(e.title)}</p>
      </div>
    </article>`)
  .join('\n');

/* Tags as a mono run rather than pills. A wall of rounded chips is the single
   clearest sign of a portfolio template. */
const projItems = projects
  .slice(0, 6)
  .map((p, i) => {
    const tags = (p.tags || []).slice(0, 6).map(esc).join(' &middot; ');
    const metrics = (p.metrics || []).slice(0, 3).map((m) => `<li>${esc(m)}</li>`).join('');
    const desc = (p.description || '').slice(0, 260);
    return `    <article class="entry linked">
      <div class="entry-rail">
        <span class="mono-meta" aria-hidden="true">${n2(i)}</span>
        ${p.date ? `<span class="mono-meta faint">${esc(p.date)}</span>` : ''}
      </div>
      <div class="entry-body">
        <h3><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)}<span class="arw" aria-hidden="true">↗</span></a></h3>
        <p class="entry-sub">${esc(p.subtitle || '')}</p>
        <p class="entry-desc">${esc(desc)}${(p.description || '').length > 260 ? '…' : ''}</p>
        ${metrics ? `<ul class="metrics">${metrics}</ul>` : ''}
        ${tags ? `<p class="mono-list">${tags}</p>` : ''}
      </div>
    </article>`;
  })
  .join('\n');

/* Capability, not a price list. The old version described how billing worked,
   which reads as a marketplace listing rather than an engineer. */
const serviceItems = (services || [])
  .map((s, i) => {
    const points = (s.points || []).map((p) => `<li>${esc(p)}</li>`).join('');
    return `    <article class="entry">
      <div class="entry-rail"><span class="mono-meta" aria-hidden="true">${n2(i)}</span></div>
      <div class="entry-body">
        <h3>${esc(s.title)}</h3>
        <p class="entry-desc">${esc(s.body)}</p>
        ${points ? `<ul class="metrics">${points}</ul>` : ''}
      </div>
    </article>`;
  })
  .join('\n');

const pubItems = (publications || [])
  .map((p, i) => `    <article class="entry">
      <div class="entry-rail"><span class="mono-meta" aria-hidden="true">${n2(i)}</span></div>
      <div class="entry-body">
        <p class="mono-meta faint">${esc(p.venue || '')}</p>
        <h3>${p.url && p.url !== 'None' ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)}<span class="arw" aria-hidden="true">↗</span></a>` : esc(p.title)}</h3>
      </div>
    </article>`)
  .join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<script>document.documentElement.className+=" anim";</script>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(personal.displayName)} | AI and platform engineering</title>
<meta name="description" content="${esc(personal.displayName)} builds retrieval and agent systems with evaluation wired into CI, and the platform they run on. ${esc(current.title)} at ${esc(current.org)}. Based in ${esc(personal.location)}.">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<style>
  :root{
    --bg:#08080a; --panel:rgba(255,255,255,.024);
    --line:rgba(255,255,255,.076); --line-hi:rgba(255,255,255,.17);
    --fg:#f4f4f5; --dim:#a0a0ab; --faint:#6d6d78;
    --accent:#8aa6ff; --good:#4ade80;
    --max:1060px; --radius:12px;
    --sans:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Inter,Roboto,sans-serif;
    --mono:ui-monospace,"SF Mono","JetBrains Mono","Cascadia Code",Menlo,monospace;
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  /* The hero glow is absolutely positioned and deliberately bleeds past its
     container, which widens the document and produces a horizontal scrollbar.
     Clip it here rather than with overflow-x:hidden, which would turn the body
     into a scroll container and break the sticky nav and sticky spec panel. */
  body{margin:0;background:var(--bg);color:var(--fg);font-family:var(--sans);
    line-height:1.62;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;
    overflow-x:clip}
  a{color:inherit;text-decoration:none}
  .wrap{max-width:var(--max);margin:0 auto;padding-inline:26px}
  .skip{position:absolute;left:-9999px}
  .skip:focus{left:16px;top:16px;background:var(--fg);color:var(--bg);padding:10px 14px;border-radius:8px;z-index:100}
  :focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:4px}

  /* ── nav ───────────────────────────────────────────────────────────────── */
  header.nav{position:sticky;top:0;z-index:50;background:rgba(8,8,10,.72);
    backdrop-filter:saturate(160%) blur(14px);border-bottom:1px solid transparent}
  .nav-in{display:flex;align-items:center;justify-content:space-between;gap:18px;height:60px}
  .brand{font-weight:600;white-space:nowrap;letter-spacing:-.01em}
  .brand .role{color:var(--faint);font-weight:400;font-family:var(--mono);font-size:12.5px;margin-left:9px}
  .nav-links{display:flex;gap:1px;align-items:center;overflow-x:auto;scrollbar-width:none}
  .nav-links::-webkit-scrollbar{display:none}
  .nav-links a{padding:6px 9px;border-radius:7px;color:var(--dim);font-size:13.5px;white-space:nowrap;transition:color .16s ease}
  .nav-links a:hover{color:var(--fg)}
  .nav-links a.cta{border:1px solid var(--line-hi);color:var(--fg);margin-left:8px;padding:6px 13px}
  .nav-links a.cta:hover{background:var(--fg);color:var(--bg);border-color:var(--fg)}

  /* ── type ──────────────────────────────────────────────────────────────── */
  section{padding-block:82px}
  h1{font-size:clamp(2.3rem,5.6vw,3.55rem);line-height:1.05;letter-spacing:-.033em;margin:0 0 20px;font-weight:600}
  h2{font-size:clamp(1.45rem,2.9vw,1.95rem);letter-spacing:-.028em;margin:0 0 12px;font-weight:600}
  h3{margin:0 0 3px;font-size:1.06rem;font-weight:600;letter-spacing:-.012em}
  .lead{font-size:1.14rem;color:var(--dim);max-width:640px;margin:0;line-height:1.66}
  .sub{color:var(--faint);max-width:620px;margin:0 0 6px;font-size:14.5px}
  .mono-meta{font-family:var(--mono);font-size:12px;color:var(--dim);
    letter-spacing:.01em;font-variant-numeric:tabular-nums;display:block}
  .mono-meta.faint{color:var(--faint);margin-top:3px}
  .mono-list{font-family:var(--mono);font-size:12.5px;color:var(--faint);margin:13px 0 0;line-height:1.85}

  .sec-head{display:flex;align-items:center;gap:12px;margin:0 0 16px;
    padding-bottom:13px;border-bottom:1px solid var(--line)}
  .sec-num{font-family:var(--mono);font-size:12px;color:var(--accent);font-variant-numeric:tabular-nums}
  .sec-label{font-family:var(--mono);font-size:11.5px;letter-spacing:.15em;
    text-transform:uppercase;color:var(--faint)}

  /* ── hero ──────────────────────────────────────────────────────────────── */
  .hero{position:relative;padding-block:96px 68px;display:grid;
    grid-template-columns:minmax(0,1fr) 268px;gap:56px;align-items:start;isolation:isolate}
  /* Kept inside the hero box on the horizontal axis: bleeding sideways is what
     widened the document. The gradient is sized generously instead, so it still
     falls off softly rather than ending at a visible edge. */
  .hero::before{content:"";position:absolute;inset:-30% 0 auto 0;height:640px;z-index:-1;
    background:radial-gradient(78% 62% at 24% 14%,rgba(138,166,255,.12),transparent 70%);
    pointer-events:none}
  .avail{display:inline-flex;align-items:center;gap:9px;font-family:var(--mono);font-size:12px;
    color:var(--dim);border:1px solid var(--line);border-radius:999px;padding:5px 13px;margin-bottom:24px}
  .dot{width:7px;height:7px;border-radius:50%;background:var(--good);box-shadow:0 0 0 3px rgba(74,222,128,.15)}
  .btns{display:flex;gap:10px;flex-wrap:wrap;margin-top:30px}
  .btn{display:inline-flex;align-items:center;gap:7px;padding:10px 17px;border-radius:9px;
    font-weight:550;font-size:14px;border:1px solid var(--line-hi)}
  .btn-primary{background:var(--fg);color:var(--bg);border-color:var(--fg)}
  .btn-primary:hover{background:#fff;border-color:#fff}
  .btn-ghost{color:var(--dim)}
  .btn-ghost:hover{color:var(--fg);border-color:var(--fg)}

  /* The right column is a spec panel, not a photo card: what I am doing now,
     where, and on what. It answers the first three questions anyone asks. */
  .spec{border:1px solid var(--line);border-radius:var(--radius);background:var(--panel);
    padding:18px;position:sticky;top:80px}
  .portrait{width:100%;aspect-ratio:1;object-fit:cover;border-radius:9px;display:block;margin-bottom:16px}
  .spec dl{margin:0;display:grid;gap:12px}
  .spec dt{font-family:var(--mono);font-size:10.5px;letter-spacing:.13em;
    text-transform:uppercase;color:var(--faint);margin-bottom:2px}
  .spec dd{margin:0;font-size:13.5px;color:var(--fg);line-height:1.45}
  .spec dd span{color:var(--dim)}

  .stats{display:flex;gap:0;margin-top:44px;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
  .stat{flex:1;padding:20px 22px 20px 0;display:flex;flex-direction:column;gap:2px}
  .stat + .stat{border-left:1px solid var(--line);padding-left:22px}
  .stat-num{font-size:1.75rem;font-weight:600;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
  .stat-lbl{color:var(--faint);font-size:12.5px;line-height:1.4}

  /* ── rows and entries ──────────────────────────────────────────────────── */
  .drow{display:grid;grid-template-columns:210px minmax(0,1fr);gap:32px;
    padding:22px 0;border-bottom:1px solid var(--line)}
  .drow:last-child{border-bottom:none}
  .drow-k{font-size:14.5px;font-weight:550;color:var(--fg)}
  .drow-v p{margin:0;color:var(--dim);font-size:14.5px}
  .drow-v .mono-list{margin:0;color:var(--dim)}

  .entry{display:grid;grid-template-columns:150px minmax(0,1fr);gap:32px;
    padding:26px 0;border-bottom:1px solid var(--line)}
  .entry:last-child{border-bottom:none}
  .entry-rail{padding-top:2px}
  .entry-sub{color:var(--dim);margin:0;font-size:14px}
  .entry-desc{color:var(--dim);margin:9px 0 0;font-size:14.5px}
  .entry-body ul{margin:12px 0 0;padding-left:17px;color:var(--dim);font-size:14.5px}
  .entry-body li{margin-bottom:5px}
  .entry-body li::marker{color:var(--line-hi)}
  .metrics li::marker{color:var(--accent)}
  .role-head{margin:18px 0 0}
  .role-title{font-weight:550;font-size:14.5px}
  .role-head .mono-meta{display:inline;margin-left:8px;color:var(--faint)}
  .arw{margin-left:7px;color:var(--faint);font-size:.85em;display:inline-block;transition:transform .2s ease}
  .entry.linked h3 a:hover{color:var(--accent)}
  .entry.linked h3 a:hover .arw{transform:translate(2px,-2px);color:var(--accent)}

  /* ── contact + footer ──────────────────────────────────────────────────── */
  #contact .sub{max-width:560px;margin-bottom:0}
  footer{border-top:1px solid var(--line);padding:44px 0 56px;color:var(--faint)}
  .foot-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:28px}
  footer h4{color:var(--dim);font-family:var(--mono);font-size:10.5px;text-transform:uppercase;
    letter-spacing:.13em;margin:0 0 11px;font-weight:400}
  footer a{color:var(--faint);display:block;padding:3px 0;font-size:13.5px;transition:color .16s ease}
  footer a:hover{color:var(--fg)}
  .copyright{margin-top:34px;font-size:12.5px;font-family:var(--mono);color:var(--faint)}

  @media (max-width:1000px){
    .nav-in{flex-wrap:wrap;height:auto;padding-block:10px;gap:8px}
    .nav-links{order:2;width:100%}
    .nav-links a.cta{margin-left:auto}
    .hero{grid-template-columns:1fr;gap:38px;padding-block-start:64px}
    .spec{position:static;display:grid;grid-template-columns:150px minmax(0,1fr);gap:20px;align-items:start}
    .portrait{margin-bottom:0}
    .spec dl{grid-template-columns:repeat(2,1fr);gap:14px 20px}
  }
  @media (max-width:680px){
    section{padding-block:60px}
    .drow,.entry{grid-template-columns:1fr;gap:8px}
    .entry-rail{display:flex;gap:12px;padding-top:0}
    .entry-rail .mono-meta{display:inline;margin:0}
    .stats{flex-direction:column}
    .stat{padding:16px 0}
    .stat + .stat{border-left:none;border-top:1px solid var(--line);padding-left:0}
    .spec{grid-template-columns:1fr}
    .spec dl{grid-template-columns:repeat(2,1fr)}
    .foot-grid{grid-template-columns:1fr}
  }

  /* ── motion ────────────────────────────────────────────────────────────────
     Progressive enhancement. Nothing is hidden by CSS alone: the .anim class is
     put on <html> by a script in <head>, so if that script never runs the page
     renders fully visible and static. Hiding first and revealing with JS is how
     content disappears for people with JS off. Travel is deliberately short:
     long slides read as a template, a few pixels read as polish. */
  .anim .reveal{opacity:0;transform:translateY(10px);
    transition:opacity .5s cubic-bezier(.22,.61,.36,1),transform .5s cubic-bezier(.22,.61,.36,1);
    transition-delay:var(--d,0ms);will-change:opacity,transform}
  .anim .reveal.shown{opacity:1;transform:none}
  .anim .hero .lift{opacity:0;transform:translateY(12px);
    animation:rise .62s cubic-bezier(.22,.61,.36,1) forwards;animation-delay:var(--d,0ms)}
  @keyframes rise{to{opacity:1;transform:none}}
  .avail .dot{animation:pulse 2.6s ease-in-out infinite}
  @keyframes pulse{0%,100%{box-shadow:0 0 0 3px rgba(74,222,128,.15)}50%{box-shadow:0 0 0 6px rgba(74,222,128,.04)}}
  .btn{transition:transform .16s ease,background .16s ease,border-color .16s ease,color .16s ease}
  .btn:hover{transform:translateY(-1px)}
  .btn:active{transform:none}
  .drow,.entry{transition:border-color .2s ease}
  header.nav{transition:border-color .25s ease}
  header.nav.stuck{border-bottom-color:var(--line)}

  @media (prefers-reduced-motion:reduce){
    html{scroll-behavior:auto}
    .anim .reveal{opacity:1!important;transform:none!important;transition:none!important}
    .anim .hero .lift{opacity:1!important;transform:none!important;animation:none!important}
    .avail .dot{animation:none}
    .btn:hover,.arw{transform:none}
    header.nav{transition:none}
  }
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

<header class="nav">
  <div class="wrap nav-in">
    <a class="brand" href="#top">${esc(personal.displayName)}<span class="role">${esc(personal.title)}</span></a>
    <nav class="nav-links">
      <a href="#about">About</a>
      <a href="#skills">Skills</a>
      <a href="#experience">Experience</a>
      <a href="#education">Education</a>
      <a href="#projects">Projects</a>
      <a href="#services">Services</a>
      <a href="#publications">Publications</a>
      <a href="#contact">Contact</a>
      <a class="cta" href="mailto:${esc(personal.email)}">Email</a>
    </nav>
  </div>
</header>

<main id="main">
<div id="top"></div>

<section class="wrap hero">
  <div>
    <span class="avail lift" style="--d:0ms"><span class="dot"></span> Open to select engagements</span>
    <h1 class="lift" style="--d:60ms">I build LLM systems, and the platform that keeps them up.</h1>
    <p class="lead lift" style="--d:120ms">Most teams can get a demo working. The hard part is the version that survives real traffic, real data and a bad Tuesday. That is the part I do: retrieval and agent systems with evaluation wired into CI, and the deployment, monitoring and on-call underneath them.</p>
    <div class="btns lift" style="--d:180ms">
      <a class="btn btn-primary" href="mailto:${esc(personal.email)}">Get in touch</a>
      <a class="btn btn-ghost" href="#projects">See the work</a>
      <a class="btn btn-ghost" href="${esc(personal.github)}" target="_blank" rel="noopener">GitHub ↗</a>
    </div>
    <div class="stats lift" style="--d:240ms">
${statStrip}
    </div>
  </div>
  <aside class="spec lift" style="--d:150ms">
    <img class="portrait" src="${esc(personal.profileImage)}" alt="${esc(personal.profileImageAlt || personal.displayName)}">
    <dl>
      <div><dt>Now</dt><dd>${esc(current.title)}<br><span>${esc(current.org)}</span></dd></div>
      <div><dt>Based</dt><dd><span>${esc(personal.location)}</span></dd></div>
      <div><dt>Focus</dt><dd><span>Retrieval &middot; agents &middot; platform</span></dd></div>
    </dl>
  </aside>
</section>

<section class="wrap" id="about">
${head('01', 'About', 'What I build, and how I work')}
  <div class="rows">
${aboutRows}
  </div>
</section>

<section class="wrap" id="skills">
${head('02', 'Skills', 'The stack I actually use', 'Grouped by what it is for, rather than listed as one wall of logos.')}
  <div class="rows">
${skillRows}
  </div>
</section>

<section class="wrap" id="experience">
${head('03', 'Experience', 'Where I have shipped')}
${expItems}
</section>

<section class="wrap" id="education">
${head('04', 'Education', 'Education')}
${eduItems}
</section>

<section class="wrap" id="projects">
${head('05', 'Projects', 'Systems I have designed and shipped', 'Every one is public. The links go to the source.')}
${projItems}
</section>

<section class="wrap" id="services">
${head('06', 'Services', 'What I take on', 'Scoped as systems, with the tests, instrumentation and runbooks that make them somebody else’s to maintain afterwards.')}
${serviceItems}
</section>

<section class="wrap" id="publications">
${head('07', 'Publications', 'Peer-reviewed work')}
${pubItems}
</section>

<section class="wrap" id="contact">
${head('08', 'Contact', 'Have something that needs to work in production?', 'Tell me what you are building and where it is stuck. If I am not the right person for it, I will say so, and usually who is.')}
  <div class="btns">
    <a class="btn btn-primary" href="mailto:${esc(personal.email)}">${esc(personal.email)}</a>
    <a class="btn btn-ghost" href="${esc(personal.github)}" target="_blank" rel="noopener">GitHub ↗</a>
    <a class="btn btn-ghost" href="./">Full CV →</a>
  </div>
</section>
</main>

<footer>
  <div class="wrap foot-grid">
    <div>
      <strong>${esc(personal.displayName)}</strong>
      <p style="color:var(--faint);margin:6px 0 0;font-size:13.5px;max-width:280px">${esc(personal.title)}. ${esc(personal.location)}, working remotely.</p>
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
  <div class="wrap copyright">© ${new Date().getFullYear()} ${esc(personal.name)}</div>
</footer>

<script>
(function () {
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Marking the revealed elements here rather than in the markup keeps the
  // generator's HTML readable and the reveal rules in one place.
  document.querySelectorAll('main section').forEach(function (sec) {
    if (sec.classList.contains('hero')) return;     // the hero animates on load
    var kids = sec.querySelectorAll(':scope > .sec-head, :scope > h2, :scope > .sub, :scope > .btns, :scope > .entry, :scope > .rows > .drow');
    kids.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.setProperty('--d', Math.min(i * 42, 250) + 'ms');
    });
  });

  if (reduced || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('shown'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('shown');
        io.unobserve(e.target);                     // reveal once, never re-hide
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
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
