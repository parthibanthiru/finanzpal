# Finanzpal app — release checklist (for Parthiban)

Everything the app still needs from you, **in order**, click by click. The code side is finished
(see `ROADMAP.md`); these steps need your accounts, keys, money or a legal decision, so the daily
agent can't do them. Each step says what is already prepared and how to check it worked.

Tick the boxes here (or tell the agent) as you go — the daily agent re-checks what it can verify
(e.g. the database tables) and ticks those itself in `ROADMAP.md` → "Needs Parthiban".

Costs at a glance: Supabase free plan (0 €), Expo free plan (0 €), Anthropic API (pay per use),
Google Play developer account (25 USD once), Apple Developer Program (99 USD per year, only for iPhone).

---

## Part A — Make the backend work (≈ 20 min, free except the API key)

### A1. Create the database tables
Prepared: `mobile/supabase/schema.sql` (profiles, messages, favorites, push_tokens, chat_usage + the
functions the app calls). Safe to run again later.

1. Open https://supabase.com/dashboard → project **Finanzpal** (not SendWiseLab).
2. Left menu → **SQL Editor** → **New query**.
3. Open `mobile/supabase/schema.sql` on GitHub → **Raw** → select all → copy → paste into the editor.
4. Click **Run** (bottom right). It should say "Success. No rows returned".
5. Check: left menu → **Table Editor** shows `profiles`, `messages`, `favorites`, `push_tokens`,
   `chat_usage`.

- [ ] Done

### A2. Sign-in settings
Prepared: the app sends confirmation links to `finanzpal://auth-callback` and password-reset links
to `finanzpal://reset-password`.

1. Supabase → project Finanzpal → **Authentication** → **Sign In / Providers** → **Email**:
   enabled, **Confirm email** on → Save.
2. **Authentication** → **URL Configuration**:
   - **Site URL**: `finanzpal://auth-callback` → Save.
   - **Redirect URLs** → **Add URL**: `finanzpal://**` → Save; again **Add URL**: `exp://**` → Save.
3. Optional: **Authentication** → **Email Templates** → translate "Confirm signup" and
   "Reset password" into German.

- [ ] Done

### A3. Switch on the chatbot (costs money per message)
Prepared: the Edge Function `chat` is already deployed in project Finanzpal (daily limit 30
messages per user). Until this step the app shows "Chat isn't set up yet".

1. https://console.anthropic.com → **API Keys** → **Create Key** (name: "Finanzpal app") → copy it.
   Set a monthly spend limit under **Billing → Limits** if you like.
2. Supabase → project Finanzpal → **Edge Functions** → **Secrets** (or Project Settings →
   Edge Functions) → **Add new secret**: name `ANTHROPIC_API_KEY`, value = the key → Save.
3. Optional secrets: `CHAT_DAILY_LIMIT` (messages per user per day, default 30), `CHAT_MODEL`.
4. Check: after A4/B1 you can sign in on the test app → Chat tab → ask "Was ist Tagesgeld?".

- [ ] Done

---

## Part B — First test build on your phone (≈ 30 min, free)

### B1. Expo account + project
Prepared: `mobile/eas.json` (profiles development / preview / production), `app.json` version 1.0.0,
package name `de.finanzpal.app`.

1. Sign up at https://expo.dev/signup (free).
2. On your computer (Node 20+ installed), in a terminal:
   ```bash
   git clone https://github.com/parthibanthiru/finanzpal.git
   cd finanzpal/mobile
   npm install
   npm install -g eas-cli
   eas login
   npx eas init          # "Create a new project?" → Yes. Writes extra.eas.projectId into app.json
   ```
3. Commit and push the changed `app.json` (`git commit -am "App: EAS project id" && git push`),
   or tell the agent the project id and it adds it.

- [ ] Done

### B2. Test APK (Android)
1. In `mobile/`: `eas build -p android --profile preview` → wait for the build (≈ 15 min, link shown).
2. Open the link on your Android phone → download → install (allow "install unknown apps" once).
3. Check: register with a real e-mail → confirmation mail → link opens the app signed in →
   heart a provider in a comparison → it appears in the Merkliste.

