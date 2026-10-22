# Finanzpal — Website-Projekt

Statische, mehrseitige Website (reines HTML/CSS/JS, kein Build-Schritt nötig),
auf GitHub + Netlify deployed. Netlify-Deployment liegt aktuell bewusst
hinter dem Team-SSO-Gate (nicht öffentlich erreichbar, bis explizit anders
entschieden). Custom Domain `finanzpal.de` (DNS bei GoDaddy) noch nicht
verbunden.

Vergleichsdaten liegen in JSON-Dateien statt hart im HTML — Zahlen lassen sich
dadurch pflegen, ohne jede Seite einzeln zu durchsuchen. Jede Vergleichsseite
gibt es doppelt: einmal auf Deutsch im Projekt-Root, einmal auf Englisch unter
`en/` (identische Struktur, übersetzte Inhalte, eigene `.en.json`-Dateien).

## Seitenübersicht

**Vergleiche**
| Seite | Inhalt |
|---|---|
| `broker.html` (+ 3 Detailseiten) | Broker- & Depot-Vergleich in einer Seite: Depot-/Ordergebühr, ETF-Sparpläne, Mindestsparrate, Guthabenzins, Rating — kartenbasiert (ehemals zwei getrennte Seiten `broker.html`/`depot.html`, seit Oktober 2026 zusammengeführt) |
| `girokonto.html` | Girokonto-Vergleich |
| `tagesgeld.html` | Tagesgeld-Vergleich |
| `kinderdepot.html` | Junior-/Kinderdepot-Vergleich, mit Filter „ohne eigenes Elterndepot" |
| `kreditkarte.html` | Kreditkarten-Vergleich, Karten- und Tabellenansicht |
| `kredite.html` | Ratenkredit-Vergleich |
| `baufinanzierung.html` | Baufinanzierungs-Vermittler-Vergleich, 10 Vermittler (u. a. Interhyp, Dr. Klein, Baufi24, Hüttig & Rompf) — bewusst ohne Zinssatz-Zahl, da individuell kalkuliert |
| `versicherungen.html` | 5 Tabs: Privathaftpflicht / Hausrat / Berufsunfähigkeit / Rechtsschutz / Kfz, jeder Tab mit eigenem JSON |
| `etf-suche.html` | ETF-Suche mit Filtern (Anlageklasse, TER, Replikation …) |
| `steuerprogramm.html` | Steuererklärungs-Software-Vergleich |
| `finanz-check.html` | Quiz/Empfehlungstool über Girokonto, Broker/Depot, Kreditkarte, Tagesgeld |

**Rechner**
| Seite | Inhalt |
|---|---|
| `sparplanrechner.html` | ETF-Sparplanrechner (Einmalanlage + Sparrate) |
| `zinseszinsrechner.html` | Zinseszinsrechner (gleiche Engine wie oben) |
| `kreditrechner.html` | Kreditrechner (Annuitätendarlehen) |
| `baufinanzierungsrechner.html` | Baufinanzierungsrechner (Monatsrate, Restschuld, Zinskosten) |
| `nettolohnrechner.html` | Brutto-Netto-Rechner, nur Steuerklasse I, mit voller Abgaben-Aufschlüsselung |
| `haushaltsbuch.html` | Budget-Tracker, Daten nur im Browser (localStorage), kein Backend |
| `altersvorsorge-rechner.html` | Altersvorsorge-/Rentenlücken-Rechner |

**Ratgeber** — `ratgeber.html` zeigt alle Artikel als Karten (je mit eigenem
Icon + Akzentfarbe, siehe unten); aktuell 10 Artikel über 6 Kategorien
(Investieren / Zahlen / Sparen / Finanzieren / Absichern / Vorsorge):
ETF-Sparplan, Kreditkarte, Tagesgeld-vs-Festgeld, Ratenkredit, Haftpflicht,
Berufsunfähigkeit, Girokonto, Depot, Steuerprogramm, Altersvorsorgedepot. Der
Depot-Guide-Artikel (`ratgeber-depot-guide.html`) verlinkt seit der
Broker/Depot-Zusammenführung auf den gemeinsamen Broker- & Depot-Vergleich
(`broker.html`) statt auf eine eigene Depot-Seite.

**Sonstiges:** `index.html` (Startseite), `ueber-uns.html` (Methodik),
`impressum.html` / `datenschutz.html` (**Platzhalter, siehe unten**),
`sitemap.xml` (DE+EN mit hreflang-Alternates), `robots.txt`.

