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
- [x] **3. Wide logos.** Wordmarks (ING DiBa, norisbank, Openbank, justTRADE, Trade Republic) are
      tiny in the square chip — give logos with aspect ratio > 2 a wider chip (from the viewBox),
      same height; check in the web preview.
      — 2026-11-03: `chipWidth()` in ProviderMark (viewBox aspect > 2 → wider chip, max 2.4× height);
      8 wordmarks affected; screen test added; checked in the web preview.
- [x] **4. Login/registration polish against the real project.** Error texts for real Supabase
      responses (email confirmation required, rate limits), "check your inbox" state after
      sign-up, password reset deep link. Screen tests for these states.
      — 2026-11-04: `lib/authErrors.ts` maps Supabase error codes to DE/EN texts; sign-up → "check
      your inbox" + resend; login offers resend for unconfirmed accounts; email links open
      `auth-callback` (sign-in) / `reset-password` (new password, PKCE code); 12 new screen tests.
- [x] **5. Store listing texts (DE + EN).** `mobile/store/`: app name, subtitle, short + long
      description, keywords, category, support/privacy URLs (placeholders until the domain), data
      safety / privacy-label answers derived from what the app actually stores (Supabase tables,
      device storage, push tokens). No claims the app can't back up.
      — 2026-11-05: `store/listing.json` (DE+EN texts, category, URL placeholders `{SITE}`),
      `store/privacy.md` (data table + Play Data safety / Apple App Privacy answers),
      `store/README.md`; `__tests__/store-test.ts` checks limits + no rates/prices.
- [x] **6. Store screenshots.** From the web preview with Playwright at phone sizes (6.7" iPhone,
      Android phone), DE + EN, light mode: home, a comparison, score breakdown, Finanz-Check result,
      a calculator. Save under `mobile/store/screenshots/`.
      — 2026-11-06: 20 shots (iPhone 1290×2796, Android 1080×2160, DE+EN × 5 screens) via
      `tools/store-screenshots.mjs`; fixed on the way: unstyled home category rows on web, and
      "Openbank" breaking mid-word on 360 dp phones. Re-take before submission (shows that day's data).
- [x] **7. Release build config.** `eas.json` profiles (development, preview APK, production),
      app version/build numbers, Android permissions minimal, iOS `infoPlist` usage strings, notification
      icon (white monochrome PNG generated from the logo). `expo-doctor` clean.
      — 2026-11-07: profiles development (dev client) / preview APK / production .aab (auto build number),
      version 1.0.0, Android permissions `[]` + camera/mic/location/storage/contacts blocked, iOS export
      flag (no usage strings needed), `assets/notification-icon.png` via `tools/make-notification-icon.py`;
      `__tests__/release-config-test.ts`; expo-doctor 21/21.
- [x] **8. Accessibility + robustness pass.** Every pressable has a label/role, font scaling up to
      200 % doesn't clip (check in web preview with bigger text), offline behaviour (bundled data,
      friendly errors), empty states. Fix what's found, add tests.
      — 2026-11-08: roles on all ~40 unlabelled pressables (+ checked/selected state), labels on text
      fields/switches, card buttons name the provider; 200 % check in the web preview → tab bar no
      longer scales, sort chips wrap, card rows stack from 150 %; chat offline text + Merkliste load
      error with retry (DE/EN). Accessibility scan + offline tests in screens-test.tsx.
- [x] **9. Release checklist.** `mobile/RELEASE.md`: exact click-by-click steps for everything in
      "Needs Parthiban", in order, with what the agent already prepared. Then the work list is done:
      from then on each run only does the "Every run first" sync and reports "nothing to do" briefly.
      — 2026-11-08: `mobile/RELEASE.md` — Part A backend (schema, auth URLs, API key), B test build
      (Expo, APK, push, Google), C stores (domain + public legal pages, Datenschutz, accounts, submit).
      **Work list done.**

