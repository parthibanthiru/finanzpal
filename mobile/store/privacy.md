# Data safety (Google Play) and App Privacy (Apple) — answers

Derived from what the app code actually does (checked 2026-11-05 against `supabase/schema.sql`,
`lib/*.ts`, `context/AuthProvider.tsx`, `supabase/functions/chat/`). If the code changes what is
stored or sent, update this file in the same commit.

## What the app stores

| Data | Where | Why | Deleted when |
|---|---|---|---|
| Email address, password hash (Supabase Auth) | Supabase project "Finanzpal", Frankfurt (EU) | Login | Account deletion in the app (Profil → Konto löschen) |
| Name (`profiles.full_name`, from registration or Google/Apple) | Supabase | Greeting in the app | Account deletion |
| User ID | Supabase | Links the rows below to the account | Account deletion |
| Chat messages (`messages`, question + answer, max 8000 chars each) | Supabase | Chat history | "Neuer Chat" in the chat (deletes the history), or account deletion |
| Chat usage counter (`chat_usage`, messages per day) | Supabase | Daily limit | Account deletion |
| Watchlist (`favorites`: category + provider id) | Supabase | Merkliste, synced across devices | Removing the entry, or account deletion |
| Push token + app language + platform (`push_tokens`) | Supabase | Optional notifications about new providers/guides (opt-in) | Turning notifications off, or account deletion |
| Budget entries (Haushaltsbuch) | **Device only** (AsyncStorage, per account) | Calculator | Account deletion in the app, or uninstall |
| Finanz-Check answers | **Device only** (AsyncStorage, per account) | Show the last result | Uninstall |
| Login session | Device (AsyncStorage via Supabase client) | Stay logged in | Logout |

Not collected: location, contacts, photos, files, payment data, device identifiers for advertising,
analytics, crash reports, browsing history. No ads SDK, no tracking SDK. No in-app purchases.

## Who receives data (processors)

- **Supabase** (database + auth, EU region Frankfurt) — everything in the Supabase rows above.
- **Anthropic** (chat answers): the chat Edge Function sends the user's question, the last 10 chat
  messages and the language to the Anthropic API. No email or name is sent.
- **Expo push service → Apple APNs / Google FCM**: push token and notification text, only if the
  user turned notifications on.
- **Google / Apple** (only if the user chooses "Sign in with Google/Apple"): the sign-in itself.
- Tapping "Zum Anbieter" opens the provider's website in the browser — the app sends nothing to
  the provider itself.

## Google Play → Data safety form

- Does your app collect or share any of the required user data types? **Yes**
- Is all user data encrypted in transit? **Yes** (HTTPS to Supabase and the Edge Function)
- Do you provide a way for users to request that their data is deleted? **Yes** — in the app
  (Profil → Konto löschen) and via the deletion URL in `listing.json` (`urls.accountDeletion`;
  the website's Datenschutz page must describe the in-app deletion before submission).
- Data types — all **collected, not shared**\*, **required** unless marked optional, purpose in brackets:
  - Personal info → **Name** (App functionality, Account management)
  - Personal info → **Email address** (Account management)
  - Personal info → **User IDs** (Account management)
  - Messages → **Other in-app messages** — chat questions (App functionality) — *optional*
    (only if the chat is used)
  - App activity → **Other user-generated content** — watchlist (App functionality) — *optional*
  - Device or other IDs → **Device or other IDs** — push token (App functionality) — *optional*
- Not collected: location, financial info (budget entries stay on the device and are therefore not
  "collected" in Google's sense), health, photos, audio, files, calendar, contacts, web history,
  app performance, ads.

\* Google counts transfers to service providers that process data on your behalf (Supabase,
Anthropic, Expo) as **not sharing**.

## Apple → App Privacy

- Data used to track you: **None**.
- Data linked to you (purpose for every type: **App Functionality**):
  - Contact Info → **Name**, **Email Address**
  - Identifiers → **User ID**, **Device ID** (push token — only if notifications are on)
  - User Content → **Other User Content** (chat messages, watchlist)
  - Usage Data → none
- Data not linked to you: none.
- Account deletion: offered in the app (Apple guideline 5.1.1(v)) ✔.
- Sign in with Apple is offered next to Google (guideline 4.8) ✔ — `usesAppleSignIn` in `app.json`.

## Before submission (open points)

- The website's Datenschutzerklärung (`datenschutz.html`, `en/datenschutz.html`) must cover the
  app: the table above, Supabase + Anthropic + Expo as processors, legal basis, retention. Right now
  it only covers the website.
- Replace `{SITE}` and `{SUPPORT_EMAIL}` in `listing.json` once the domain is live.