## Struktur

```
finanzpal-production/
├── *.html                      36 Seiten auf Deutsch (siehe Seitenübersicht oben)
├── en/                         Komplette englische Spiegelung aller Seiten
├── sitemap.xml / robots.txt
├── data/
│   ├── broker.json / .en.json            Broker- & Depot-Vergleichsdaten (zusammengeführt,
│   │                                      ein Eintrag pro Anbieter mit allen Feldern aus
│   │                                      beiden ehemaligen Datensätzen)
│   ├── girokonto.json / .en.json         Girokonto-Vergleichsdaten
│   ├── tagesgeld.json / .en.json         Tagesgeld-Vergleichsdaten
│   ├── kinderdepot.json / .en.json       Kinderdepot-Vergleichsdaten
│   ├── kredite.json / .en.json           Ratenkredit-Vergleichsdaten
│   ├── kreditkarte.json / .en.json       Kreditkarten-Vergleichsdaten
│   ├── baufinanzierung.json / .en.json   Baufinanzierungs-Vermittler-Daten
│   ├── versicherungen.json / .en.json    Privathaftpflicht-Vergleichsdaten
│   ├── hausrat.json / .en.json           Hausrat-Vergleichsdaten
│   ├── bu.json / .en.json                Berufsunfähigkeit-Vergleichsdaten
│   ├── rechtsschutz.json / .en.json      Rechtsschutz-Vergleichsdaten
│   ├── autoversicherung.json / .en.json  Kfz-Versicherung-Vergleichsdaten
│   ├── etf.json / .en.json               ETF-Suche-Daten
│   └── steuerprogramm.json / .en.json    Steuerprogramm-Vergleichsdaten
├── assets/
│   ├── style.css                   Gemeinsames Stylesheet (ein Design-System für alle Seiten,
│   │                                 inkl. Light/Dark-Theme über CSS-Variablen in :root)
│   ├── nav.js                      Mobiles Menü (Hamburger-Toggle), Dropdown-Logik für die
│   │                                Nav-Gruppen (Broker / Konten & Depots / Kredite /
│   │                                Versicherungen / Rechner),
│   │                                Dark-Mode-Toggle
│   ├── compare.js                  Rendert die generischen Vergleichstabellen aus JSON;
│   │                                exponiert window.FPCompare.renderTable()
│   ├── insurance-tabs.js           Schaltet die 5 Versicherungs-Tabs um
│   ├── broker-quiz.js / finanz-check.js / finanz-profil.js / cross-sell.js
│   │                                Finanz-Check-Quiz und produktübergreifende Empfehlungslogik
│   ├── broker-compare.js / kinderdepot-compare.js / girokonto-compare.js /
│   │   kreditkarte-compare.js / baufinanzierung-compare.js / steuer-compare.js
│   │                                Seiteneigene Renderer mit Filtern/Sortierung (eigene
│   │                                Renderlogik statt des generischen compare.js, da jede
│   │                                Seite eigene Filter-/Ansichtslogik braucht)
│   ├── etf-search.js               Filterlogik für etf-suche.html
│   ├── kk-skeleton.js              Lade-Skeleton für Kreditkarten-/Depot-Karten
│   ├── compare-bar.js              Fixierte „Vergleichen"-Leiste (Mehrfachauswahl → Vergleich)
│   ├── sparplanrechner.js          Logik für Sparplanrechner & Zinseszinsrechner
│   ├── kreditrechner.js            Annuitätenformel für den Kreditrechner
│   ├── baufinanzierungsrechner.js  Annuitätendarlehen-Logik für Baufinanzierung
│   ├── nettolohnrechner.js         SV-Beiträge + §32a-EStG-Tarif + Soli (Steuerklasse I)
│   ├── haushaltsbuch.js            localStorage-Budget-Tracker
│   └── altersvorsorge-rechner.js   Rentenlücken-Logik
├── tools/                          Wartungsskripte für seitenweite Änderungen
│   ├── build_nav.py                 Regeneriert die Top-Nav identisch in allen 74 Dateien
│   ├── add_article_icons.py         Setzt Icon + Akzentfarbe für Ratgeber-Artikel
│   ├── compute_scores.py            Berechnet den Finanzpal-Score (0–100 + Note A–D) je
│   │                                  Kategorie aus bereits vorhandenen JSON-Feldern,
│   │                                  schreibt `score` in data/*.json zurück (siehe unten)
│   ├── audit_quick.py               Playwright-Regressionscheck (alle Seiten, Light/Dark)
│   └── README.md                    Details, Aufrufparameter, Voraussetzungen je Skript
└── README.md                       Diese Datei
```

