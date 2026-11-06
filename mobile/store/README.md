# Store listing (Google Play + Apple App Store)

Everything needed to fill in the two store consoles. Nothing here is uploaded automatically.

| File | What |
|---|---|
| `listing.json` | App name, subtitle, short/long description, promo text, keywords, "What's new", category, URLs — DE + EN. `description` is an array of lines (join with line breaks when pasting). |
| `privacy.md` | What the app stores and sends, and the matching answers for Google Play "Data safety" and Apple "App Privacy". |
| `screenshots/` | Store screenshots, DE + EN, light mode — see below. |

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

## Screenshots

`screenshots/<device>/<lang>/` — five per language, in this order:
`1-vergleiche` (home), `2-vergleich` (Tagesgeld comparison), `3-score` (Finanzpal-Score
breakdown), `4-finanz-check` (Finanz-Check result), `5-rechner` (compound interest calculator).

| Folder | Size (px) | Store slot |
|---|---|---|
| `iphone-6.7/` | 1290 × 2796 | App Store Connect → iPhone 6.7"/6.9" display (Apple scales it down for smaller iPhones) |
| `android-phone/` | 1080 × 2160 | Google Play Console → Phone screenshots (ratio ≤ 2:1) |

`de/` goes into the German listing, `en/` into the English one. They are taken from the web
preview (the app's real screens; only the preview-only "Vorschau ohne Konto" note is hidden) with:

```
git fetch origin web-preview && mkdir -p /tmp/wp && git archive origin/web-preview | tar -x -C /tmp/wp
node mobile/tools/store-screenshots.mjs /tmp/wp      # needs Playwright + Chromium
```

The web preview renders the same React Native screens as the phone app (fonts and the status bar
can differ slightly); if a store reviewer asks for native captures, take them from the preview APK
in the same order.

The comparison shots show real rates and fees **as of the day they were taken** ("Stand …" is
visible at the top). Re-take them right before submitting, so the store never shows outdated
figures; no store frames or marketing text are added on purpose.

## Before submission

- Re-take the screenshots (see above) so they show current data.
- Replace `{SITE}` (the website domain, e.g. `https://finanzpal.de`) and `{SUPPORT_EMAIL}`. The
  Netlify site is behind the SSO gate, so its URLs can't be used for the stores.
- The Datenschutzerklärung must cover the app (see `privacy.md` → "Before submission").
- The description mentions Google and Apple sign-in — both must be set up by then (see
  `mobile/README.md` §4), otherwise drop them from the sentence.
- Texts contain no rates, prices or ratings on purpose (data-integrity rule): store texts can't be
  updated as fast as the data. `__tests__/store-test.ts` checks the limits and that no `%`/`€`
  figures slip in.
