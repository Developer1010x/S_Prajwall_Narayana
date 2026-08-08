# S Prajwall Narayana — portfolio

Static, country-aware portfolio. Five regional versions built from **one template and
one stylesheet**, plus server-side geo routing at the Vercel edge.

```
middleware.js              edge geo routing (server-side, runs before any file is served)
index.html                 root: region picker + local/static fallback router
templates/page.html        THE template. Every regional page is rendered from this file.
scripts/build.mjs          the build: data -> five pages + sitemap.xml + robots.txt
assets/
  data.base.json           everything shared between regions
  data.uk|in|us|jp|de.json per-region overrides only  (see assets/DATA-CONTRACT.md)
  css/site.css             THE stylesheet, shared by all six pages
  js/site.js               THE script, shared by all six pages
  images/, favicon.*
  cv/                      per-country CV PDFs (see assets/cv/README.md)
uk/ in/ us/ jp/ de/        GENERATED — do not edit index.html inside these
```

## Build

```bash
npm run build     # regenerate uk/ in/ us/ jp/ de/ index.html, sitemap.xml, robots.txt
npm run check     # render everything to memory and fail on any data problem
npm start         # serve locally on http://localhost:3000
```

`vercel.json` runs `npm run build` on every deploy, so a data-only change is deployed
correctly even if someone forgets to run the build locally. **Never hand-edit
`uk/index.html` and friends** — the next build overwrites them. Edit the data or the
template.

## Geo routing

`middleware.js` is Vercel Edge Middleware. It runs on the server before any static file
is served, which is the only mechanism in a static site that can actually enforce this.
It reads the `x-vercel-ip-country` header Vercel injects at the edge:

| Country header | Region |
| --- | --- |
| `IN` | `/in/` |
| `GB` | `/uk/` |
| `US` | `/us/` |
| `JP` | `/jp/` |
| `DE` | `/de/` |
| anything else | `/uk/` |

**The `/uk/` default is deliberate, not an accident.** Visitors from the 190-odd
countries with no page of their own get the UK version because it is the most
conservative of the five: British spelling, no photo, no personal data beyond contact
details. It is the safest thing to show a stranger from anywhere. Change
`DEFAULT_REGION` in `middleware.js` if that judgement changes; it is a single constant.

A request for the wrong region is **redirected** (HTTP 307), not merely discouraged.
An Indian visitor who types `/uk/` is sent to `/in/`.

### Escape hatch 1 — `?region=<cc>` (owner override)

Append `?region=uk` to any URL. The middleware sets a `pn_region` cookie (30 days,
`SameSite=Lax`) and redirects to the clean `/uk/` URL, bypassing geo entirely from then
on. This is how Prajwall sends a UK recruiter the UK page while sitting in Bengaluru:

```
https://sprajwallnarayana.com/uk/?region=uk
```

The recipient gets the same cookie, so the link works for them too, from any country.

### Escape hatch 2 — the region switcher

Every page carries a visible bar at the top: *"You are viewing the United Kingdom
version of this site"* with a region `<select>`. Choosing a region writes the same
`pn_region` cookie and navigates. Being wrong about someone's country is never a dead
end, and it degrades to plain links inside `<noscript>`.

Precedence: `?region=` → `pn_region` cookie → geo-IP header → default.

### What this does not do — read before describing it to anyone

Edge geo-IP is accurate in the common case and useless against anyone who does not want
it to work:

* A VPN, a corporate proxy or a mobile carrier routing through another country presents
  a different country code. The visitor sees that country's page. No public website can
  prevent this.
* A cookie is client-side state. Anyone can set `pn_region` by hand.
* Crawlers are exempt on purpose (below), so a spoofed `User-Agent: Googlebot` reaches
  any region.

This **raises the floor** — a casual visitor lands on the right page and cannot browse
the others by guessing URLs. It is **not a security boundary** and nothing behind it
should be treated as private. Everything in these pages is public information.

### Crawlers, canonical tags and noindex

