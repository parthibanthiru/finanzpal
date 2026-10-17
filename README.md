# Finanzpal — Website-Projekt

Statische, mehrseitige Website (reines HTML/CSS/JS, kein Build-Schritt nötig).
Vergleichsdaten liegen in JSON-Dateien statt hart im HTML — Zahlen lassen sich
dadurch pflegen, ohne jede Seite einzeln zu durchsuchen.

## Struktur

```
finanzpal-production/
├── index.html                       Startseite
├── broker.html                      Broker-Vergleich (JSON-gespeist)
├── broker-trade-republic.html       Broker-Detailseite
├── broker-scalable-capital.html     Broker-Detailseite
├── broker-consorsbank.html          Broker-Detailseite
├── tagesgeld.html                   Tagesgeld-Vergleich (JSON-gespeist)
├── kredite.html                     Kredit-Vergleich (JSON-gespeist)
├── versicherungen.html              Versicherungs-Vergleich (JSON-gespeist)
├── sparplanrechner.html             ETF-Sparplanrechner (Zinseszins-Tool)
├── ratgeber.html                    Ratgeber-Übersicht (alle Artikel)
├── ratgeber-etf-sparplan.html       Artikel: ETF-Sparplan starten
├── ratgeber-tagesgeld-vs-festgeld.html  Artikel: Tagesgeld vs. Festgeld
├── ratgeber-haftpflicht-basics.html Artikel: Private Haftpflicht
├── ueber-uns.html                   Über uns / Methodik
├── impressum.html                   Impressum (Platzhalter — ausfüllen!)
├── datenschutz.html                 Datenschutzerklärung (Platzhalter — ausfüllen!)
├── data/
│   ├── broker.json                  Broker-Vergleichsdaten
│   ├── tagesgeld.json                Tagesgeld-Vergleichsdaten
│   ├── kredite.json                  Kredit-Vergleichsdaten
│   └── versicherungen.json           Versicherungs-Vergleichsdaten
├── assets/
│   ├── style.css                    Gemeinsames Stylesheet (ein Design-System für alle Seiten)
│   ├── nav.js                       Mobiles Menü (Hamburger-Toggle)
│   ├── compare.js                   Rendert die Vergleichstabellen aus den JSON-Dateien
│   └── sparplanrechner.js           Logik für den Sparplanrechner
├── robots.txt
└── README.md                        Diese Datei
```

## Vergleichsdaten aktualisieren

Die Zahlen in den vier Vergleichstabellen (Broker, Tagesgeld, Kredite,
Versicherungen) stehen **nicht** im HTML, sondern in den JSON-Dateien unter
`data/`. Um z. B. einen Tagesgeld-Zinssatz zu ändern:

1. `data/tagesgeld.json` öffnen.
2. Den passenden Eintrag im `items`-Array suchen und den Wert anpassen.
3. Das Feld `updated` (z. B. `"2026-09"`) auf den aktuellen Monat setzen — es
   erscheint automatisch als "Stand: …" über der Tabelle.
4. Datei speichern — fertig, kein Build-Schritt nötig.

Jede Zeile der Tabelle wird beim Laden der Seite per `assets/compare.js` aus
dem JSON gerendert. Das funktioniert nur über `http://`/`https://` (z. B. den
lokalen Server unten oder nach dem Deployment) — direktes Öffnen der HTML-Datei
per Doppelklick (`file://`) blockiert den JSON-Abruf im Browser.

## Vor dem Launch unbedingt erledigen

1. **Platzhalterdaten ersetzen.** Alle Werte in `data/*.json` sind Beispielwerte
   (klar als "Beispieldaten" gekennzeichnet) — vor Veröffentlichung durch echte,
   aktuelle Zahlen ersetzen.
2. **Impressum und Datenschutz ausfüllen.** Beide Seiten enthalten deutlich
   markierte Platzhalter (gelbe Hinweisboxen) für die Finanzpal UG. Diese sind
   in Deutschland Pflicht (§ 5 TMG, DSGVO) — eine kurze anwaltliche Prüfung ist
   bei einer Finanzseite mit Affiliate-Einnahmen empfehlenswert.
3. **Cookie-Consent-Banner ergänzen.** Sobald Analytics oder
   Affiliate-Tracking-Cookies live sind, braucht die Seite ein echtes
   Consent-Tool (noch nicht enthalten).
4. **"Zum Anbieter"-Buttons verlinken.** Alle Affiliate-CTAs sind aktuell
   `href="#"` mit `rel="sponsored nofollow"` vorbereitet — echte Partnerlinks
   eintragen (in den JSON-Dateien unter `affiliateUrl`), sobald die
   Affiliate-Partnerschaften stehen.
5. **Sparplanrechner-Disclaimer prüfen.** Der Rechner blendet bewusst Steuern
   und Produktkosten (TER) aus — das ist im Text erklärt, sollte aber vor
   Launch noch einmal gegengelesen werden.
6. **Favicon und echtes Logo ergänzen** (aktuell nur Textmarke "Finanzpal").

## Lokal testen

JSON-gespeiste Tabellen brauchen `http://`, nicht `file://`. Lokalen Server
starten:

```
cd finanzpal-production
python3 -m http.server 8000
```

Dann im Browser: http://localhost:8000

## Deployment (GitHub + Netlify + GoDaddy-Domain)

1. Ein neues Repository auf GitHub erstellen und den Inhalt dieses Ordners hochladen.
2. Bei netlify.com einloggen → "Add new site" → "Import an existing project" → das GitHub-Repo
   auswählen. Build-Befehl: leer lassen. Publish-Verzeichnis: `/` (Projekt-Hauptordner).
3. Nach dem ersten Deploy zeigt Netlify eine `*.netlify.app`-Adresse — damit testen, ob alles
   funktioniert (inklusive der JSON-Tabellen, da Netlify über `https://` ausliefert).
4. In den Netlify-Seiteneinstellungen unter "Domain management" → "Add custom domain" →
   `finanzpal.de` eintragen. Netlify zeigt daraufhin die nötigen DNS-Einträge an.
5. Im GoDaddy-Konto unter DNS-Verwaltung der Domain genau diese Einträge (meist ein A-Record oder
   CNAME) eintragen. DNS-Änderungen können bis zu ein paar Stunden dauern.
6. Netlify stellt automatisch ein kostenloses SSL-Zertifikat aus, sobald die Domain verbunden ist.

## Weitere Ausbaustufen (optional, nicht mehr blockierend für den Launch)

- Echtes Cookie-Consent-Tool statt Platzhalter.
- Suche (aktuell nur ein nicht-funktionales Lupe-Icon im Header).
- Funktionale Filter-Chips auf `ratgeber.html` und Tabs auf `versicherungen.html`
  (aktuell statisch, nur Optik).
- Weitere Rechner (z. B. Kreditvergleichsrechner, Tagesgeld-Zinsrechner) nach
  demselben Muster wie `sparplanrechner.html` / `assets/sparplanrechner.js`.
- Mehr Ratgeber-Artikel; `ratgeber.html` ist so gebaut, dass neue Artikel einfach
  als weitere `.guide-card`-Einträge im `.rat-grid` ergänzt werden.
