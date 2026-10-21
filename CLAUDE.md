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
  (the actual git checkout pushed to GitHub) need to stay in sync — changes
  made in one must be copied to the other before committing.
