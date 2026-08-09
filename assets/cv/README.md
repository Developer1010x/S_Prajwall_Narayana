# CV PDFs

Per-country CVs live here as `uk.pdf`, `in.pdf`, `us.pdf`, `jp.pdf`, `de.pdf`, and each
country's data file points at its own: `"cv": { "href": "assets/cv/uk.pdf" }`.

If the file a region points at does not exist, the build prints a warning and **omits the
CV button and modal from that region's page**. That is deliberate. A CV is the document a
recruiter interrogates line by line, so shipping a stale or wrong one is worse than
shipping none.

The previously committed `assets/resume.pdf` was removed rather than reused: it titled him
"Software Development Engineer" and "DevOps Team Lead" (the offer letter says **AI
Engineer**) and it printed a LinkedIn URL, which must not appear anywhere on this site.
It remains in git history if anyone needs to look at it.
