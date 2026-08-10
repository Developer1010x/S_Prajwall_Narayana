# CV PDFs

Files here are named `<cc>-<lang>.pdf`: `uk-en.pdf`, `in-en.pdf`, `us-en.pdf`, `jp-ja.pdf`,
`jp-en.pdf`, `de-de.pdf`, `de-en.pdf`, plus the shared `academic-en.pdf`.

A region points at its own with `"cv": { "href": "assets/cv/in-en.pdf" }`, and every region
additionally offers `academic-en.pdf`, declared once in `data.base.json` under
`cv.documents.academic`. A page with one available document renders the CV button and the
preview modal; a page with several renders a small list of download links instead. The
shape is documented in `assets/DATA-CONTRACT.md` under "CV documents".

If the file a region points at does not exist, the build prints a warning and **omits that
download** from the page. The rest still render. That is deliberate. A CV is the document
a recruiter interrogates line by line, so shipping a stale or wrong one is worse than
shipping none.

## Current state

| File | Wired up | Note |
| --- | --- | --- |
| `academic-en.pdf` | yes, every region | English only. `strings.cv.labels.academic` is English on the Japanese, German, Hindi, Marathi and Kannada pages until those files translate it. |
| `in-en.pdf` | yes, `/in/` and its language variants | |
| `us-en.pdf` | yes, `/us/` | |
| `de-de.pdf` | yes, `/de/` | |
| `jp-ja.pdf` | yes, `/jp/` | |
| `de-en.pdf` | no | The same Lebenslauf in English. Adding it needs a German label, so it is left to whoever owns the German copy. |
| `jp-en.pdf` | no | The same career history in English. Adding it needs a Japanese label, same reason. |
| `uk-en.pdf` | **no, on purpose** | Its header line reads "Liverpool". The UK location is **Wirral**. Regenerate the PDF, then point `data.uk.json` `cv.href` at it. Until then `/uk/` offers only the academic CV. |

`de-de.pdf` and `jp-ja.pdf` are in languages Prajwall does not read, so each has to carry a
note that it has not been reviewed by a native speaker. `de-de.pdf` carries one.
**`jp-ja.pdf` does not appear to**, and that needs fixing by whoever generates it.

The previously committed `assets/resume.pdf` was removed rather than reused: it titled him
"Software Development Engineer" and "DevOps Team Lead" (the offer letter says **AI
Engineer**) and it printed a LinkedIn URL, which must not appear anywhere on this site.
It remains in git history if anyone needs to look at it.
