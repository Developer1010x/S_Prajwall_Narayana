#!/usr/bin/env node
/**
 * Country-aware static build.
 *
 * Reads   assets/data.base.json  +  assets/data.<cc>.json
 * Renders templates/page.html    ->  /<cc>/index.html   (one per region)
 * Also emits robots.txt and sitemap.xml so they cannot drift from the data.
 *
 * There is exactly ONE template and ONE stylesheet. If you find yourself
 * editing five HTML files, stop: the edit belongs here or in the data.
 *
 * Usage:  node scripts/build.mjs        (npm run build)
 *         node scripts/build.mjs --check  (build to memory, fail on problems)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK_ONLY = process.argv.includes('--check');

const problems = [];
const warnings = [];

const fail = (msg) => problems.push(msg);
const warn = (msg) => warnings.push(msg);

/* ------------------------------------------------------------------ */
/* merge rules — documented in assets/DATA-CONTRACT.md                 */
/* ------------------------------------------------------------------ */

const isPlainObject = (v) =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * Deep merge: plain objects merge key by key, arrays replace wholesale,
 * an explicit null in the override deletes the key.
 */
function deepMerge(base, override) {
  if (override === undefined) return base;
  if (override === null) return null;
  if (!isPlainObject(base) || !isPlainObject(override)) return override;

  const out = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value === null) {
      out[key] = null;
    } else if (isPlainObject(value) && isPlainObject(base[key])) {
      out[key] = deepMerge(base[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

/** Reorder a list of {id} objects. Named ids come first, in the order given. */
function applyOrder(list, order, what, cc) {
  if (!Array.isArray(order) || order.length === 0) return list;
  const byId = new Map(list.map((item) => [item.id, item]));
  const picked = [];
  for (const id of order) {
    if (!byId.has(id)) {
      fail(`data.${cc}.json: ${what}.order names unknown id "${id}". Known ids: ${[...byId.keys()].join(', ')}`);
      continue;
    }
    picked.push(byId.get(id));
    byId.delete(id);
  }
  return [...picked, ...byId.values()];
}

/** Drop entries whose id appears in `hide`. */
function applyHide(list, hide, what, cc) {
  if (!Array.isArray(hide) || hide.length === 0) return list;
  const ids = new Set(list.map((i) => i.id));
  for (const id of hide) {
    if (!ids.has(id)) fail(`data.${cc}.json: ${what}.hide names unknown id "${id}".`);
  }
  return list.filter((item) => !hide.includes(item.id));
}

/* ------------------------------------------------------------------ */
/* text helpers                                                        */
/* ------------------------------------------------------------------ */

const esc = (value) =>
  String(value === null || value === undefined ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Escaped text plus the one bit of markup the data may use: **bold**. */
const rich = (value) => esc(value).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

/** Cut to a word boundary so meta descriptions never end mid-word. */
function truncate(text, max) {
  const plain = text.replace(/\*\*/g, '');
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:—–-]+$/, '') + '…';
}

const fillTokens = (template, tokens) =>
  template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (match, key) => {
    if (!(key in tokens)) {
      fail(`templates/page.html uses {{${key}}} but the build supplies no value for it.`);
      return '';
    }
    return tokens[key];
  });

/* ------------------------------------------------------------------ */
/* section renderers — the ONLY place regional markup is produced      */
/* ------------------------------------------------------------------ */

const tagList = (tags) =>
  !tags || tags.length === 0
    ? ''
    : `      <div class="timeline-tags">${tags
        .map((t) => `<span class="skill-tag">${esc(t)}</span>`)
        .join('')}</div>\n`;

/*
 * Spelling variants.
 *
 * `meta.spelling` was declared per region from the start but nothing ever applied
 * it, so the US page shipped "organisation" — inherited from the shared base copy,
 * which is written in en-GB. A US recruiter reads British spelling as either
 * careless or as a copy-paste from someone else's CV.
 *
 * This is a curated word list, deliberately not a blanket s->z rule. "analyse"
 * becomes "analyze", but "analysis" must not become "analyzis", and a naive regex
 * would also mangle surprise, precise, expertise, enterprise and promise. Only
 * words that genuinely differ are listed, each in the casings that actually occur.
 */
const EN_US_SPELLINGS = [
  ['organisation', 'organization'], ['Organisation', 'Organization'],
  ['organisational', 'organizational'],
  ['optimise', 'optimize'], ['optimised', 'optimized'], ['optimising', 'optimizing'],
  ['optimisation', 'optimization'], ['Optimisation', 'Optimization'],
  ['prioritise', 'prioritize'], ['prioritised', 'prioritized'],
  ['standardise', 'standardize'], ['standardised', 'standardized'],
  ['specialise', 'specialize'], ['specialised', 'specialized'],
  ['analyse', 'analyze'], ['analysed', 'analyzed'], ['analysing', 'analyzing'],
  ['modelling', 'modeling'], ['modelled', 'modeled'],
  ['labelling', 'labeling'], ['labelled', 'labeled'],
  ['catalogue', 'catalog'], ['centre', 'center'], ['Centre', 'Center'],
  ['licence', 'license'], ['defence', 'defense'],
  ['behaviour', 'behavior'], ['Behaviour', 'Behavior'],
  ['favour', 'favor'], ['colour', 'color'],
  ['recognise', 'recognize'], ['recognised', 'recognized'],
  ['utilise', 'utilize'], ['utilised', 'utilized'],
  ['minimise', 'minimize'], ['maximise', 'maximize'],
  ['normalise', 'normalize'], ['normalised', 'normalized'],
  ['serialise', 'serialize'], ['serialised', 'serialized'],
  ['fulfil', 'fulfill'], ['enrolment', 'enrollment'],
  ['programme', 'program'], ['Programme', 'Program'],
  // -isation nouns and third-person -ises forms: the pairs above cover the
  // stem and the past tense only, so 'containerisation' was reaching the US
  // page unconverted.
  ['containerisation', 'containerization'],
  ['recognises', 'recognizes'], ['utilises', 'utilizes'],
  ['minimises', 'minimizes'], ['maximises', 'maximizes'],
  ['normalises', 'normalizes'], ['serialises', 'serializes'],
];

/** Apply the region's spelling to rendered HTML. en-GB and en-IN are the source form. */
function applySpelling(html, spelling) {
  if (spelling !== 'en-US') return html;
  let out = html;
  for (const [gb, us] of EN_US_SPELLINGS) {
    out = out.replace(new RegExp(`\\b${gb}\\b`, 'g'), us);
  }
  return out;
}

function renderStats(stats) {
  return (stats || [])
    .map(
      (s) => `        <div class="stat-item">
          <dt>${esc(s.label)}</dt>
          <dd class="stat-number" data-count="${esc(s.value)}" data-suffix="${esc(s.suffix || '')}">0</dd>
        </div>`
    )
    .join('\n');
}

function renderAbout(about) {
  return (about || [])
    .map(
      (card) => `    <article class="skill-category about-card glow-border">
      <h3><i class="fas ${esc(card.icon || 'fa-circle-info')}" aria-hidden="true"></i> ${esc(card.title)}</h3>
      <p>${rich(card.body)}</p>
    </article>`
    )
    .join('\n');
}

function renderSkills(skills) {
  return (skills || [])
    .map(
      (group) => `    <article class="skill-category tilt-card glow-border">
      <h3><i class="fas ${esc(group.icon || 'fa-code')}" aria-hidden="true"></i> ${esc(group.title)}</h3>
      <ul class="skill-tags">
${(group.items || []).map((item) => `        <li class="skill-tag">${esc(item)}</li>`).join('\n')}
      </ul>
    </article>`
    )
    .join('\n');
}

function renderTimeline(entries, { icon, showGrade }) {
  return (entries || [])
    .map((entry) => {
      const dateClass = entry.current ? 'timeline-date is-current' : 'timeline-date';
      const grade = showGrade && entry.grade ? `      <p>${esc(entry.grade)}</p>\n` : '';
      const note = entry.note ? `      <p>${rich(entry.note)}</p>\n` : '';

      let body = '';
      if (Array.isArray(entry.roles) && entry.roles.length) {
        body = entry.roles
          .map(
            (role) => `      <h4>${esc(role.title)} <span class="timeline-date">${esc(role.date)}</span></h4>
      <ul>
${(role.bullets || []).map((b) => `        <li>${rich(b)}</li>`).join('\n')}
      </ul>`
          )
          .join('\n');
      } else if (Array.isArray(entry.bullets) && entry.bullets.length) {
        body = `      <ul>
${entry.bullets.map((b) => `        <li>${rich(b)}</li>`).join('\n')}
      </ul>`;
      }

      return `    <article class="skill-category timeline-card glow-border">
      <div class="timeline-card-head">
        <h3>${esc(entry.title)}</h3>
        <span class="${dateClass}">${esc(entry.date)}</span>
      </div>
      <p class="timeline-org"><i class="fas ${esc(icon)}" aria-hidden="true"></i> ${esc(entry.org)}${
        entry.location ? ` &bull; ${esc(entry.location)}` : ''
      }</p>
${note}${grade}${body ? body + '\n' : ''}${tagList(entry.tags)}    </article>`;
    })
    .join('\n');
}

function renderServices(services) {
  return (services || [])
    .map((s) => {
      const points = (s.points || []).map((p) => `<li>${esc(p)}</li>`).join('');
      return `    <article class="project-waterfall-card">
      <h3 class="project-title">${esc(s.title)}</h3>
      <p class="project-description">${rich(s.body)}</p>
${points ? `      <ul class="project-metrics">${points}</ul>\n` : ''}    </article>`;
    })
    .join('\n');
}

function renderProjects(projects, strings) {
  return (projects || [])
    .map((p) => {
      const metrics =
        p.metrics && p.metrics.length
          ? `      <ul class="project-metrics">${p.metrics
              .map((m) => `<li>${esc(m)}</li>`)
              .join('')}</ul>\n`
          : '';
      const links = [];
      if (p.url) {
        links.push(
          `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer" class="project-link"><i class="fab fa-github" aria-hidden="true"></i> ${esc(
            strings.projectCode || 'Code'
          )}</a>`
        );
      }
      if (p.demo) {
        links.push(
          `<a href="${esc(p.demo)}" target="_blank" rel="noopener noreferrer" class="project-link demo"><i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i> ${esc(
            strings.projectDemo || 'Demo'
          )}</a>`
        );
      }
      const linkBlock = links.length
        ? `      <div class="project-links">${links.join('')}</div>\n`
        : '';

      return `    <article class="project-waterfall-card">
      <div class="project-icon" style="background:${esc(p.color || '#3b82f6')}22">
        <i class="fas ${esc(p.icon || 'fa-cube')}" style="color:${esc(p.color || '#3b82f6')}" aria-hidden="true"></i>
      </div>
      <h3 class="project-title">${esc(p.title)}</h3>
      <p class="project-subtitle">${esc(p.subtitle || '')}${p.date ? ` &bull; ${esc(p.date)}` : ''}</p>
      <p class="project-description">${rich(p.description)}</p>
${metrics}      <div class="project-tags">${(p.tags || [])
        .map((t) => `<span class="project-tag">${esc(t)}</span>`)
        .join('')}</div>
${linkBlock}    </article>`;
    })
    .join('\n');
}

function renderPublications(data) {
  if (!data.flags || data.flags.showPublications === false) return '';
  const items = (data.publications || [])
    .map(
      (pub) => `    <li class="pub-item">
      <h3>${esc(pub.title)}</h3>
      <p class="pub-venue">${esc(pub.venue)}</p>
${pub.url ? `      <a href="${esc(pub.url)}" target="_blank" rel="noopener noreferrer"><i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i> ${esc(data.strings.publicationsLink || 'Read the paper')}</a>\n` : ''}    </li>`
    )
    .join('\n');

  const note = data.publicationsNote
    ? `  <p class="pub-note">${rich(data.publicationsNote)}</p>\n`
    : '';

  return `<section id="publications" class="section reveal">
  <div class="section-header">
    <h2 class="section-title">${esc(data.strings.sections.publicationsTitle)}</h2>
    <p class="section-subtitle">${esc(data.strings.sections.publicationsSubtitle)}</p>
  </div>
  <ul class="pub-list">
${items}
  </ul>
${note}</section>`;
}

/* ------------------------------------------------------------------ */
/* CV documents                                                        */
/* ------------------------------------------------------------------ */

/**
 * A region may offer several documents, not one.
 *
 * The original shape is still valid and is still what every region file uses:
 *
 *   "cv": { "href": "assets/cv/uk.pdf", "downloadName": "..." }
 *
 * Extra documents are declared alongside it:
 *
 *   "cv": { "documents": { "academic": { "href": "...", "downloadName": "..." } } }
 *
 * `cv.documents` is an object keyed by id, not an array, on purpose. Arrays
 * replace wholesale in deepMerge, so an array declared in data.base.json could
 * never be extended by a region: a region wanting to add one document would
 * have to restate every other one. As an object it merges key by key, so the
 * base can declare the shared academic CV, a region can add its own entries,
 * and a region that does not want one drops it with an explicit null.
 *
 * `cv.href` survives as the document with id "primary", first in the list, so a
 * region file nobody has touched renders exactly what it rendered before.
 *
 * Order is: primary, then the documents in declaration order (base keys keep
 * their position, a region's own additions follow them).
 *
 * Labels come from strings.cv.labels[id], which every language can localise.
 * "primary" falls back to strings.hero.cvCta, already translated everywhere.
 * Existence on disk is checked by the caller, not here.
 */
function resolveCvDocuments(data, cc) {
  const cv = isPlainObject(data.cv) ? data.cv : {};
  const labels = (isPlainObject(data.strings.cv) && data.strings.cv.labels) || {};
  const docs = [];

  const declared = isPlainObject(cv.documents) ? cv.documents : {};
  for (const [id, doc] of Object.entries(declared)) {
    // `_todo` and friends are notes, and an explicit null is a deletion.
    if (id.startsWith('_') || doc === null || doc === undefined) continue;
    if (!isPlainObject(doc) || !doc.href) {
      fail(`[${cc}] cv.documents.${id} needs an href: a path from the repository root, no leading slash.`);
      continue;
    }
    docs.push({
      id,
      href: doc.href,
      downloadName: doc.downloadName || doc.href.split('/').pop(),
      label: labels[id] || doc.label,
    });
  }

  // The single-document shape. Skipped if a documents entry already names the
  // same file, so a region can move its main CV into `documents` under its own
  // id without it appearing twice.
  if (cv.href && !docs.some((d) => d.href === cv.href)) {
    docs.unshift({
      id: 'primary',
      href: cv.href,
      downloadName: cv.downloadName || 'CV.pdf',
      label: labels.primary || data.strings.hero.cvCta || cv.label,
    });
  }

  return docs.filter((doc) => {
    if (doc.label) return true;
    fail(`[${cc}] the CV document "${doc.id}" has no label. Add strings.cv.labels.${doc.id} so every language can translate it.`);
    return false;
  });
}

function renderContact(data) {
  const s = data.strings.contact;
  const p = data.personal;
  const rows = [];

  const row = (icon, label, inner) => `      <div class="contact-item">
        <div class="contact-icon"><i class="fas ${icon}" aria-hidden="true"></i></div>
        <div class="contact-details">
          <h3>${esc(label)}</h3>
          <p>${inner}</p>
        </div>
      </div>`;

  rows.push(row('fa-envelope', s.emailLabel, `<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>`));
  if (data.flags.showPhone && p.phone) {
    rows.push(
      row('fa-phone', s.phoneLabel, `<a href="tel:${esc(p.phone.replace(/\s+/g, ''))}">${esc(p.phone)}</a>`)
    );
  }
  rows.push(
    row(
      'fa-code-branch',
      s.githubLabel,
      `<a href="${esc(p.github)}" target="_blank" rel="noopener noreferrer">${esc(p.githubHandle)}</a>`
    )
  );
  rows.push(
    row('fa-location-dot', s.locationLabel, `${esc(p.location)}${p.relocation ? ` &bull; ${esc(p.relocation)}` : ''}`)
  );
  if (data.workAuthorisation) {
    rows.push(row('fa-passport', s.authorisationLabel, rich(data.workAuthorisation)));
  }

  return rows.join('\n');
}

/* ------------------------------------------------------------------ */
/* page assembly                                                       */
/* ------------------------------------------------------------------ */

function buildRegion(cc, base, template, lang = null, maps = { paths: {} }) {
  // `lang` builds a language variant of a region — e.g. /in/hi/ — by layering
  // data.<cc>.<lang>.json on top of data.<cc>.json. The geo routing is unchanged
  // by this: a country still maps to one region, and the region's default page is
  // still the one the edge redirects to. Languages are a choice inside a region,
  // not a new region.
  const countryPath = join(ROOT, 'assets', `data.${cc}.json`);
  if (!existsSync(countryPath)) {
    fail(`assets/data.${cc}.json is missing. Every region listed in site.regions needs one.`);
    return null;
  }

  let country;
  try {
    country = JSON.parse(readFileSync(countryPath, 'utf8'));
  } catch (err) {
    fail(`assets/data.${cc}.json is not valid JSON: ${err.message}`);
    return null;
  }

  let data = deepMerge(base, country);

  // Language variant: data.<cc>.<lang>.json layers on top of the region's own file.
  if (lang) {
    const langPath = join(ROOT, 'assets', `data.${cc}.${lang}.json`);
    if (!existsSync(langPath)) {
      fail(`assets/data.${cc}.${lang}.json is missing but ${cc} lists ${lang} in its languages.`);
      return null;
    }
    try {
      data = deepMerge(data, JSON.parse(readFileSync(langPath, 'utf8')));
    } catch (err) {
      fail(`assets/data.${cc}.${lang}.json is not valid JSON: ${err.message}`);
      return null;
    }
  }

  // ordering / hiding by id, applied after the merge
  data.skills = applyHide(applyOrder(data.skills, country.order?.skills, 'order.skills', cc), country.hide?.skills, 'hide.skills', cc);
  data.projects = applyHide(applyOrder(data.projects, country.order?.projects, 'order.projects', cc), country.hide?.projects, 'hide.projects', cc);
  data.experience = applyOrder(data.experience, country.order?.experience, 'order.experience', cc);
  data.about = applyOrder(data.about, country.order?.about, 'order.about', cc);

  if (!data.meta || data.meta.cc !== cc) {
    fail(`assets/data.${cc}.json must set meta.cc to "${cc}".`);
  }

  const defaultRegion = base.site.defaultRegion;
  const origin = data.site.origin.replace(/\/$/, '');
  const canonical = `${origin}/${cc}/`;

  const explicitNoindex = country.flags && Object.prototype.hasOwnProperty.call(country.flags, 'noindex')
    ? country.flags.noindex
    : null;
  const noindex = explicitNoindex === null ? cc !== defaultRegion : Boolean(explicitNoindex);

  // How far the page sits below the repository root. A language variant lives at
  // /<cc>/<lang>/, one level deeper than /<cc>/, and every path the page emits
  // (assets, CV PDFs) has to climb that far back up.
  const outDir = lang ? `${cc}/${lang}` : cc;
  const UP = lang ? '../../' : '../';

  /* CV downloads. Deliberately fail-safe: if a file named in the data is not on
     disk, that entry is left out rather than shipping a 404 or, worse, an
     outdated PDF. A CV is a document a recruiter will interrogate line by line,
     so a stale one is more damaging than none. */
  const cvDocs = resolveCvDocuments(data, cc).filter((doc) => {
    if (existsSync(join(ROOT, doc.href))) return true;
    warn(`[${cc}] no file at "${doc.href}": the "${doc.label}" download is omitted from ${outDir}/index.html. Add the file and rebuild.`);
    return false;
  });

  const cvIcon = '<i class="fas fa-file-pdf" aria-hidden="true"></i>';

  /* One document keeps the button and the preview modal it has always had.
     Several documents become a list of direct downloads instead: assets/js/site.js
     binds one #cv-open button to one data-cv path, so a preview per document
     would need script changes this build does not own. The list is plain links,
     which also means it works with JavaScript off. */
  let cvButton = '';
  let cvModal = '';

  if (cvDocs.length === 1) {
    const doc = cvDocs[0];
    cvButton = `        <button type="button" class="btn btn-secondary magnetic-btn" id="cv-open" data-cv="${esc(UP + doc.href)}">${cvIcon} ${esc(doc.label)}</button>`;
    cvModal = `<!-- CV modal. The PDF is fetched only when this is opened. -->
<div id="cv-modal" class="cv-modal" hidden>
  <div class="cv-modal-panel" role="dialog" aria-modal="true" aria-labelledby="cv-modal-title">
    <div class="cv-modal-head">
      <h2 id="cv-modal-title">${esc(data.strings.cv.modalTitle)} &mdash; ${esc(data.personal.displayName)}</h2>
      <button type="button" id="cv-close" class="cv-modal-close" aria-label="${esc(data.strings.cv.close)}">&#x2715;</button>
    </div>
    <iframe id="cv-frame" title="${esc(data.strings.cv.modalTitle)}" src="about:blank"></iframe>
    <div class="cv-modal-actions">
      <a id="cv-download" href="${esc(UP + doc.href)}" download="${esc(doc.downloadName)}" class="btn btn-primary"><i class="fas fa-download" aria-hidden="true"></i> ${esc(data.strings.cv.download)}</a>
      <a id="cv-newtab" href="${esc(UP + doc.href)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary"><i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i> ${esc(data.strings.cv.open)}</a>
    </div>
  </div>
</div>`;
  } else if (cvDocs.length > 1) {
    cvButton =
      `        <ul class="cv-downloads">\n` +
      cvDocs
        .map(
          (doc) =>
            `          <li><a class="btn btn-secondary" href="${esc(UP + doc.href)}" download="${esc(doc.downloadName)}">${cvIcon} ${esc(doc.label)}</a></li>`
        )
        .join('\n') +
      `\n        </ul>`;
  }

  const seoTitle = data.seo?.title || `${data.personal.displayName} — ${data.personal.title}`;
  const seoDescription = data.seo?.description || truncate(data.summary.replace(/\s+/g, ' '), 158);

  // Prefer the region's own localised name for its own notice: the Japanese page
  // said "このサイトのJapan版" because meta.label is the English label used in the
  // build log and the switcher list. strings.regionNames is already localised.
  const regionLabel = data.strings?.regionNames?.[cc] || data.meta.label;
  const notice = (data.strings.region.notice || '').replace('{region}', regionLabel);

  // Language switcher — rendered only for a region that declares more than one
  // language (India). Plain links rather than a <select>, so it works with no
  // JavaScript and from file://, and so each language has a real URL to share.
  const regionCfg = base.site.regions.find((r) => r.cc === cc) || {};
  const langs = regionCfg.languages || [];
  const languageSwitcher = langs.length > 1
    ? `      <span class="lang-switcher" aria-label="${esc(data.strings?.language?.label || 'Language')}">\n` +
      langs.map((l) => {
        const href = l.default ? `${UP}${cc}/` : `${UP}${cc}/${l.code}/`;
        const current = (l.default && !lang) || l.code === lang;
        return current
          ? `        <span class="lang-current" aria-current="true">${esc(l.label)}</span>`
          : `        <a href="${href}" hreflang="${esc(l.code)}">${esc(l.label)}</a>`;
      }).join('\n') + `\n      </span>`
    : '';

  const options = base.site.regions
    .map(
      (r) =>
        `        <option value="${esc(r.cc)}"${r.cc === cc ? ' selected' : ''}>${esc(
          (data.strings.regionNames && data.strings.regionNames[r.cc]) || r.label
        )}</option>`
    )
    .join('\n');

  const noscriptLinks = base.site.regions
    .filter((r) => r.cc !== cc)
    .map(
      (r) =>
        `        <a href="${UP}${esc(r.cc)}/?region=${esc(r.cc)}">${esc(
          (data.strings.regionNames && data.strings.regionNames[r.cc]) || r.label
        )}</a>`
    )
    .join('\n');

  const workAuth = data.workAuthorisation
    ? `      <p class="work-auth"><i class="fas fa-passport" aria-hidden="true"></i> <span>${rich(
        data.workAuthorisation
      )}</span></p>`
    : '';

  const A = `${UP}assets/`;

  // Country-outline hero watermark removed on request. Kept the maps.json plumbing
  // intact so it can be restored by reverting this one line if ever wanted.
  const countryMap = '';

  const html = applySpelling(fillTokens(template, {
    LANG: esc(data.meta.lang),
    DIR: esc(data.meta.dir || 'ltr'),
    CC: esc(cc),
    TITLE: esc(seoTitle),
    DESCRIPTION: esc(seoDescription),
    NAME: esc(data.personal.name),
    DISPLAY_NAME: esc(data.personal.displayName),
    JOB_TITLE: esc(data.personal.title),
    HEADLINE: esc(data.headline),
    SUMMARY: rich(data.summary),
    EMPLOYER_BADGE: esc(data.personal.employer),
    LOCATION: esc(data.personal.location),
    PHOTO_ALT: esc(data.personal.profileImageAlt),
    GITHUB: esc(data.personal.github),
    GITHUB_HANDLE: esc(data.personal.githubHandle),
    EMAIL: esc(data.personal.email),
    CANONICAL: esc(canonical),
    OG_LOCALE: esc((data.meta.lang || 'en').replace('-', '_')),
    ROBOTS: noindex ? '<meta name="robots" content="noindex,follow">\n' : '',
    ASSETS: A,
    CV_BUTTON: cvButton,
    CV_MODAL: cvModal,
    TYPED_FIRST: esc(data.typedPhrases[0] || ''),
    REGION_NOTICE: esc(notice),
    REGION_OPTIONS: options,
    LANGUAGE_SWITCHER: languageSwitcher,
    COUNTRY_MAP: countryMap,
    REGION_NOSCRIPT: noscriptLinks,
    REGIONS_JSON: JSON.stringify({
      current: cc,
      defaultRegion,
      regions: base.site.regions.map((r) => r.cc),
      typed: data.typedPhrases,
    }),
    NAV_LINKS: navLinks(data),
    STATS: renderStats(data.stats),
    WORK_AUTH: workAuth,
    ABOUT: renderAbout(data.about),
    SKILLS: renderSkills(data.skills),
    EXPERIENCE: renderTimeline(data.experience, { icon: 'fa-building', showGrade: false }),
    EDUCATION: renderTimeline(data.education, { icon: 'fa-graduation-cap', showGrade: data.flags.showGrade }),
    PROJECTS: renderProjects(data.projects, data.strings),
    SERVICES: renderServices(data.services),
    PUBLICATIONS: renderPublications(data),
    CONTACT: renderContact(data),
    YEAR: String(new Date().getFullYear()),
    S_SKIP: esc(data.strings.skipToContent),
    S_GREETING: esc(data.strings.hero.greeting),
    S_CONTACT_CTA: esc(data.strings.hero.contactCta),
    S_GITHUB_CTA: esc(data.strings.hero.githubCta),
    S_REGION_LABEL: esc(data.strings.region.switchLabel),
    S_REGION_HELP: esc(data.strings.region.switchHelp),
    S_ABOUT_TITLE: esc(data.strings.sections.aboutTitle),
    S_ABOUT_SUBTITLE: esc(data.strings.sections.aboutSubtitle),
    S_SKILLS_TITLE: esc(data.strings.sections.skillsTitle),
    S_SKILLS_SUBTITLE: esc(data.strings.sections.skillsSubtitle),
    S_EXPERIENCE_TITLE: esc(data.strings.sections.experienceTitle),
    S_EXPERIENCE_SUBTITLE: esc(data.strings.sections.experienceSubtitle),
    S_EDUCATION_TITLE: esc(data.strings.sections.educationTitle),
    S_EDUCATION_SUBTITLE: esc(data.strings.sections.educationSubtitle),
    S_PROJECTS_TITLE: esc(data.strings.sections.projectsTitle),
    S_PROJECTS_SUBTITLE: esc(data.strings.sections.projectsSubtitle),
    S_SERVICES_TITLE: esc(data.strings.sections.servicesTitle || "Freelance services"),
    S_SERVICES_SUBTITLE: esc(data.strings.sections.servicesSubtitle || "Available for select projects."),
    S_CONTACT_TITLE: esc(data.strings.sections.contactTitle),
    S_CONTACT_SUBTITLE: esc(data.strings.sections.contactSubtitle),
    S_RIGHTS: esc(data.strings.footer.rights),
  }), data.meta.spelling);

  return { cc, lang, outDir, html, noindex, canonical };
}

function navLinks(data) {
  const n = data.strings.nav;
  const items = [
    ['about', n.about],
    ['skills', n.skills],
    ['experience', n.experience],
    ['education', n.education],
    ['projects', n.projects],
    ['services', n.services || 'Services'],
  ];
  if (data.flags.showPublications !== false) items.push(['publications', n.publications]);
  items.push(['contact', n.contact]);
  return items
    .map(([id, label]) => `      <li><a href="#${id}">${esc(label)}</a></li>`)
    .join('\n');
}

/* ------------------------------------------------------------------ */

function main() {
  const base = JSON.parse(readFileSync(join(ROOT, 'assets', 'data.base.json'), 'utf8'));
  const template = readFileSync(join(ROOT, 'templates', 'page.html'), 'utf8');
  // Country outlines for the hero backdrop. Missing file or missing region is not an
  // error: the page simply renders without one, which is what India does deliberately.
  let maps = { paths: {}, viewBox: '0 0 1000 1000' };
  try { maps = JSON.parse(readFileSync(join(ROOT, 'assets', 'maps.json'), 'utf8')); }
  catch { warnings.push('assets/maps.json missing — hero backdrops are omitted'); }
  const origin = base.site.origin.replace(/\/$/, '');

  const built = [];
  for (const region of base.site.regions) {
    const page = buildRegion(region.cc, base, template, null, maps);
    if (page) built.push(page);
    // Extra languages for this region. The first entry is the default and is the
    // page already built above, so it is not rebuilt here.
    for (const l of (region.languages || []).filter((x) => !x.default)) {
      const variant = buildRegion(region.cc, base, template, l.code, maps);
      if (variant) built.push(variant);
    }
  }

  if (problems.length) {
    console.error('\nBuild failed:\n' + problems.map((p) => `  - ${p}`).join('\n') + '\n');
    process.exit(1);
  }

  for (const w of warnings) console.warn(`  warning: ${w}`);

  if (CHECK_ONLY) {
    console.log(`check ok — ${built.length} pages render cleanly`);
    return;
  }

  for (const page of built) {
    const dir = join(ROOT, page.outDir);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), page.html, 'utf8');
    console.log(`  wrote ${page.outDir}/index.html  (${(page.html.length / 1024).toFixed(1)} KB)${page.noindex ? '  [noindex]' : '  [indexable]'}`);
  }

  const indexable = built.filter((p) => !p.noindex).map((p) => p.canonical);
  writeFileSync(
    join(ROOT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[`${origin}/`, ...indexable]
  .map((loc) => `  <url><loc>${loc}</loc></url>`)
  .join('\n')}
</urlset>
`,
    'utf8'
  );

  writeFileSync(
    join(ROOT, 'robots.txt'),
    `# Crawling is allowed everywhere on purpose: the non-default regional pages
# carry <meta name="robots" content="noindex,follow">, and a crawler has to be
# able to fetch a page to see that tag. Disallowing them here would keep the
# noindex from ever being read.
User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`,
    'utf8'
  );

  console.log(`  wrote sitemap.xml (${indexable.length + 1} indexable URLs) and robots.txt`);
}

main();