Googlebot crawls almost entirely from US IP addresses. With the redirect applied to it,
Googlebot would be pushed to `/us/` on every request and would never see any other page.
So `ALLOW_CRAWLERS` in `middleware.js` exempts known crawler user-agents from the geo
redirect. That is the one deliberate hole in the routing; the cost is stated above.

On top of that:

* Every regional page is **self-canonical** (`/uk/` canonicals to `/uk/`, etc.).
* Only the default region (`/uk/`) is indexable. The other four carry
  `<meta name="robots" content="noindex,follow">`, and `sitemap.xml` lists only `/` and
  `/uk/`.
* `robots.txt` **allows** crawling everywhere on purpose. A crawler has to be able to
  fetch a page to read its `noindex`; a `Disallow` would hide the tag and leave the
  pages eligible for indexing from external links.

**The tradeoff, stated rather than guessed at:** the five pages are ~90% identical
content, so letting all five compete splits ranking signals across near-duplicates, and
a searcher who clicked a `/jp/` result from Germany would immediately be redirected —
which looks broken and wastes the click. One indexable page avoids both. The cost is
that regional pages earn no organic traffic of their own; they are for links Prajwall
sends and for visitors the edge routes. The alternative — indexing all five with
`hreflang` — is the right pattern for *language* variants served **without** forced
redirects, and it fights the geo redirect rather than complementing it. If the site ever
drops the redirect, switch to hreflang and delete the noindex tags; that is a
five-line change in `scripts/build.mjs`.

To make a different region indexable, set `"flags": { "noindex": false }` in that
region's data file. `null` (the default) means "auto": indexable only if it is
`site.defaultRegion`.

## Running without Vercel

The site is plain static files with no runtime dependency on the edge. Opened from
`file://` or served by any static host:

* `index.html` routes using a stored preference (`pn_region` cookie, then
  `localStorage`), and shows the region picker when there is none.
* Every regional page still works standalone — all content is rendered into the HTML at
  build time, so nothing depends on `fetch`, and the pages are readable with JavaScript
  disabled.
* The switcher and `?region=` still work; they persist to `localStorage` as well as the
  cookie. Only the *enforcement* is gone, which is expected: there is no server.

## Content rules

* The job title is **AI Engineer** everywhere, matching the offer letter. Nothing on
  this site may say otherwise — a title that disagrees with the offer letter breaks
  under background checks and visa sponsorship.
* The pages must stay balanced between AI/product work and platform/DevOps work. Country
  tuning changes conventions, spelling, length and visa framing. It must not tilt him
  towards either side.
* **No LinkedIn URL anywhere.** The account is restricted; the omission is deliberate.
  Use GitHub and this site.
* Nothing goes on these pages that is not a verified fact. No invented metrics, dates,
  employers or technologies.
* **No CV is committed right now.** The old `assets/resume.pdf` was removed rather than
  reused: it titled him "Software Development Engineer" and "DevOps Team Lead", and it
  printed a LinkedIn URL. Both break the rules above, and a linked PDF is part of the
  page. Until a per-country CV lands in `assets/cv/`, the build omits the CV button
  entirely — see `assets/cv/README.md`. The old file is still in git history.

## Performance notes

* One 100 KB inline-CSS page became six pages of ~27 KB each sharing one cached
  stylesheet and one cached script.
* The 60 KB OS-desktop script and 72 KB terminal script that the old page loaded but
  never used are gone, along with the dead `index2.html` they belonged to.
* `favicon.ico` was a 48 KB JPEG with an `.ico` extension. It is now a 5 KB 32/16px icon
  plus a 310-byte SVG.
* `logo.jpg` and `S_Prajwall_Narayana.jpg` were byte-identical 48 KB copies of the same
  file. One 35 KB 300×300 image remains.
* The CV PDF is not fetched on first paint. The CV modal sets the iframe `src` only when
  it is opened, and never on mobile — and the button is not rendered at all unless the
  file a region points at actually exists.
* The committed `.DS_Store` is gone and stays gone via `.gitignore`.
