# Finanzpal app — roadmap to "finished"

Work list for the **daily app agent** (scheduled task "Finanzpal app builder"). Each run takes the
first open item it can do, finishes it (incl. tests, CI green, docs), ticks it off here with the
date and a one-line note, and pushes. Items that need Parthiban are listed separately; the agent
skips them and never fakes them.

Status: `[ ]` open · `[x]` done · `[~]` blocked (reason in the note)

## Facts the agent needs

- Repo: `github.com/parthibanthiru/finanzpal`, app in `mobile/`, rules in `/CLAUDE.md`.
- Supabase project **Finanzpal** (org "Parthiban's Org", Frankfurt): ref `xliitgcsiikzxppazbfa`,
  URL `https://xliitgcsiikzxppazbfa.supabase.co`, publishable key
  `sb_publishable_CaMuP9DFbFbeTLf2J1SNTw_rXmuNPgb` (public by design — safe in the app; RLS protects
  the data). The project **SendWiseLab** belongs to a different app: never touch it.
- npm/registry access is blocked in the agent's workspace: verify through GitHub Actions
  (`mobile-app.yml`), exact package versions come from its `expo install --check` annotation.
- Web preview: workflow `mobile-web-preview.yml` → branch `web-preview`; private page
  "Finanzpal App-Vorschau" = `https://claude.ai/artifact/Rqw9ZETAcgc9eqYX9Vwb92` (republish it
  after visible changes: fetch the branch, set `<title>Finanzpal App-Vorschau</title>`, publish to
  that URL with the new bundle and `null` for the old bundle path).
- Database changes through the Supabase connector need a confirmation click; in a scheduled run
  nobody can click, so schema changes go into `supabase/schema.sql` + a note under "Needs
  Parthiban" instead of being applied.

## Every run first

1. `git pull`; `cd mobile && npm run sync-data` equivalent check (node works locally:
   `node tools/sync-data.mjs`) — if `mobile/data` changed, or website calculator/quiz/ETF logic
   changed since the last run (git log on `assets/*rechner.js`, `haushaltsbuch.js`,
   `finanz-check.js`, `etf-search.js`), mirror it in the app first (CLAUDE.md rules).
2. Check the latest `Mobile app check` run on `main`; a red check is fixed before anything else.

## Work list (in order)

- [x] **1. Connect the app to the Finanzpal Supabase project.** Default `EXPO_PUBLIC_SUPABASE_URL` /
      key in `eas.json` (preview + production) and `.env.example`; keep preview mode independent.
      Check with `list_tables` whether the schema exists (profiles, messages, favorites,
      push_tokens); if not, mark blocked on "Run schema.sql" below but still do the config.
      Auth settings to document for Parthiban: Site URL / redirect `finanzpal://auth-callback`.
      — 2026-11-02: URL + publishable key are the defaults in `eas.json` (preview + production) and
      `.env.example`; web preview unchanged. `list_tables` still empty → schema step stays open
      below. Auth URL settings documented in mobile/README.md §1.
- [x] **2. Chatbot as a Supabase Edge Function `chat`.** Same contract as `lib/api.ts`
      (`POST {sessionId, message, history, language}` → `{reply, category?}`), checks the user's JWT,
      calls the Anthropic Messages API with secret `ANTHROPIC_API_KEY` (model from secret
      `CHAT_MODEL`, default `claude-haiku-5-5`), system prompt: Finanzpal's role (general
      information and the site's comparisons, no individual investment/insurance advice, DE or EN
      per `language`, no invented rates — point to the comparisons instead, data-integrity rule from
      CLAUDE.md). Daily per-user limit (table `chat_usage`, added to schema.sql). Without the key it
      answers 503 and the app shows a friendly "chat not set up yet" text (DE/EN). Code in
      `supabase/functions/chat/`, app `EXPO_PUBLIC_API_URL` → the functions URL. Deploy with the
      connector if it works without a confirmation; otherwise leave deploy steps for Parthiban.
      — 2026-11-02: function written + deployed (v1, verify_jwt on); `chat_usage` + `bump_chat_usage`
      in schema.sql; app defaults to `{SUPABASE_URL}/functions/v1/chat`, 503/404 → "not set up yet",
      429 → daily limit (DE/EN), tests in `__tests__/api-test.ts`. Answers once key + schema exist.