## Navigation

Die Top-Nav ist über alle Seiten identisch und gruppiert die ursprünglich
8 Einzel-Links in Dropdowns, damit auch Seiten ohne eigenen Nav-Slot (z. B.
Girokonto, Baufinanzierung, alle Rechner) von oben erreichbar sind:
**Konten & Depots ▾** (Finanz-Check, Girokonto, Tagesgeld, Kreditkarte) ·
**Broker ▾** (Broker & Depot, Kinderdepot, ETF-Suche) ·
**Kredite ▾** (Ratenkredit, Baufinanzierung) ·
**Versicherungen ▾** (Privathaftpflicht, Hausrat, Berufsunfähigkeit,
Rechtsschutz, Kfz) · **Steuerprogramm** · **Rechner ▾** (alle 7 Rechner) ·
**Ratgeber** · **Über uns**. Öffnet per Klick und (auf Geräten mit Maus) per Hover, klappt
auf Mobile zu einer flachen, eingerückten Liste unter dem Hamburger-Menü auf.
Neue Unterseite ergänzen = neuen `<a>`-Eintrag im passenden Dropdown-Panel in
jeder betroffenen `.html`-Datei (es gibt kein serverseitiges Nav-Template) —
dafür `tools/build_nav.py` ausführen statt von Hand zu editieren, siehe
`tools/README.md`.

Stand Oktober 2026: **Konten & Depots** steht jetzt als erste Gruppe links
(häufigster Einstiegspunkt), **Kinderdepot** ist aus Konten & Depots in die
**Broker**-Gruppe gewandert (inhaltlich näher an Depot/Sparplan-Themen als an
Girokonto/Kreditkarte) und der Broker-Panel-Eintrag heißt jetzt „Broker &
Depot" statt „Online-Broker" — passend zur Fußzeile und zum Seiteninhalt
seit der Broker/Depot-Zusammenführung (siehe unten), die den alten Namen
sonst irreführend gemacht hätte.

