# tools/

Maintenance scripts for working across all 76 HTML pages (38 DE + 38 EN
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

Since 2026-10-22 this script also regenerates the `<footer class="site">…
</footer>` block (`FOOTER_COMPARE_DE/EN`, `FOOTER_CALC_DE/EN`,
`FOOTER_ABOUT_DE/EN`). Before that, the footer was hand-duplicated into
every page and never regenerated at all, which let pages drift silently —
one page's EN footer still had category labels from before a previous
rename months after everywhere else had been updated. A handful of pages
legitimately need their own footer-legal disclaimer sentence, because the
generic one would misstate what they do (a mortgage page isn't "opening an
account", a budget tracker has no affiliate link at all) — those live in
`FOOTER_LEGAL_OVERRIDES`, keyed by filename. If you add a page whose
product genuinely isn't a plain "account" in the Finanzpal sense, add an
override there rather than letting the default sentence go out inaccurate.

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

## compute_scores.py

Computes the Finanzpal-Score (0–100 + band A–D) for each category from fields
already in `data/*.json` and writes `score` back into the DE file and, by id,
into the matching EN file (DE is the source of truth). Rubrics and weights are
documented in the script and on `ueber-uns.html#finanzpal-score`.

```
python3 -I tools/compute_scores.py
```

An item with `"scoreHold": "<reason>"` is skipped: it gets no score (an
existing one is removed in DE and EN) until the field is deleted — use this
when a score input for that provider isn't verified yet. After running, also
run `cd mobile && npm run sync-data` so the app gets the same scores.

## Not included here

Sitemap-generation scripts were deliberately left out: the ones used
earlier in development had a hardcoded `LASTMOD` date and no longer reflect
how `sitemap.xml` is actually maintained (it's been hand-edited directly
since). Rather than commit a script that would mislead whoever runs it
next, `sitemap.xml` should keep being edited by hand (or a fresh generator
written against its current structure) until that's worth automating again.