- [ ] Done

### B3. Push notifications (optional, can wait)
Prepared: Profil switch, `push_tokens` table, `.github/workflows/push-notify.yml` (dry run until the
secrets exist).

1. Android needs Firebase once: `eas credentials` → Android → production → **Push Notifications** →
   upload a Firebase service-account key (Firebase console → Project settings → Service accounts →
   Generate new private key).
2. Supabase → Project Settings → **API Keys**: copy the project URL and the **service_role** key
   (secret — never into the app).
3. GitHub → repo **finanzpal** → **Settings** → **Secrets and variables** → **Actions** →
   **New repository secret**: `SUPABASE_URL` = the URL; again: `SUPABASE_SERVICE_ROLE_KEY` = the key.
4. Check: GitHub → **Actions** → "App push notifications" → **Run workflow** (dry run on by default)
   shows who would get a message.

- [ ] Done

### B4. Google sign-in (optional; Apple sign-in then becomes required on iPhone)
Follow `mobile/README.md` §4 (Google Cloud OAuth client → Supabase → Providers → Google).
Apple sign-in needs the Apple Developer account from C3.

- [ ] Done / skipped

---

## Part C — Before the stores (needs the company / legal decisions)

### C1. Domain and public website pages
The app opens website pages (Datenschutz, Impressum, Ratgeber, "Details"). While the site is behind
the Netlify login, store users would only see a login page — the stores reject that.

1. Connect the domain (e.g. `finanzpal.de`) in Netlify.
2. Decide to make the site (or at least `datenschutz.html`, `impressum.html`, `en/…`) public —
   the agent keeps the Netlify login on until you say so.
3. Tell the agent the domain: it then sets `EXPO_PUBLIC_SITE_URL` in `eas.json`/`.env.example`,
   replaces `{SITE}` in `store/listing.json`, and re-checks the links.

- [ ] Done

### C2. Datenschutzerklärung + Impressum for the app (legal decision)
Prepared: `mobile/store/privacy.md` lists exactly what the app stores and sends (Supabase in
Frankfurt: account, chat history, Merkliste, push tokens; Anthropic: chat questions; Expo: push
tokens) and that the account can be deleted in the app (Profil → Konto löschen).

1. Extend the website's Datenschutzerklärung (DE + EN) with these processors and purposes —
   ideally checked by a lawyer or a generator service.
2. Fill in the Impressum with the company details.
3. Give the agent a support e-mail address for `{SUPPORT_EMAIL}` in `store/listing.json`.

- [ ] Done

### C3. Store accounts
1. Google Play Console: https://play.google.com/console/signup — 25 USD once; organisation account
   needs a D-U-N-S number for the company.
2. Apple (only if iPhone): https://developer.apple.com/programs/enroll — 99 USD per year;
   organisation enrolment needs a D-U-N-S number too.

- [ ] Google Play   - [ ] Apple

### C4. Store builds and submission
Prepared: store texts DE + EN (`store/listing.json`), Data safety / App Privacy answers
(`store/privacy.md`), screenshots (`store/screenshots/`), release build profiles.

1. Ask the agent to re-take the screenshots (they show the data of the day they were taken).
2. `eas build -p android --profile production` → `.aab`.
3. Play Console → **Create app** (name "Finanzpal", German default, app, free) → fill **Store
   listing** from `store/listing.json` (field map in `store/README.md`), **Data safety** from
   `store/privacy.md`, content rating questionnaire, target audience 18+ (finance), ads: no.
4. `eas submit -p android --profile production` (uploads to the internal test track as a draft) →
   test → promote to **Production** → **Send for review**.
5. iPhone (optional): `eas build -p ios --profile production` → `eas submit -p ios` → App Store
   Connect: listing from `store/listing.json`, **App Privacy** from `store/privacy.md` → submit.

- [ ] Android submitted   - [ ] iPhone submitted

---

After C4 the app is live. Updates later: change the website data as usual, the app check keeps the
app in sync; for a new store version raise `version` in `mobile/app.json` and repeat C4 steps 2–4.
