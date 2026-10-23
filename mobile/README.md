# Finanzpal App (Android & iOS)

The Finanzpal app, built with Expo SDK 57 / React Native 0.86 + TypeScript: one codebase for Android and iOS, with Supabase accounts.
It lives in `mobile/` inside the website repo and uses the **website as its single source of truth**:
same comparison data, same disclosure texts, same calculator math and the same design tokens.

**What's in it (v0.11)**
- **Search** (top of the home tab): one box finds a provider in every comparison it appears in ("DKB" →
  Girokonto, Tagesgeld, Kreditkarte, Broker …), ETFs by name/ISIN/index, and the comparisons, calculators and
  guides by name; umlauts are folded ("fuhrung" finds "Kontoführung"). Tapping a provider opens its comparison
  scrolled to it; an ETF opens the ETF-Suche filtered to it (`lib/search.ts`).
- **ETF-Suche** (home tab, Broker group): the website's ETF search (`etf-suche.html`) with the same filters
  (asset class, TER, provider, replication, distribution, fund size, age, sort) plus a text search; the filter
  logic is a port of `assets/etf-search.js`, checked against it for 13,824 filter combinations (identical).
- **Score breakdown**: tapping a Finanzpal-Score badge opens a sheet with the total, the grade and one bar per
  factor, labelled like the website's score popover; factor labels are synced into `data/score-labels.json`.
- **Finanz-Check** (top of the home tab): the website's 6-question quiz with one recommendation each for
  Girokonto, Depot, Kreditkarte and Tagesgeld. Questions and weights are extracted from
  `assets/finanz-check.js`; results were checked against the website for all 96 answer combinations
  (identical). Answers are saved on the device per account, so the home screen then shows
  "Deine Empfehlungen"; tapping one opens the comparison scrolled to that provider, highlighted.
  Each result card shows the website's "why this pick" lines (port of `reasonsFor()`: answers that gave the
  pick ≥ 2 points, at most 2; the sentence is synced from `STR.reasonTemplate`).
- **Merkliste**: a heart on every provider card saves it to the user's account (Supabase table
  `favorites`), so the list is the same on every device; "Meine Merkliste" on the home tab, grouped by
  comparison, tap opens the provider in its comparison. Needs `supabase/schema.sql` run once more (v0.7 part).
- **Vergleiche** (home tab): all 13 comparisons from the website: Girokonto, Tagesgeld, Kreditkarte,
  Broker & Depot, Kinderdepot, Ratenkredit, Baufinanzierung, the 5 insurance types, Steuerprogramm.
  Provider cards with the website's fields, caveats (ⓘ), "Unsere Empfehlung", ratings, **Finanzpal-Score**
  (0–100 + A–D, sortable) and the page's own "Werbung"/disclosure text.
  "Zum Anbieter" appears only once an item has a real affiliate link (all are `#` placeholders today).
- **Rechner**: all 7 website calculators built in: Sparplan, Zinseszins, Kredit, Baufinanzierung,
  Brutto-Netto (Steuerklasse I, 2026), Altersvorsorge, Haushaltsbuch. Same formulas, defaults, ranges and
  disclaimer texts as the website; the math was checked against the site's own JS (84,000+ input
  combinations, all identical). The Haushaltsbuch keeps entries on the phone only (per account, deleted with
  the account), like the website keeps them in the browser only.
