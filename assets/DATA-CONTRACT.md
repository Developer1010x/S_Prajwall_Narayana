# Data contract

Read this before editing any `data.*.json`. It is the whole agreement between the
per-country data files and the build.

## Files

| File | Purpose | Who owns it |
| --- | --- | --- |
| `assets/data.base.json` | Everything shared by all five regions. The complete content of the site. | shared |
| `assets/data.uk.json` | United Kingdom overrides **only** | UK agent |
| `assets/data.in.json` | India overrides **only** | India agent |
| `assets/data.us.json` | United States overrides **only** | US agent |
| `assets/data.jp.json` | Japan overrides **only** | Japan agent |
| `assets/data.de.json` | Germany overrides **only** | Germany agent |

Exact filenames, lowercase two-letter code, no other regions. A missing country file is
a build failure, not a silent fallback.

Never copy the whole of `data.base.json` into a country file. If a value is the same as
the base, leave it out.

## Merge rules

The build does `merged = deepMerge(data.base.json, data.<cc>.json)`:

1. **Key absent in the country file** → the base value is used. This is the normal case.
2. **Plain objects merge recursively**, key by key. Overriding
   `strings.sections.aboutTitle` leaves every other string alone.
3. **Arrays replace wholesale.** There is no element-by-element merging. Supplying
   `projects` replaces all six projects — use `order` / `hide` (below) instead.
4. **An explicit `null` deletes the key.** `"workAuthorisation": null` hides the block;
   `"publicationsNote": null` drops that line.
5. Keys starting with `_` (`_readme`, `_todo`) are ignored by the build. Use `_todo` for
   anything you could not fill in. **Never invent a fact to fill a gap.**

## Required in every country file

```json
{
  "meta": {
    "cc": "uk",                 // must equal the filename's code, or the build fails
    "label": "United Kingdom",  // shown in the region bar and the switcher
    "lang": "en-GB",            // goes into <html lang>. Only set 'ja'/'de' once
    "dir": "ltr",               //   strings.* are actually translated.
    "spelling": "en-GB"         // documentation only; the build does not read it
  }
}
```

## Ordering and emphasis — use these, not array replacement

Top-level `order` and `hide` objects, keyed by the id fields already in the base data:

```json
{
  "order": {
    "skills":     ["infra", "ai", "backend", "ml"],
    "projects":   ["arogya-sathi", "agentic-devops", "pybridge", "knotes-central"],
    "experience": ["colligence", "rvce-coe", "ey"],
    "about":      ["platform", "product", "research"]
  },
  "hide": {
    "projects": ["audio-deepfake"],
    "skills": []
  }
}
```

* Ids named in `order` come first, in that order. Anything unnamed keeps its base order
  behind them. You do not have to list everything.
* An unknown id **fails the build** with the list of valid ids. It is never ignored.
* `hide` is available for `projects` and `skills` only.

Ids in the base data:

| Collection | Ids |
| --- | --- |
| `about` | `product`, `platform`, `research` |
| `skills` | `ai`, `infra`, `backend`, `ml` |
| `experience` | `colligence`, `rvce-coe`, `ey` |
| `education` | `rvce` |
| `projects` | `arogya-sathi`, `agentic-devops`, `pybridge`, `knotes-central`, `llm-terminal`, `audio-deepfake` |
| `publications` | `educonnect`, `resnet50`, `rover` |

**Balance rule:** `ai` and `infra` are the first two skill groups on purpose, so they
render side by side on the same row with identical weight. Reordering them is fine;
pushing either below `backend`/`ml` is not — it tilts the whole page.

## Keys a country file is expected to set

