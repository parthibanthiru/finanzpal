# tools/

Maintenance scripts for working across all 74 HTML pages (37 DE + 37 EN
mirrors). The site has no templating layer — every page is an independent
file with the nav, footer, and (for Ratgeber) card markup duplicated
verbatim — so these scripts exist to apply a change consistently everywhere
instead of hand-editing file by file. See the "Technische Schulden" note in
the main `README.md` for the longer-term plan (migrating to a static-site
generator) if this duplication grows further.

All scripts derive their root path from their own location, so they can be
run from anywhere as long as they stay inside `tools/` in the repo:

```
python3 tools/<script>.py
```

## build_nav.py

Regenerates the `<nav class="top">…</nav>` block identically across every
page. `FILE_TO_KEY` maps each filename to which top-level nav group (and
which link within it) should render as "active" on that page; `DE_PANELS` /
`EN_PANELS` / labels define what's actually in the nav.

Run whenever a nav link is added, removed, renamed, or a page's active-group
mapping needs to change. Also run (and verify with a quick diff) after
adding a brand-new page to the site, since a new file won't appear in any
nav group until it's added to `FILE_TO_KEY`.

## add_article_icons.py

Applies a unique icon + theme-aware accent color to a Ratgeber article in
three places: its card on the `ratgeber.html` / `en/ratgeber.html` listing,
the logo badge on the article page itself, and any "Weiterlesen"
related-card linking to it from another article.

Run after adding a new Ratgeber article: add its filename to `MAP` (icon key
+ CSS color variable), then run the script. Reuse an existing icon key for a
similar topic, or add a new SVG path to `ICONS`. The color variable must
already exist as a token in `assets/style.css` (with a dark-mode override).

## audit_quick.py

Fast regression check: loads every page in headless Chromium at a mobile
viewport, in both light and dark theme, and flags any page that throws a JS
error or overflows horizontally. This is the check to run after any
site-wide edit (nav, footer, shared CSS) before committing.

**Needs a local server running first** — it does not serve the files
itself:

```
python3 -m http.server 8901   # from the repo root, in a separate terminal
python3 -I tools/audit_quick.py
```

Also needs a Chromium binary for Playwright; this environment has one
preinstalled at `/opt/pw-browsers/chromium` (see the `executable_path` in
the script). Elsewhere, run `playwright install chromium` first and drop
that argument.

## Not included here

Sitemap-generation scripts were deliberately left out: the ones used
earlier in development had a hardcoded `LASTMOD` date and no longer reflect
how `sitemap.xml` is actually maintained (it's been hand-edited directly
since). Rather than commit a script that would mislead whoever runs it
next, `sitemap.xml` should keep being edited by hand (or a fresh generator
written against its current structure) until that's worth automating again.
