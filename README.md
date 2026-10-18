# Finanzpal — Website-Projekt

Statische, mehrseitige Website (reines HTML/CSS/JS, kein Build-Schritt nötig),
auf GitHub + Netlify deployed, live unter der Netlify-Adresse (Custom Domain
`finanzpal.de` noch nicht verbunden — siehe unten).

Vergleichsdaten liegen in JSON-Dateien statt hart im HTML — Zahlen lassen sich
dadurch pflegen, ohne jede Seite einzeln zu durchsuchen.

## Struktur

```
finanzpal-production/
├── index.html                            Startseite
├── broker.html                           Broker-Vergleich (JSON-gespeist)
├── broker-trade-republic.html            Broker-Detailseite
├── broker-scalable-capital.html          Broker-Detailseite
├── broker-consorsbank.html               Broker-Detailseite
├── tagesgeld.html                        Tagesgeld-Vergleich (JSON-gespeist)
├── kredite.html                          Kredit-Vergleich (JSON-gespeist)
├── kreditkarte.html                      Kreditkarten-Vergleich (JSON-gespeist)
├── versicherungen.html                   Versicherungs-Vergleich — 4 Tabs:
│                                          Privathaftpflicht / Hausrat /
│                                          Berufsunfähigkeit / Rechtsschutz,
│                                          jeder Tab lädt sein eigenes JSON
├── sparplanrechner.html                  ETF-Sparplanrechner (Einmalanlage + Sparrate)
├── zinseszinsrechner.html                Zinseszinsrechner (Einmalanlage, gleiche Rechenlogik)
├── kreditrechner.html                    Kreditrechner (Annuitätendarlehen)
├── ratgeber.html                         Ratgeber-Übersicht (alle Artikel)
├── ratgeber-etf-sparplan.html            Artikel: ETF-Sparplan starten
├── ratgeber-tagesgeld-vs-festgeld.html   Artikel: Tagesgeld vs. Festgeld
├── ratgeber-haftpflicht-basics.html      Artikel: Private Haftpflicht
├── ueber-uns.html                        Über uns / Methodik
├── impressum.html                        Impressum (Platzhalter — Name/Adresse fehlen noch!)
├── datenschutz.html                      Datenschutzerklärung (Platzhalter — ausfüllen!)
├── sitemap.xml                           Sitemap für alle DE+EN-Seiten (hreflang-Alternates)
├── robots.txt
├── en/                                   Komplette englische Spiegelung aller Seiten oben
├── data/
│   ├── broker.json / .en.json            Broker-Vergleichsdaten
│   ├── tagesgeld.json / .en.json         Tagesgeld-Vergleichsdaten
│   ├── kredite.json / .en.json           Kredit-Vergleichsdaten
│   ├── kreditkarte.json / .en.json       Kreditkarten-Vergleichsdaten
│   ├── versicherungen.json / .en.json    Privathaftpflicht-Vergleichsdaten
│   ├── hausrat.json / .en.json           Hausrat-Vergleichsdaten
│   ├── bu.json / .en.json                Berufsunfähigkeit-Vergleichsdaten
│   └── rechtsschutz.json / .en.json      Rechtsschutz-Vergleichsdaten
├── assets/
│   ├── style.css                        Gemeinsames Stylesheet (ein Design-System für alle Seiten)
│   ├── nav.js                           Mobiles Menü (Hamburger-Toggle)
│   ├── compare.js                       Rendert alle Vergleichstabellen aus den JSON-Dateien;
│   │                                     exponiert window.FPCompare.renderTable() für Re-Renders
│   ├── insurance-tabs.js                Schaltet die 4 Versicherungs-Tabs um (Quelle, Spalten-
│   │                                     Header und Disclosure-Text je Tab)
│   ├── sparplanrechner.js               Logik für Sparplanrechner & Zinseszinsrechner (gleiche Engine)
│   └── kreditrechner.js                 Annuitätenformel für den Kreditrechner
└── README.md                            Diese Datei
```

## Vergleichsdaten aktualisieren