Seit Oktober 2026 sind der frühere eigenständige Depot-Vergleich (`depot.html`)
und der Online-Broker-Vergleich zu einer Seite verschmolzen (`broker.html`,
unter dem **Broker**-Dropdown): eine kartenbasierte Ansicht (Filter, Sortierung,
„Vergleichen"-Leiste) zeigt pro Anbieter Depot-/Ordergebühr, ETF-Sparplan-Auswahl,
Mindestsparrate, Guthabenzins, Verwahrentgelt und Bewertung in einer Karte,
gespeist aus der zusammengeführten `data/broker.json` (ein Eintrag pro Anbieter
statt zweier getrennter Datensätze mit unterschiedlichen IDs).

Die vier Versicherungen-Dropdown-Einträge außer Privathaftpflicht verlinken
auf `versicherungen.html#hausrat` / `#berufsunfaehigkeit` / `#rechtsschutz` /
`#kfz` — `assets/insurance-tabs.js` liest diesen Hash beim Laden und aktiviert
automatisch den passenden Tab, statt immer mit Privathaftpflicht zu starten.

### „Aktuell beste Empfehlung"-Banner

Alle 8 Vergleichskategorien (Broker & Depot, Girokonto, Tagesgeld, Kinderdepot,
Kreditkarte, Kredite, Baufinanzierung, Steuerprogramm) sowie — dynamisch pro
Tab — Versicherungen zeigen im Hero einen grünen Banner (`.best-rate-banner`)
mit einer konkreten Top-Empfehlung statt einer allgemeinen Aussage. Auf den
meisten Seiten ist das statisches HTML (Label + Anbietername + ein bis zwei
reale Kennzahlen aus der jeweiligen `data/*.json`, keine erfundenen Zahlen);
bei Baufinanzierung bewusst ohne Preisangabe (reichweitenbasierte Begründung
„Unsere Empfehlung" statt „Aktuell beste Empfehlung", da hier laut eigener
Methodik kein einzelner bester Zins existiert). Auf `versicherungen.html`
schaltet `assets/insurance-tabs.js` den Banner-Text pro Tab um (`TYPES[].banner`,
DE/EN) und blendet ihn komplett aus, wenn der jeweilige Typ keinen
`recommended`-Eintrag in seiner JSON hat (aktuell: Rechtsschutz) — dafür war
eine explizite `.best-rate-banner[hidden] { display: none; }`-Regel in
`style.css` nötig, weil die Klasse selbst `display: flex` setzt und damit das
`hidden`-Attribut sonst überstimmt. Neue Kategorie mit Banner ergänzen = Markup
nach dem `trust-bar` einfügen (siehe bestehende Seiten als Vorlage) und Text
anhand des tatsächlichen `recommended`-Eintrags der zugehörigen JSON-Datei
formulieren, nicht freihändig.

### Suche

Die Lupe oben rechts (nur Desktop) öffnet eine clientseitige Seitensuche
(`initSiteSearch()` in `assets/nav.js`): ein fest hinterlegter Index aller
Seiten (Array `PAGES_DE`/`PAGES_EN`, je mit Titel + Stichwörtern) wird live
nach Tippen gefiltert, kein Server-Request nötig. Tastatur: `/` öffnet die
Suche von überall auf der Seite, Pfeiltasten + Enter navigieren, Escape
schließt. Neue Seite ergänzen = neuen Eintrag in beiden Arrays in
`assets/nav.js` (Titel + ein paar Stichwörter reichen).

## Vergleichsdaten aktualisieren

**Stand Oktober 2026:** alle 14 Vergleichskategorien (Broker, Girokonto,
Tagesgeld, Depot, Kinderdepot, Kredite, Kreditkarte, Baufinanzierung,
Autoversicherung, Hausrat, BU, Rechtsschutz, Privathaftpflicht,
Steuerprogramm) wurden auf je 10 recherchierte Anbieter ausgebaut (ETF-Suche
bleibt bei 18, da bereits vorher größer). Jeder neue Eintrag folgt demselben
Ehrlichkeitsprinzip wie die ursprünglichen Daten — unsichere oder
widersprüchliche Angaben stehen als Caveat/Note-Text im JSON statt als
erfundene Zahl. Die Trust-Stat-Kacheln („X verglichen") auf den jeweiligen
Seiten sind entsprechend aktualisiert.

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

Jede Zeile wird beim Laden der Seite per JS aus dem JSON gerendert. Das
funktioniert nur über `http://`/`https://` — direktes Öffnen der HTML-Datei
per Doppelklick (`file://`) blockiert den JSON-Abruf im Browser.

### Versicherungen: 5 Tabs statt einer Tabelle

`versicherungen.html` zeigt fünf Tabs (Privathaftpflicht / Hausrat /
Berufsunfähigkeit / Rechtsschutz / Kfz). Jeder Tab ist in
`assets/insurance-tabs.js` als Eintrag in `TYPES[]` definiert: eigene
JSON-Quelle, eigene Spalten-Header („Jahresbeitrag" vs. „Beitrag" bei BU) und
ein eigener Disclosure-Text, der beim Tab-Wechsel den `.disclosure-note`-
Absatz ersetzt. Neuen Tab ergänzen = neuen Eintrag in `TYPES[]` + passendes
JSON unter `data/`.

**Wichtiger Hinweis zu den Preisen bei Hausrat/BU/Rechtsschutz/Kfz:** anders
als bei Tagesgeld/Kredite/Kreditkarte gibt es hier keine "echten"
Einzelpreise pro Anbieter ohne Angebotsrechner — das ist im jeweiligen
Disclosure-Text offengelegt:
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
- **Kfz:** gleiches Prinzip — Kfz-Prämien hängen extrem von Typklasse,
  SF-Klasse, Wohnort und Fahrerprofil ab, daher kein erfundener Einzelpreis.

Dasselbe Prinzip gilt für **Baufinanzierung**: Zinssätze sind individuell
(Beleihungsauslauf, Bonität, Zinsbindung) und werden daher nicht als Zahl
gezeigt, sondern über verifizierbare Fakten (Partnerbanken, Standorte,
Auszeichnungen) verglichen — mit dem Hinweis „Angaben des Anbieters, nicht
unabhängig geprüft".

### Ratgeber: eigenes Icon + Akzentfarbe pro Artikel

Jeder Artikel hat ein eigenes Icon (Inline-SVG, `assets/style.css` →
`.cat-icon`) und eine eigene Akzentfarbe über die CSS-Custom-Property
`--thumb-accent` (z. B. `style="--thumb-accent: var(--teal)"`), die per
`color-mix()` zu einer sanften Kachel-Hintergrundfarbe wird — funktioniert
automatisch in Light und Dark, da die Farbtokens selbst Dark-Mode-Varianten
haben. Diese Kombination aus Icon + Akzentfarbe wird an drei Stellen
verwendet: auf der `ratgeber.html`-Übersichtskarte, als kleines Logo-Badge
oben auf der Artikelseite selbst, und in den „Weiterlesen"-Karten anderer
Artikel (nur bei Verlinkung zu einem anderen Ratgeber-Artikel — Querverweise
auf Tool-/Vergleichsseiten wie `broker.html` behalten ihr generisches Icon).
Neuen Artikel ergänzen = neuen Eintrag in der `ICONS`/`MAP`-Zuordnung (aktuell
nur als einmaliges Skript gepflegt, kein eigenes JS-Modul) + manuell an den
drei Stellen einsetzen.

## Finanzpal-Score

**Stand Oktober 2026 — Kategorien Girokonto, Kredite & Kreditkarte.**
Zusätzlich zu den Rohdaten zeigen `girokonto.html`/`en/girokonto.html` und
`kreditkarte.html`/`en/kreditkarte.html` (beide Karten-Layout, eigenes
Vergleichs-JS) sowie `kredite.html`/`en/kredite.html` (Tabellen-Layout,
`assets/compare.js`) einen grünen/blauen/gelben/grauen Badge pro Zeile
(`.fp-score-badge`, A–D-Note + Zahl 0–100), berechnet aus Feldern, die auf
derselben Seite ohnehin schon stehen:
  - Girokonto: Kontoführungsgebühr 35 % · Dispozins 25 % · Guthabenzins 20 %
    · Karte & Bargeld-Flexibilität 20 %.
  - Kredite: Zinssatz 55 % · Sondertilgungsrecht 30 % · Kreditrahmen 15 %.
    Beim Sondertilgungsrecht zählt nur ein ausdrücklich als kostenlos
    genanntes Recht — ein bloßes „jederzeit möglich" ohne Kostenangabe reicht
    nicht für die Top-Stufe.
  - Kreditkarte: Jahresgebühr 30 % · weltweite Abhebung 30 % ·
    Bedingungsfreiheit 20 % · zinsfreie Tage 20 %. Fehlt die Anzahl
    zinsfreier Tage (Debit-/Charge-Karten rechnen anders ab), wird das
    neutral statt als Nachteil gewertet.

Design-Hintergrund und die vollständigen Bewertungskriterien für alle
Kategorien (inkl. der bewusst noch nicht bewerteten: Baufinanzierung, BU,
Kfz, Rechtsschutz) stehen im Projektdokument
„finanzpal-score-methodology.md".

- **`tools/compute_scores.py`** ist die einzige Quelle für die Berechnung —
  nie von Hand in den JSON-Dateien nachtragen. Rechnet aus der jeweiligen
  `data/<kategorie>.json` (DE ist die Quelle der Wahrheit) und schreibt
  denselben `score`-Wert anhand der `id` identisch in
  `data/<kategorie>.en.json` zurück, damit ein Anbieter nie je nach
  Sprachversion unterschiedlich bewertet wird (ein Early-Bug: ein
  Teilkriterium hatte ursprünglich per Stichwortsuche im deutschen Freitext
  gearbeitet, was auf der übersetzten EN-Seite stillschweigend andere Werte
  lieferte — seither wird nur noch einmal, aus der DE-Datei, gerechnet).
- Ausführen nach jeder Datenänderung an einer bewerteten Kategorie:
  `python3 tools/compute_scores.py girokonto kredite kreditkarte` (oder ohne
  Argument für alle registrierten Kategorien).
- Jedes `score`-Objekt enthält `value`, `band`, ein `breakdown` je Teilkriterium
  (im Badge-Tooltip sichtbar) und `computedFrom` (Monat der Berechnung) — bewusst
  offengelegt statt einer nackten Zahl.
- Das Badge-Markup selbst sitzt an drei Stellen, je nach Layout der
  Zielseite: `scoreBadgeHtml()`/`scoreTooltip()` in
  `assets/girokonto-compare.js` und `assets/kreditkarte-compare.js` (jeweils
  Karten, Kreditkarte zusätzlich mit einer Tabellen-Ansicht im selben
  Skript) sowie dieselben Funktionen generisch in `assets/compare.js`
  (Tabellen, geteilt mit Tagesgeld/Versicherungen — der Badge erscheint dort
  nur, sobald ein `score`-Feld in den Daten steht).
- Neue Kategorie bewerten = Rubrik in `compute_scores.py` ergänzen (siehe
  `GIROKONTO_RUBRIC`/`KREDITE_RUBRIC`/`KREDITKARTE_RUBRIC` als Vorlage),
  Badge-Rendering an der richtigen Stelle anschließen (jeweiliges
  Karten-Skript oder `SCORE_FACTOR_LABELS` in `compare.js`) **und**
  Methodik-Text auf `ueber-uns.html`/`en/ueber-uns.html`
  (`#finanzpal-score`) erweitern — nie eine Kategorie stillschweigend
  bewerten, ohne die Kriterien dort offenzulegen.

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
4. **Alle `affiliateUrl`-Felder in `data/*.json` sind noch `"#"`.** Noch keine
   echten Partnerlinks (siehe Launch-Liste unten).
5. **Filter-Chips auf `ratgeber.html`** (Alle/Investieren/Zahlen/…) sind noch
   rein optisch — kein JS filtert die Artikelkarten danach.
6. **Scalable Capital: zwei leicht widersprüchliche Depotgebühr-Angaben
   zusammengeführt.** Der ehemalige `broker.json`-Eintrag nannte die
   gestaffelte Gebühr „0 € (Free Broker) / 4,99 €/Monat (Prime+)", der
   ehemalige `depot.json`-Eintrag pauschal „0 €/Jahr". Nach der
   Broker/Depot-Zusammenführung zeigt die Karte die differenziertere
   `brokerDepotfee` als Hauptangabe; das Flag `depotgebuehrBedingungslos: true`
   aus dem Depot-Datensatz steht weiter für den „Depotführung bedingungslos
   kostenlos"-Filter/Badge. Vor Launch beim Anbieter verifizieren, welche
   Angabe tatsächlich zutrifft.

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
7. **Netlify-SSO-Gate entfernen**, sobald die Seite öffentlich gehen soll
   (aktuell bewusst dahinter, nur fürs Team sichtbar).
8. Entscheidung zu den bekannten offenen Punkten oben treffen.

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
  `main` (Projekt "Finanzpal", Free-Plan mit begrenzten Build-Minuten),
  aktuell hinter dem Team-SSO-Gate.
- **Arbeitsregel (aktualisiert):** Änderungen werden nach jeder
  abgeschlossenen logischen Einheit automatisch committed **und gepusht** —
  nicht mehr erst auf explizite Aufforderung warten (frühere Regel, als Push
  noch manuell freigegeben werden musste, ist aufgehoben).
- Jeder Commit endet mit einer `Co-Authored-By`-Zeile für die beteiligte
  Claude-Session.
- Wartungsskripte für seitenweite Änderungen (Nav, Ratgeber-Icons,
  Regressionscheck) liegen versioniert in `tools/`, siehe `tools/README.md`
  — vorher lagen sie nur in der jeweiligen Chat-Session und gingen mit ihr
  verloren.
- **Custom Domain** (`finanzpal.de`, DNS bei GoDaddy) ist noch **nicht**
  verbunden — bewusst zurückgestellt. Sobald gewünscht: Netlify →
  "Domain management" → "Add custom domain" → die angezeigten DNS-Einträge
  bei GoDaddy eintragen → Netlify stellt automatisch SSL aus.

## Weitere Ausbaustufen (optional, nicht mehr blockierend für den Launch)

- Echtes Cookie-Consent-Tool statt Platzhalter.
- Funktionale Suche (aktuell nur ein nicht-funktionales Lupe-Icon im Header).
- Funktionale Filter-Chips auf `ratgeber.html` (aktuell statisch, nur Optik).
- Robo-Advisor-Vergleich (im ursprünglichen Launch-Plan als Investing-
  Kategorie vorgesehen, bisher nicht gebaut).
- Eigener Festgeld-Vergleich (bisher nur Tagesgeld; Festgeld kommt nur im
  Ratgeber-Artikel vor).
- BU-Lücke-Rechner (Bedarfsermittlung vor der BU-Vergleichstabelle).
- Mieten-oder-Kaufen-Rechner.
- Checklisten-Artikel (z. B. "Broker wechseln", "Depotübertrag").
- Mehr Ratgeber-Artikel; neue Artikel brauchen zusätzlich zur `.guide-card`
  im `.rat-grid` auch einen Eintrag in der Icon/Farb-Zuordnung (siehe oben).
- Neues Scoring-System für die Produktbewertungen (in Brainstorming-Phase,
  noch nicht entworfen).