- **Ratgeber**: the 10 guides, opened on the website.
- **Chat**, **Profil**, login with e-mail / Google / Apple, chat history, Datenschutz/Impressum links (from v0.1–v0.3).
- Branding: FP5 logo as app icon/splash, website colors (`components/theme.ts` mirrors `assets/style.css`).
- **German and English**: the whole app in both languages. It follows the phone (English phones → English,
  everything else German, like the website's default); Profil → Sprache: Wie System / Deutsch / English.
  Interface text lives in `lib/strings/de.ts` + `en.ts` (TypeScript fails the build if the English one misses a
  key); comparison data, disclosures, calculator disclaimers, Finanz-Check questions and guide titles come from
  the website's own English pages and `data/*.en.json` via the sync, so wording matches finanzpal.de/en.
  Website links open the `en/` pages, numbers use the website's locales (`2.641,68 €` / `€2,641.68`), and the
  chat sends `language` so the bot can answer in English (`languageInstruction()` in `backend-auth/chatHistory.js`).
- **Dark mode**: light and dark palettes from the website's tokens (`:root` / `[data-theme="dark"]`);
  Profil → Darstellung: Wie System / Hell / Dunkel (stored like the website's toggle, key `fp-theme`).
  All text/background pairs checked for WCAG contrast (≥ 4.5:1 for text; score badges ≥ 3:1).

```
mobile/
  app/_layout.tsx                 auth gate: logged out → /login, logged in → /vergleiche
  app/(auth)/…                    login, register, forgot-password
  app/(app)/vergleiche/           home (search, Finanz-Check card, categories), finanz-check, [id] comparison,
                                  etf (ETF-Suche), merkliste
  app/(app)/rechner/              calculator list + 7 calculators
  app/(app)/ratgeber.tsx, chat.tsx, profile.tsx
  lib/categories.ts               which data fields each comparison shows
  lib/data.ts                     loads data/*.json (bundled; optional live from the website)
  lib/calc.ts                     calculator math (identical to the website's assets/*rechner.js)
  lib/haushaltsbuch.ts            budget tracker storage + totals
  lib/finanzCheck.ts              Finanz-Check scoring (port of finanz-check.js) + saved answers
  lib/favorites.ts, context/FavoritesProvider.tsx   Merkliste (Supabase, optimistic updates)
  lib/disclosures.ts              disclosure/disclaimer texts from the website
  lib/search.ts                   home search index (providers, ETFs, pages; DE/EN)
  lib/etf.ts                      ETF-Suche filters (port of assets/etf-search.js)
  lib/scoreLabels.ts, components/ScoreBreakdown.tsx   score breakdown sheet
  __tests__/, test/               screen tests (Jest + Testing Library)
  components/theme.ts, context/ThemeProvider.tsx   light/dark palettes, useColors() / makeStyles()
  lib/i18n.ts, lib/strings/de.ts + en.ts, context/LanguageProvider.tsx   languages, useT() / strings()
  lib/site.ts                     website base URL, opens site pages in-app
  data/                           copy of ../data/*.json + *.en.json, disclosures(.en).json, finanz-check.json,
                                  ratgeber.json, score-labels.json (generated by the sync, committed)
  tools/sync-data.mjs             refreshes data/ from the website
  context/AuthProvider.tsx, lib/supabase.ts, lib/api.ts, lib/history.ts
  supabase/schema.sql, backend-auth/
```

## Automatic checks (GitHub Actions)
`.github/workflows/mobile-app.yml` runs on every push that touches the app or the website data it uses:
`npm install` → `npx expo install --check` (versions match the Expo SDK) → website-data sync check → `tsc --noEmit` →
**screen tests** → Android and iOS bundle builds (`expo export`) → `expo-doctor` (advice only).
The screen tests (`npm test`, `__tests__/screens-test.tsx`) render every screen in German and English, light and
dark, and fail on errors, `undefined`/`NaN` in visible text or a missing disclosure; they also click through the
Finanz-Check (incl. its reasons), a calculator, the Haushaltsbuch, ETF filters, the home search, the score
breakdown, the Merkliste heart and the language switch. A failing step also posts its last 200 output lines
as an annotation on the commit (`tools/ci-step.sh`). Results: the commit's ✓/✗ on GitHub, or the
repo's **Actions** tab.

## Keeping app and website in sync
The app ships a copy of the website's `data/*.json` and `data/*.en.json` and extracts, in German and English
(root pages and `en/` pages), the disclosure texts (comparison pages, insurance tabs, and the
`calc-disclaimer` of all 7 calculator pages), the Finanz-Check questions and weights
and "why this pick" sentence (`assets/finanz-check.js`), the Ratgeber guide list (`ratgeber.html` + `en/ratgeber.html`)
and the Finanzpal-Score factor labels (`STR.scoreLabels` in `girokonto-`, `broker-`, `kinderdepot-` and
`kreditkarte-compare.js`, `SCORE_FACTOR_LABELS` in `compare.js`; the sync fails if a score factor in the data has no
label). The ETF-Suche uses `data/etf.json`; its filter logic mirrors `assets/etf-search.js` (`lib/etf.ts`).
**New interface text** (buttons, labels, messages) goes into both `lib/strings/de.ts` and `lib/strings/en.ts`.
After changing comparison data or disclosure texts on the website:
```bash
cd mobile && npm run sync-data     # also runs automatically before `npm start`
```
Then commit `mobile/data/`. The script warns (and exits with an error) if it can't find a disclosure text.
With `EXPO_PUBLIC_DATA_LIVE=1` the app loads the data live from the website instead, falling back to the
bundled copy. Turn that on once the site is public; while it's behind the Netlify SSO gate, live loading
(and the website pages the app opens) won't work for normal users.

Commits that only touch `mobile/` don't trigger a Netlify deploy (`netlify.toml` → `ignore`), and
`/mobile/*` is never served on the website.

## 1. Supabase (10 min)
1. Create a free project at supabase.com – choose region **Frankfurt (eu-central-1)**.
2. SQL Editor → paste `supabase/schema.sql` → Run.
3. Authentication → Providers → Email: enabled, "Confirm email" on.
4. Authentication → Email Templates: translate the confirmation / reset mails to German (optional but recommended).
5. Project Settings → API: copy **Project URL** and **anon public key**.

## 2. Run the app
Needs Node 20+ on your computer and the **Expo Go** app on your phone (Play Store / App Store).

```bash
cd mobile
cp .env.example .env          # fill in the Supabase values + backend URL
npm install                   # versions are pinned to Expo SDK 57
npx expo start
```
Scan the QR code with Expo Go (Android) or the iPhone camera. Phone and computer must be on the same Wi-Fi.

> You can test iOS from Windows this way – no Mac needed until you publish.

## 3. Connect the chatbot backend
In your existing `finanzpal-chatbot` server:
1. `npm install @supabase/supabase-js`, copy `backend-auth/requireUser.js` next to `server.js`.
2. Protect the route: `app.post('/api/chat', requireUser, handler)`.
3. Make sure it accepts `{ sessionId, message }` and returns `{ reply }` – or change `lib/api.ts` to match your route.
4. In the app's `.env`, set `EXPO_PUBLIC_API_URL` to your computer's LAN IP (e.g. `http://192.168.0.23:3000`), not `localhost`.

## 4. Google & Apple sign-in + chat history (v0.2)

**Database:** run `supabase/schema.sql` again in the SQL Editor (it's safe to repeat). It adds the `messages` table for chat history.

**Redirect URLs** – Supabase → Authentication → URL Configuration → Redirect URLs, add:
```
finanzpal://**
exp://**
```
(`exp://` is for testing in Expo Go; `finanzpal://` is for the APK / store app.)

**Google** (Android + iOS)
1. console.cloud.google.com → new project "Finanzpal" → APIs & Services → OAuth consent screen: External, app name Finanzpal, your support e-mail, add `finanzpal.de` as authorized domain.
2. Credentials → Create credentials → OAuth client ID → type **Web application**.
   Authorized redirect URI: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
3. Copy Client ID + Client Secret → Supabase → Authentication → Providers → Google → enable, paste both.

**Apple** (iOS only – needs the Apple Developer account, 99 USD/year)
1. developer.apple.com → Identifiers → App ID `de.finanzpal.app` → tick **Sign in with Apple**.
2. Supabase → Authentication → Providers → Apple → enable, and under **Client IDs** enter `de.finanzpal.app`
   (add `host.exp.Exponent` too if you want to test Apple login inside Expo Go).
3. Native iOS sign-in needs no secret key; that's only for Apple login on the web.

The Apple button only appears on iPhones. Apple's App Store rules require it as soon as Google login is offered.

**Chat history:** each question and answer is saved to the user's account and loaded when the app opens. "Neu" in the chat header deletes the history and starts fresh. Deleting the account deletes the history too.

## 5. Chat memory + legal links (v0.3)

**Chat memory:** the app now sends the last 10 messages with every question (`history` in the request body).
To let the bot use them, copy `backend-auth/chatHistory.js` into your backend and build the Claude `messages`
array with `buildMessages(...)` – the comment at the top of the file shows the exact lines.
If the server still has the conversation in memory it uses that; after a restart it falls back to the app's history.
Until you change the backend, everything keeps working as before.

**Legal links:** Datenschutz and Impressum links appear on the login, register and profile screens and open
`https://finanzpal.de/datenschutz` and `https://finanzpal.de/impressum` (change them in `components/LegalLinks.tsx`).
Both pages must be online before you submit to Google Play or the App Store.

## 6. Publishing (later)
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android          # .aab for Google Play (one-time 25 USD account)
eas build -p ios              # needs Apple Developer account, 99 USD/year
```
Before store release you need: a privacy policy URL (Datenschutzerklärung), an Impressum, app icons in `assets/`, and – if you add Google/Apple sign-in – Apple requires "Sign in with Apple" whenever another social login is offered.

## Next ideas
- Push notifications for new comparisons (expo-notifications)