Die Zahlen in den Vergleichstabellen stehen **nicht** im HTML, sondern in den
JSON-Dateien unter `data/`. Um z. B. einen Tagesgeld-Zinssatz zu ändern:

1. `data/tagesgeld.json` **und** `data/tagesgeld.en.json` öffnen (beide Sprachen
   pflegen — es gibt keine automatische Übersetzung).
2. Den passenden Eintrag im `items`-Array suchen und den Wert anpassen.
3. Das Feld `updated` (z. B. `"2026-10"`) auf den aktuellen Monat setzen — es
   erscheint automatisch als "Stand: …" über der Tabelle.
4. Bei einer Rating-Änderung: prüfen, ob dieselbe Zahl auch auf einer
   Detailseite (`broker-*.html`) hart hinterlegt ist — diese Seiten lesen
   ihre Sterne/Scores **nicht** aus dem JSON, sondern zeigen eigene,
   redaktionell gepflegte Werte. Nach jeder Rating-Änderung im JSON die
   passende Detailseite (DE+EN) von Hand gegenprüfen.
5. Datei speichern — fertig, kein Build-Schritt nötig.

Jede Zeile wird beim Laden der Seite per `assets/compare.js` aus dem JSON
gerendert. Das funktioniert nur über `http://`/`https://` — direktes Öffnen
der HTML-Datei per Doppelklick (`file://`) blockiert den JSON-Abruf im Browser.

### Versicherungen: 4 Tabs statt einer Tabelle

`versicherungen.html` zeigt vier Tabs (Privathaftpflicht / Hausrat /
Berufsunfähigkeit / Rechtsschutz). Jeder Tab ist in `assets/insurance-tabs.js`
als Eintrag in `TYPES[]` definiert: eigene JSON-Quelle, eigene Spalten-Header
(„Jahresbeitrag" vs. „Beitrag" bei BU) und ein eigener Disclosure-Text, der
beim Tab-Wechsel den `.disclosure-note`-Absatz ersetzt. Neuen Tab ergänzen =
neuen Eintrag in `TYPES[]` + passendes JSON unter `data/`.

**Wichtiger Hinweis zu den Preisen bei Hausrat/BU/Rechtsschutz:** anders als
bei Tagesgeld/Kredite/Kreditkarte gibt es hier keine "echten" Einzelpreise pro
Anbieter ohne Angebotsrechner — das ist im jeweiligen Disclosure-Text
offengelegt:
- **Hausrat:** Beiträge aus dem Stiftung-Warentest-Modellhaushalt 2026
  (40-jähriger Angestellter, 100 m², Ingolstadt) — reale Beiträge weichen
  je nach Wohnfläche/Wohnort ab.
- **BU:** Beitrag ist individuell/altersabhängig und wird bewusst **nicht**
  als Zahl gezeigt — stattdessen die unabhängige Vertragsbedingungen-Bewertung
  (Franke & Bornberg/DFSI/IVFP).
- **Rechtsschutz:** gezeigter Beitrag (299 €/Jahr) ist eine geflaggte
  Schätzung aus dem Stiftung-Warentest-Modellhaushalt, nicht anbieterspezifisch
  verifiziert; Ratings zeigen bewusst „noch nicht bewertet" statt erfundener
  Sterne.

## Bekannte offene Punkte (bewusste Entscheidungen, nicht vergessen)

