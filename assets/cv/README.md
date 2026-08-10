# CV PDFs

Files here are named `<cc>-<lang>.pdf`: `uk-en.pdf`, `in-en.pdf`, `us-en.pdf`, `jp-ja.pdf`,
`jp-en.pdf`, `de-de.pdf`, `de-en.pdf`, plus the shared `academic-en.pdf`.

A region points at its own with `"cv": { "href": "assets/cv/in-en.pdf" }`, and offers a second document only where one is declared under that region's `cv.documents`. A page with one available document renders the CV button and the
preview modal; a page with several renders a small list of download links instead. The
shape is documented in `assets/DATA-CONTRACT.md` under "CV documents".

If the file a region points at does not exist, the build prints a warning and **omits that
download** from the page. The rest still render. That is deliberate. A CV is the document
a recruiter interrogates line by line, so shipping a stale or wrong one is worse than
shipping none.

## Current state

| File | Wired up | Note |
| --- | --- | --- |
| `in-en.pdf` | yes, `/in/` and its language variants | |
| `us-en.pdf` | yes, `/us/` | |
| `de-de.pdf` | yes, `/de/` | |
| `jp-ja.pdf` | yes, `/jp/` | |
| `de-en.pdf` | no | The same Lebenslauf in English. Adding it needs a German label, so it is left to whoever owns the German copy. |
| `jp-en.pdf` | no | The same career history in English. Adding it needs a Japanese label, same reason. |
| `uk-en.pdf` | yes, `/uk/` | Header reads **Liverpool**, matching the sources. |

`de-de.pdf` and `jp-ja.pdf` are in languages Prajwall does not read, so each has to carry a
note that it has not been reviewed by a native speaker. `de-de.pdf` carries one.
**`jp-ja.pdf` does not appear to**, and that needs fixing by whoever generates it.

The previously committed `assets/resume.pdf` was removed rather than reused: it titled him
"Software Development Engineer" and "DevOps Team Lead" (the offer letter says **AI
Engineer**) and it printed a LinkedIn URL, which must not appear anywhere on this site.
It remains in git history if anyone needs to look at it.


## Regenerating

These are build artifacts of the HTML in the CV repository, and they go stale silently -
`in-en.pdf` shipped a removed screening strip and a CGPA that no source had said for some
time. Regenerate from the source rather than editing a PDF:

    google-chrome --headless --no-pdf-header-footer \
      --print-to-pdf=in-en.pdf --virtual-time-budget=8000 \
      "file:///path/to/Country/in/resume_in.html"

Sources, confirmed by regenerating each and diffing the extracted text against the
committed file:

| PDF | Source |
| --- | --- |
| `uk-en.pdf` | `uk/cv_uk.html` |
| `in-en.pdf` | `in/resume_in.html` |
| `us-en.pdf` | `us/resume_us.html` |
| `jp-ja.pdf` / `jp-en.pdf` | `jp/shokumu_keirekisho_{jp,en}.html` |
| `de-de.pdf` / `de-en.pdf` | `de/lebenslauf_{de,en}.html` |

**These PDFs carry his real email and phone number, and they are served from the public
site.** The web pages use a spam-trap alias instead; the PDFs deliberately do not. That is
his decision, not an oversight - do not "fix" it either way without asking him.