| Key | Type | Effect when absent |
| --- | --- | --- |
| `meta` | object | **required** |
| `headline` | string | base headline |
| `summary` | string | base summary — the hero paragraph |
| `workAuthorisation` | string \| null | nothing rendered. Set it to the visa/right-to-work line for that country. Appears in the hero and in Contact. |
| `cv.href` | string | the region's own CV. See [CV documents](#cv-documents). |
| `cv.downloadName` | string | `S-Prajwall-Narayana-CV.pdf` |
| `cv.documents` | object | extra documents offered alongside `cv.href`. See [CV documents](#cv-documents). |
| `strings.*` | object | English base strings. Override any subset for localisation. |
| `strings.regionNames` | object | English region names in the switcher. |
| `seo.title` / `seo.description` | string \| null | `"<name> — AI Engineer"` and the first 300 chars of `summary`. |
| `flags.showGrade` | bool | `false`. the CGPAis shown only where the convention expects it. |
| `flags.showPhone` | bool | `true` |
| `flags.showPublications` | bool | `true` |
| `flags.noindex` | bool \| null | `null` = auto: indexable only if this is `site.defaultRegion` (`uk`). |
| `typedPhrases` | array | base list. Replaces wholesale; keep AI and infrastructure phrases alternating. |
| `stats`, `about`, `skills`, `experience`, `education`, `projects`, `publications` | array | base content. Replaces wholesale — prefer `order`/`hide`. |

`site.*` and `personal.*` are shared and should not be overridden per region, with one
exception: `personal.location` / `personal.relocation` may be reworded if a country's
convention needs it.

## CV documents

A region offers **one or more** downloadable documents: its own CV, and anything shared
that also applies to it (today, the academic CV used for MSc applications).

### The single-document shape still works

```json
{
  "cv": {
    "href": "assets/cv/uk-en.pdf",
    "downloadName": "S-Prajwall-Narayana-CV-UK.pdf"
  }
}
```

That is the region's own CV. It is the document with the id **`primary`**, and it is
always first in the list. A country file written before `cv.documents` existed needs no
change at all.

`href` is a path **from the repository root, with no leading slash**. The build works out
how far up to climb, so the same value is correct for `/uk/` and for `/in/hi/`.

### Offering more than one

Additional documents go in `cv.documents`, keyed by id:

```json
{
  "cv": {
    "href": "assets/cv/uk-en.pdf",
    "documents": {
      "academic": {
        "href": "assets/cv/academic-en.pdf",
        "downloadName": "S-Prajwall-Narayana-Academic-CV.pdf"
      }
    }
  }
}
```

`cv.documents` is an **object, not an array**, on purpose. Arrays replace wholesale
(merge rule 3), so an array in `data.base.json` could never be extended: a region adding
one document would have to restate every other one. As an object it merges key by key, so
`data.base.json` declares the shared academic CV once and every region inherits it.

* **Order** is `primary` first, then the documents in declaration order. Keys from
  `data.base.json` keep their position; a region's own additions follow them.
* **Dropping one** uses the normal `null` deletion (merge rule 4):
  `"cv": { "documents": { "academic": null } }`.
* Keys starting with `_` are notes and are ignored, as everywhere else.
* If a `documents` entry has the same `href` as `cv.href`, the `primary` entry is skipped
  rather than listed twice. That is how a region moves its own CV into `documents` under
  a different id.
* `downloadName` defaults to the file's own name. Set it: `uk-en.pdf` is not what anyone
  wants sitting in their downloads folder.

### Labels

Every document needs a label, and labels are **localisable** rather than baked into the
document entry:

```json
{
  "strings": {
    "cv": {
      "labels": { "academic": "Academic CV" }
    }
  }
}
```

* `strings.cv.labels.<id>` is the label for that id.
* `primary` falls back to `strings.hero.cvCta`, which every language already sets, so the
  region's own CV keeps the label it has always had ("Resume", "Lebenslauf", "職務経歴書").
* A document with no label anywhere **fails the build**, naming the key to add. Nothing is
  guessed and no English label is silently substituted, so a translated page never picks
  up an English button by accident.
* Language files (`data.in.hi.json`, `data.jp.json`, …) should translate every id in
  `strings.cv.labels`. Until they do, the base English label shows through.

### How it renders, and what happens when a file is missing

* **One document available** → the button it has always been, plus the preview modal.
* **Several available** → a small list of download links, one per document, each with its
  own label. No modal: `assets/js/site.js` binds a single button to a single PDF, and the
  list is deliberately plain links so it also works with JavaScript off.
* **A file that is not on disk** → that entry is dropped, with a build warning naming the
  path and the page. The rest still render. If nothing is left, the page has no CV button
  and no modal.

That last rule is the important one and it is deliberate. A CV is the document a recruiter
interrogates line by line, so a 404 or a stale PDF is worse than no button.

## Text handling

* All values are HTML-escaped. You cannot inject markup, and you do not need to escape
  anything yourself — write `&`, `<` and quotes literally.
* The one exception: `**bold**` in `summary`, `about[].body`, bullets, project
  descriptions, `workAuthorisation` and `publicationsNote` becomes `<strong>`.
* No emoji. Not in headings, not anywhere.

## After editing

```bash
npm run check    # validates every region without writing files
npm run build    # regenerates the eight pages, sitemap.xml and robots.txt
```

A build failure prints the exact file, key and reason. Do not commit a data change
without running one of these.
