# Working rules for this repo (Finanzpal website)

- **Auto-push:** commit and push to `origin/main` after every logical unit of
  work — don't wait to be asked. Each commit ends with the project's
  `Co-Authored-By` / `Claude-Session` trailer.
- **Keep README.md current:** whenever a change adds/removes a page, data
  file, asset/script, nav entry, or known open item (placeholder content,
  non-functional UI, missing affiliate links, etc.), update `README.md` in
  the same commit so it never drifts from the actual repo state. Don't wait
  to be asked.
- **Netlify SSO gate** stays enabled (site intentionally not public) unless
  explicitly told otherwise.
- **Data-integrity principle:** never assert a confident-sounding specific
  number (price, rate, rating) that isn't independently verifiable — use an
  explicit caveat/disclosure text, `null` fields, or individual-dependent
  framing instead (see the BU/Kfz/Baufinanzierung insurance tabs for the
  established pattern).
- **`/home/claude/finanzpal`** is the one and only git checkout: edit,
  commit, and push all happen here. (Earlier this repo was split across
  `finanzpal-website/` for editing and a separate `/home/claude/finanzpal`
  just for pushing, because the original checkout's git remote kept
  reverting to a stale pre-rename URL between turns — that's resolved by
  working in this directory instead, so the split is gone. If a fresh
  session somehow ends up with a `finanzpal-website/` checkout again and
  its pushes show a "repository moved" redirect notice or its remote URL
  doesn't stick, that's the same old issue — fix is to clone fresh into a
  new directory via the session's repo-attach tool rather than fighting
  the existing checkout.)
- **`/home/claude/finanzpal-test`** (local test copy) needs to stay in
  sync by hand — changes made in `/home/claude/finanzpal` must be copied
  there before running `python3 -m http.server` / `tools/audit_quick.py`
  against it. It has its own old, unrelated git history from early in the
  project; that's cosmetic and not used for anything — don't try to
  reconcile it with the real repo's history.
- **Maintenance scripts live in `tools/`** (committed to the repo, not the
  session scratchpad): `build_nav.py` regenerates the nav across all 74
  pages, `add_article_icons.py` sets Ratgeber icon/accent colors,
  `audit_quick.py` is the Playwright regression check. See `tools/README.md`
  for usage and prerequisites. Add new one-off/debug scripts to `tools/`
  too if they're reusable across sessions; keep truly single-use debugging
  scripts out of git.
- **Mobile app in `mobile/`** uses this website as its single source of truth.
  After changing `data/*.json` or `*.en.json`, a disclosure text (DE or EN), a
  `calc-disclaimer`, the Finanz-Check questions/weights in `assets/finanz-check.js`,
  the guide list in `ratgeber.html` / `en/ratgeber.html`, or calculator logic (any `assets/*rechner.js` or `haushaltsbuch.js`, incl. the
  yearly tax/SV values in `nettolohnrechner.js`), run
  `cd mobile && npm run sync-data` (and mirror calculator changes in
  `mobile/lib/calc.ts` / `mobile/lib/haushaltsbuch.ts`), then commit
  `mobile/data/` in the same commit. Commits touching only `mobile/` don't
  trigger a Netlify deploy (`netlify.toml` ignore rule).
- **App text in two languages:** any new interface text in `mobile/` goes into
  both `mobile/lib/strings/de.ts` and `en.ts` (the type check fails otherwise);
  English wording follows the website's `en/` pages.