## Needs Parthiban (agent skips these; ticks them only when it can verify they're done)

Click-by-click steps for all of these, in order: `mobile/RELEASE.md`. New finding (2026-11-08): the
app opens website pages (Datenschutz, Impressum, Ratgeber), so they must be reachable without the
Netlify login before store submission — RELEASE.md step C1 (the agent leaves the gate on until told).

- [ ] **Run `mobile/supabase/schema.sql` once** in Supabase → project Finanzpal → SQL Editor (paste
      the file, Run). Verify: Table Editor shows profiles, messages, favorites, push_tokens.
      (Checked 2026-11-08: still no tables.)
- [ ] Supabase → Authentication → URL Configuration: Site URL `finanzpal://auth-callback`, Redirect
      URLs `finanzpal://**` and `exp://**`; Providers → Email: "Confirm email" on. (The app's email
      links go to `finanzpal://auth-callback` and `finanzpal://reset-password` — both covered by
      `finanzpal://**`.)
- [ ] Anthropic API key → Supabase → Edge Functions → Secrets `ANTHROPIC_API_KEY` (paid per use).
      The function `chat` is already deployed; it starts answering once this secret exists and
      schema.sql has run.
- [ ] Expo account + `npx eas init` in `mobile/` (adds `extra.eas.projectId`), then
      `eas build -p android --profile preview` for a test APK.
- [ ] Google sign-in: Google Cloud OAuth client + enable Google provider in Supabase (see
      `mobile/README.md` §4); Apple sign-in needs the Apple Developer account (99 USD/yr).
- [ ] GitHub secrets `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (push notifications).
- [ ] Datenschutzerklärung (DE+EN) extended to cover the app: data and processors listed in
      `mobile/store/privacy.md` (Supabase, Anthropic, Expo push), incl. in-app account deletion.
      Needs a legal decision, so the agent doesn't write it.
- [ ] After company registration: domain, Datenschutz + Impressum online, Google Play (25 USD) and
      Apple Developer accounts, store submission.

## Log

- 2026-11-01: Supabase project "Finanzpal" created (free, eu-central-1). Schema not applied yet —
  the connector's confirmation step can't be answered from a scheduled/remote session.
- 2026-11-02: Item 1 done — app builds default to the Finanzpal Supabase project (eas.json,
  .env.example). Schema still not applied (list_tables empty).
- 2026-11-02: Item 2 done — chat Edge Function deployed to Finanzpal (connector deploy needed no
  confirmation); waits for ANTHROPIC_API_KEY + schema.sql.
- 2026-11-03: Item 3 done — wordmark logos get wider chips (CI green after two test fixes; web preview
  republished). Sync check: no website changes to mirror. Schema still not applied.
- 2026-11-04: Item 4 done — sign-up/login/password-reset flows for the real project (CI green after
  one test-mock fix; auth screens aren't in the web preview, so no republish). Sync check: website
  changes were priority sliders/home hero only, nothing to mirror. Schema still not applied.
- 2026-11-05: Item 5 done — store listing texts DE+EN and Data safety / App Privacy answers in
  `mobile/store/`. Sync check: nothing to mirror. Schema still not applied.
- 2026-11-06: Item 6 done — store screenshots DE+EN for iPhone 6.7" and Android phone; two visual
  fixes found while taking them (home rows on web, narrow-phone logo chips). CI green after one test
  fix; web preview republished. Sync check: nothing to mirror. Schema still not applied.
- 2026-11-07: Item 7 done — release build config (EAS profiles, version 1.0.0, minimal permissions,
  notification icon, config test). Sync check: nothing to mirror. Schema still not applied.
- 2026-11-08: Items 8 + 9 done — accessibility/offline pass (CI red once on an old test matching the
  old heart label, fixed; large-text fixes from the 200 % web-preview check; preview republished) and
  `mobile/RELEASE.md`. Work list complete; from now on runs only do the sync check. Sync check:
  nothing to mirror. Schema still not applied.
