# Store listing (Google Play + Apple App Store)

Everything needed to fill in the two store consoles. Nothing here is uploaded automatically.

| File | What |
|---|---|
| `listing.json` | App name, subtitle, short/long description, promo text, keywords, "What's new", category, URLs — DE + EN. `description` is an array of lines (join with line breaks when pasting). |
| `privacy.md` | What the app stores and sends, and the matching answers for Google Play "Data safety" and Apple "App Privacy". |
| `screenshots/` | Store screenshots (roadmap item 6). |

## Where each field goes

| `listing.json` | Google Play Console | App Store Connect | Limit |
|---|---|---|---|
| `name` | App name | Name | 30 |
| `subtitle` | — | Subtitle | 30 |
| `shortDescription` | Short description | — | 80 |
| `promotionalText` | — | Promotional text | 170 |
| `description` | Full description | Description | 4000 |
| `keywords` | — | Keywords (comma-separated, no spaces after commas) | 100 bytes |
| `whatsNew` | Release notes | What's New | 500 / 4000 |
| `category` | App category | Primary / secondary category | — |
| `urls.privacyPolicy` | Privacy policy | Privacy Policy URL | — |
| `urls.support` / `supportEmail` | Contact details | Support URL | — |
| `urls.accountDeletion` | Data safety → delete account URL | — | — |

German is the primary language in both stores (`de-DE`), English is added as a second
localization (`en-US` or `en-GB`).

## Before submission

- Replace `{SITE}` (the website domain, e.g. `https://finanzpal.de`) and `{SUPPORT_EMAIL}`. The
  Netlify site is behind the SSO gate, so its URLs can't be used for the stores.
- The Datenschutzerklärung must cover the app (see `privacy.md` → "Before submission").
- The description mentions Google and Apple sign-in — both must be set up by then (see
  `mobile/README.md` §4), otherwise drop them from the sentence.
- Texts contain no rates, prices or ratings on purpose (data-integrity rule): store texts can't be
  updated as fast as the data. `__tests__/store-test.ts` checks the limits and that no `%`/`€`
  figures slip in.
