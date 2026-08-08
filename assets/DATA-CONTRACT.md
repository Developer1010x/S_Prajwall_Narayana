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
| `cv.href` | string | `assets/cv/cv.pdf`, which does not exist yet. Path **relative to the repository root, no leading slash** (e.g. `assets/cv/uk.pdf`). If the file is not on disk the build warns and **omits the CV button and modal from that page** — it never ships a 404 or a stale CV. |
| `cv.downloadName` | string | `S-Prajwall-Narayana-CV.pdf` |
| `strings.*` | object | English base strings. Override any subset for localisation. |
| `strings.regionNames` | object | English region names in the switcher. |
| `seo.title` / `seo.description` | string \| null | `"<name> — AI Engineer"` and the first 300 chars of `summary`. |
| `flags.showGrade` | bool | `false`. CGPA 6.66 is shown only where the convention expects it. |
| `flags.showPhone` | bool | `true` |
| `flags.showPublications` | bool | `true` |
| `flags.noindex` | bool \| null | `null` = auto: indexable only if this is `site.defaultRegion` (`uk`). |
| `typedPhrases` | array | base list. Replaces wholesale; keep AI and infrastructure phrases alternating. |
| `stats`, `about`, `skills`, `experience`, `education`, `projects`, `publications` | array | base content. Replaces wholesale — prefer `order`/`hide`. |

`site.*` and `personal.*` are shared and should not be overridden per region, with one
exception: `personal.location` / `personal.relocation` may be reworded if a country's
convention needs it.

## Text handling

* All values are HTML-escaped. You cannot inject markup, and you do not need to escape
  anything yourself — write `&`, `<` and quotes literally.
* The one exception: `**bold**` in `summary`, `about[].body`, bullets, project
  descriptions, `workAuthorisation` and `publicationsNote` becomes `<strong>`.
* No emoji. Not in headings, not anywhere.

## After editing

```bash
npm run check    # validates every region without writing files
npm run build    # regenerates the five pages, sitemap.xml and robots.txt
```

A build failure prints the exact file, key and reason. Do not commit a data change
without running one of these.