- [ ] **3. Wide logos.** Wordmarks (ING DiBa, norisbank, Openbank, justTRADE, Trade Republic) are
      tiny in the square chip — give logos with aspect ratio > 2 a wider chip (from the viewBox),
      same height; check in the web preview.
- [ ] **4. Login/registration polish against the real project.** Error texts for real Supabase
      responses (email confirmation required, rate limits), "check your inbox" state after
      sign-up, password reset deep link. Screen tests for these states.
- [ ] **5. Store listing texts (DE + EN).** `mobile/store/`: app name, subtitle, short + long
      description, keywords, category, support/privacy URLs (placeholders until the domain), data
      safety / privacy-label answers derived from what the app actually stores (Supabase tables,
      device storage, push tokens). No claims the app can't back up.
- [ ] **6. Store screenshots.** From the web preview with Playwright at phone sizes (6.7" iPhone,
      Android phone), DE + EN, light mode: home, a comparison, score breakdown, Finanz-Check result,
      a calculator. Save under `mobile/store/screenshots/`.
- [ ] **7. Release build config.** `eas.json` profiles (development, preview APK, production),
      app version/build numbers, Android permissions minimal, iOS `infoPlist` usage strings, notification
      icon (white monochrome PNG generated from the logo). `expo-doctor` clean.
- [ ] **8. Accessibility + robustness pass.** Every pressable has a label/role, font scaling up to
      200 % doesn't clip (check in web preview with bigger text), offline behaviour (bundled data,
      friendly errors), empty states. Fix what's found, add tests.
- [ ] **9. Release checklist.** `mobile/RELEASE.md`: exact click-by-click steps for everything in
      "Needs Parthiban", in order, with what the agent already prepared. Then the work list is done:
      from then on each run only does the "Every run first" sync and reports "nothing to do" briefly.

## Needs Parthiban (agent skips these; ticks them only when it can verify they're done)

- [ ] **Run `mobile/supabase/schema.sql` once** in Supabase → project Finanzpal → SQL Editor (paste
      the file, Run). Verify: Table Editor shows profiles, messages, favorites, push_tokens.
      (Checked 2026-11-02: still no tables.)
- [ ] Supabase → Authentication → URL Configuration: Site URL `finanzpal://auth-callback`, Redirect
      URLs `finanzpal://**` and `exp://**`; Providers → Email: "Confirm email" on.
- [ ] Anthropic API key → Supabase → Edge Functions → Secrets `ANTHROPIC_API_KEY` (paid per use).
      The function `chat` is already deployed; it starts answering once this secret exists and
      schema.sql has run.
- [ ] Expo account + `npx eas init` in `mobile/` (adds `extra.eas.projectId`), then
      `eas build -p android --profile preview` for a test APK.
- [ ] Google sign-in: Google Cloud OAuth client + enable Google provider in Supabase (see
      `mobile/README.md` §4); Apple sign-in needs the Apple Developer account (99 USD/yr).
- [ ] GitHub secrets `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (push notifications).
- [ ] After company registration: domain, Datenschutz + Impressum online, Google Play (25 USD) and
      Apple Developer accounts, store submission.

## Log

- 2026-11-01: Supabase project "Finanzpal" created (free, eu-central-1). Schema not applied yet —
  the connector's confirmation step can't be answered from a scheduled/remote session.
- 2026-11-02: Item 1 done — app builds default to the Finanzpal Supabase project (eas.json,
  .env.example). Schema still not applied (list_tables empty).
- 2026-11-02: Item 2 done — chat Edge Function deployed to Finanzpal (connector deploy needed no
  confirmation); waits for ANTHROPIC_API_KEY + schema.sql.