1. **Fiktive Kundenbewertungen auf den Broker-Detailseiten.** Die Abschnitte
   „Erfahrungen aus unserer Leserschaft" (`broker-trade-republic.html` etc.)
   zeigen erfundene Namen, Sterne und Bewertungszahlen (z. B. „312
   Bewertungen") — Finanzpal hat noch keine echten Nutzerbewertungen. Auf
   explizite Entscheidung bewusst unverändert gelassen, aber vor dem Launch
   zu klären: entfernen oder als redaktionelle Einschätzung umlabeln.
2. **DEVK-Beitrag (Privathaftpflicht) ist eine Schätzung**, im Disclosure-Text
   entsprechend markiert — vor Launch durch ein echtes Angebot ersetzen.
3. **Consorsbank Visa Karte und drei der vier Hausrat-Anbieter** zeigen
   Ratings, die noch nicht unabhängig verifiziert sind (im jeweiligen
   Disclosure-Text offengelegt).

## Vor dem Launch unbedingt erledigen

1. **Impressum ausfüllen.** Vollständiger Name und Adresse fehlen noch
   (Platzhalter `[Vorname Nachname einfügen]` etc.) — Pflicht nach § 5 TMG.
   Umsatzsteuer-Abschnitt bewusst auf Kleinunternehmerregelung (§19 UStG)
   stehen gelassen, da noch keine Steuernummer vorliegt.
2. **Datenschutzerklärung ausfüllen**, inkl. Hosting-Anbieter (Netlify) und
   sobald entschieden: Analytics/Newsletter-Tool.
3. **Cookie-Consent-Banner ergänzen**, sobald Analytics oder
   Affiliate-Tracking-Cookies live sind.
4. **"Zum Anbieter"-Buttons verlinken.** Alle Affiliate-CTAs sind aktuell
   `href="#"` mit `rel="sponsored nofollow"` vorbereitet — echte Partnerlinks
   in den JSON-Dateien unter `affiliateUrl` eintragen.
5. **Echtes Logo ergänzen.** Aktuell nur Text-Wordmark + generisches SVG-Icon
   (`assets/favicon.svg`, `assets/icon-512.png`); ein fertiges Logo liegt im
   Projekt-Dokument `brand/finanzpal-logo-fp5.md` bereit zur Einbindung.
6. **Newsletter-Formular hat kein Backend.** Das Eingabefeld auf der
   Startseite (`.newsletter-form`) sammelt aktuell nichts — ESP (z. B. Brevo,
   Mailchimp) anbinden, sobald entschieden.
7. Entscheidung zu den bekannten offenen Punkten oben treffen.

## Lokal testen

JSON-gespeiste Tabellen brauchen `http://`, nicht `file://`. Lokalen Server
starten:

```
cd finanzpal-production
python3 -m http.server 8000
```

Dann im Browser: http://localhost:8000

## Deployment & Git-Workflow

- **Repo:** `github.com/parthibanthiru/finanzpal-website`, Branch `main`.
- **Netlify** ist verbunden und deployed automatisch bei jedem Push auf
  `main` (Projekt "Finanzpal", Free-Plan mit begrenzten Build-Minuten).
- **Wichtige Arbeitsregel:** Änderungen werden lokal committed, aber **nicht
  automatisch gepusht** — ein Push löst sofort einen Netlify-Build aus und
  verbraucht Build-Minuten des Free-Plans. Erst pushen, wenn explizit
  gewünscht.
- **Custom Domain** (`finanzpal.de`, DNS bei GoDaddy) ist noch **nicht**
  verbunden — bewusst zurückgestellt. Sobald gewünscht: Netlify →
  "Domain management" → "Add custom domain" → die angezeigten DNS-Einträge
  bei GoDaddy eintragen → Netlify stellt automatisch SSL aus.
- Ein monatlicher Scheduled Task prüft Tagesgeld/Kredite-Zinsen gegen aktuelle
  Quellen und committed Änderungen lokal (ohne zu pushen).

## Weitere Ausbaustufen (optional, nicht mehr blockierend für den Launch)

- Echtes Cookie-Consent-Tool statt Platzhalter.
- Suche (aktuell nur ein nicht-funktionales Lupe-Icon im Header).
- Funktionale Filter-Chips auf `ratgeber.html` (aktuell statisch, nur Optik).
- Giro- und Festgeld-Vergleich (bisher nur Tagesgeld), ETF-Sparplan-Vergleich,
  Baufinanzierungs-Vergleich.
- BU-Lücke-Rechner (Bedarfsermittlung vor der BU-Vergleichstabelle).
- Mieten-oder-Kaufen-Rechner.
- Checklisten-Artikel (z. B. "Broker wechseln", "Depotübertrag").
- Mehr Ratgeber-Artikel; `ratgeber.html` ist so gebaut, dass neue Artikel
  einfach als weitere `.guide-card`-Einträge im `.rat-grid` ergänzt werden.
