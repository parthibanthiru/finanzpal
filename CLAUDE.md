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
- Both `finanzpal-production/` (local test copy) and `finanzpal-website/`
  (the checked-out copy used for editing — the folder name predates the
  GitHub repo rename to `github.com/parthibanthiru/finanzpal` and was kept
  as-is) need to stay in sync — changes made in one must be copied to the
  other before committing.
- **Git commits/pushes happen from `/home/claude/finanzpal`, not
  `finanzpal-website/`.** `finanzpal-website/` and `finanzpal-production/`
  stay the editing/testing copies as above, but the actual `git add` /
  `commit` / `push` runs against `/home/claude/finanzpal` (a separate,
  properly-registered clone of the same repo under its current name) —
  copy the changed files there first. This exists because this session's
  original checkout kept reverting its own git remote back to the old
  `finanzpal-website` GitHub URL between turns (a session-registration
  quirk, not a real repo problem — pushes from the old location still
  succeeded via GitHub's redirect either way); the properly-registered
  clone at `/home/claude/finanzpal` doesn't have that problem. Keep all
  three directories' content in sync before committing.
- **Maintenance scripts live in `tools/`** (committed to the repo, not the
  session scratchpad): `build_nav.py` regenerates the nav across all 74
  pages, `add_article_icons.py` sets Ratgeber icon/accent colors,
  `audit_quick.py` is the Playwright regression check. See `tools/README.md`
  for usage and prerequisites. Add new one-off/debug scripts to `tools/`
  too if they're reusable across sessions; keep truly single-use debugging
  scripts out of git.
- **Mobile app in `mobile/`** uses this website as its single source of truth.
  After changing `data/*.json`, a disclosure text, or calculator logic
  (`sparplanrechner.js`, `kreditrechner.js`), run `cd mobile && npm run sync-data`
  (and mirror calculator changes in `mobile/lib/calc.ts`), then commit
  `mobile/data/` in the same commit. Commits touching only `mobile/` don't
  trigger a Netlify deploy (`netlify.toml` ignore rule).
