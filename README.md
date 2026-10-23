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
finanzpal/
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
│   │                                Nav-Gruppen (Broker / Konten / Kredite /
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
├── mobile/                         Finanzpal-App (Android & iOS, Expo/React Native) — nutzt
│                                     data/*.json + Disclosure-Texte dieser Website, siehe
│                                     Abschnitt „Mobile App" und mobile/README.md
├── .github/workflows/mobile-app.yml Automatische App-Prüfung (GitHub Actions)
├── netlify.toml                    Kein Deploy bei Commits nur in mobile/ oder .github/; /mobile/* nie ausliefern
└── README.md                       Diese Datei
```

## Navigation

Die Top-Nav ist über alle Seiten identisch und gruppiert die ursprünglich
8 Einzel-Links in Dropdowns, damit auch Seiten ohne eigenen Nav-Slot (z. B.
Girokonto, Baufinanzierung, alle Rechner) von oben erreichbar sind:
**Konten ▾** (Finanz-Check, Girokonto, Tagesgeld, Kreditkarte) ·
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

Stand Oktober 2026: Die DE-Nav-Gruppe heißt jetzt **Konten** (vorher „Konten &
Depots" — gekürzt, da „Depots" inhaltlich zu Broker/Kinderdepot gehört, nicht
zu Girokonto/Tagesgeld/Kreditkarte). Sie steht als erste Gruppe links
(häufigster Einstiegspunkt), **Kinderdepot** ist aus Konten & Depots in die
**Broker**-Gruppe gewandert (inhaltlich näher an Depot/Sparplan-Themen als an
Girokonto/Kreditkarte) und der Broker-Panel-Eintrag heißt jetzt „Broker &
Depot" statt „Online-Broker" — passend zur Fußzeile und zum Seiteninhalt
seit der Broker/Depot-Zusammenführung (siehe unten), die den alten Namen
sonst irreführend gemacht hätte.

Zusätzlich wurden die EN-Panel-Labels für Girokonto und Tagesgeld vereinheitlicht:
Girokonto heißt jetzt überall **"Checking account"** (vorher uneinheitlich
"Current account" in Nav/Footer vs. bereits "Checking account" auf einzelnen
Unterseiten) und Tagesgeld **"Instant savings account"** (vorher "Savings" /
"Savings account" / "Overnight savings" je nach Stelle). Die Namensänderung
betrifft Nav-Dropdown und (seit 2026-10-22, siehe unten) Footer-"Compare"-
Spalte (beide `tools/build_nav.py` EN_PANELS/FOOTER_COMPARE_EN),
`ueber-uns.html`, `index.html`, `finanz-check.html` + `finanz-check.js`, den
Ratgeber-Artikel „Instant savings account or fixed deposit" sowie
`assets/nav.js` (Suchindex) und `assets/cross-sell.js`.

**Footer jetzt ebenfalls über `tools/build_nav.py` generiert** (vorher nur
der Header-Nav): der Footer war pro Seite hart kodiert und wurde nie
automatisch geprüft, wodurch er unbemerkt auseinanderlaufen konnte — z. B.
hatte `en/altersvorsorge-rechner.html` noch Monate nach einem früheren
Rename veraltete Footer-Labels ("Credit card" statt "Credit cards", "ETF
finder" statt "ETF search" u. a.). Das Script generiert jetzt Vergleiche-/
Ratgeber-/Über-uns-Spalte sowie den Footer-Legal-Satz; einzelne Seiten mit
inhaltlich korrekt abweichendem Legal-Satz (Baufinanzierung: "Finanzierungs-
anfrage"/"keine Finanzberatung"; Kinderdepot: "ein Depot eröffnest"; Haus-
haltsbuch: kein Affiliate-Satz; Nettolohnrechner: "keine Steuerberatung")
sind über `FOOTER_LEGAL_OVERRIDES` in `tools/build_nav.py` erhalten
geblieben, nicht überschrieben. `en/kinderdepot.html` fehlte dabei sogar
der korrekte Depot-spezifische Satz komplett (hatte nur den generischen) —
das ist jetzt mitkorrigiert. Siehe `tools/README.md` für Details.

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

**Stand Oktober 2026 — Kategorien Girokonto, Kredite, Kreditkarte, Tagesgeld
& Kinderdepot.** Zusätzlich zu den Rohdaten zeigen `girokonto.html`/
`en/girokonto.html`, `kreditkarte.html`/`en/kreditkarte.html` und
`kinderdepot.html`/`en/kinderdepot.html` (alle drei Karten-Layout, jeweils
eigenes Vergleichs-JS) sowie `kredite.html`/`en/kredite.html` und
`tagesgeld.html`/`en/tagesgeld.html` (Tabellen-Layout, `assets/compare.js`)
einen Finanzpal-Score-Badge pro Zeile (`.fp-score-badge`):
ein kleiner Fortschritts-Ring (SVG, `stroke-dasharray`/`-dashoffset`) mit der
Note (A–D) in der Mitte und der Zahl (0–100) daneben, in den vier bestehenden
Band-Farben grün/petrol/gold/schiefergrau. Der Ring füllt sich proportional
zum Score, statt nur eine flache Farbfläche zu zeigen — bewusst kein
Siegel-/Zertifikats-Look, um keine Drittprüfung vorzutäuschen, die es nicht
gibt (Tooltip + `aria-label` nennen das trotzdem explizit „Finanzpal-Score",
nicht „Zertifiziert" o. ä.). Berechnet aus Feldern, die auf derselben Seite
ohnehin schon stehen:
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
  - Tagesgeld: Zins 55 % · Zins-Garantiedauer 20 % · Einlagensicherung 25 %.
    Eine vom Anbieter selbst als unklar markierte Währungsumrechnung zählt
    nur als Teilerfüllung; ein ausdrücklicher Hinweis, dass ein Teil des
    Guthabens ohne Einlagensicherung gehalten werden kann, schlägt
    entsprechend stärker zu Buche — keins von beiden wird wie eine
    uneingeschränkte Garantie gewertet.
  - Kinderdepot: Depotgebühr 20 % · Mindestsparrate 15 % · Guthabenzins 30 %
    · Eltern-Aufwand 35 %. Das höchste Gewicht liegt bewusst darauf, ob ein
    Elternteil dafür selbst schon ein eigenes Depot beim Anbieter braucht —
    der Faktor, der diese Kategorie am stärksten von einem normalen
    Erwachsenen-Depot unterscheidet. Ein als Neukundenaktion gekennzeichneter
    Guthabenzins wird leicht abgewertet (×0,8), da er laut Anbieter nach
    einer Frist wieder sinken kann.

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
  `python3 tools/compute_scores.py girokonto kredite kreditkarte tagesgeld
  kinderdepot` (oder ohne Argument für alle registrierten Kategorien).
- Jedes `score`-Objekt enthält `value`, `band`, ein `breakdown` je Teilkriterium
  (im Badge-Tooltip sichtbar) und `computedFrom` (Monat der Berechnung) — bewusst
  offengelegt statt einer nackten Zahl.
- Das Badge-Markup selbst sitzt an vier Stellen, je nach Layout der
  Zielseite: `scoreBadgeHtml()`/`scoreTooltip()` in
  `assets/girokonto-compare.js`, `assets/kreditkarte-compare.js` und
  `assets/kinderdepot-compare.js` (jeweils Karten, Kreditkarte zusätzlich
  mit einer Tabellen-Ansicht im selben Skript) sowie dieselben Funktionen
  generisch in `assets/compare.js` (Tabellen, geteilt mit Versicherungen,
  das noch kein `score`-Feld hat — der Badge erscheint dort nur, sobald
  eins in den Daten steht; `SCORE_FACTOR_LABELS.tagesgeld` zeigt das Muster
  für die Tooltip-Labels einer neuen Tabellen-Kategorie).
- Neue Kategorie bewerten = Rubrik in `compute_scores.py` ergänzen (siehe
  `GIROKONTO_RUBRIC`/`KREDITE_RUBRIC`/`KREDITKARTE_RUBRIC`/`TAGESGELD_RUBRIC`/
  `KINDERDEPOT_RUBRIC` als Vorlage), Badge-Rendering an der richtigen Stelle
  anschließen (jeweiliges Karten-Skript oder `SCORE_FACTOR_LABELS` in
  `compare.js`) **und** Methodik-Text auf `ueber-uns.html`/
  `en/ueber-uns.html` (`#finanzpal-score`) erweitern — nie eine Kategorie
  stillschweigend bewerten, ohne die Kriterien dort offenzulegen.
- **Breakdown-Popover (seit 2026-10-23).** Der Badge trug das Teilkriterien-
  Breakdown bisher nur im nativen `title`-Tooltip — auf Touch-Geräten (also
  dem Großteil des Traffics auf einer Vergleichsseite) nie sichtbar, da ein
  `title`-Tooltip kein Hover kennt. Jede der vier Badge-Render-Funktionen
  schreibt das Breakdown jetzt zusätzlich als `data-score-rows`-JSON
  (`{label, value}`-Paare) ins Markup; `assets/score-popover.js` (neu,
  event-delegiert auf `document`, somit unabhängig davon, wann/wo ein Badge
  nachträglich ins DOM gerendert wird) öffnet daraus per Klick/Tap ein
  kleines Panel mit einer Mini-Balkenanzeige pro Faktor, Escape/Außenklick/
  Close-Button schließen es wieder, Tastatur- und Screenreader-zugänglich
  (`aria-haspopup`, `aria-expanded`, Fokus wandert beim Öffnen ins Panel).
  Eingebunden auf allen 10 Seiten mit bewerteten Kategorien (`girokonto`,
  `kredite`, `tagesgeld`, `kreditkarte`, `kinderdepot`, je DE/EN) direkt nach
  dem jeweiligen Vergleichs-Skript. Neue bewertete Kategorie = Script-Tag
  dort ebenfalls ergänzen. Der `title`-Tooltip bleibt zusätzlich bestehen
  (Progressive Enhancement, kein Funktionsverlust ohne JS/mit altem Browser).

## Bekannte offene Punkte (bewusste Entscheidungen, nicht vergessen)

1. **DEVK-Beitrag (Privathaftpflicht) ist eine Schätzung**, im Disclosure-Text
   entsprechend markiert — vor Launch durch ein echtes Angebot ersetzen.
2. **Consorsbank Visa Karte und drei der vier Hausrat-Anbieter** zeigen
   Ratings, die noch nicht unabhängig verifiziert sind (im jeweiligen
   Disclosure-Text offengelegt).
3. **Alle `affiliateUrl`-Felder in `data/*.json` sind noch `"#"`.** Noch keine
   echten Partnerlinks (siehe Launch-Liste unten).
4. **Filter-Chips auf `ratgeber.html`** (Alle/Investieren/Zahlen/…) sind noch
   rein optisch — kein JS filtert die Artikelkarten danach.
5. **Scalable Capital: zwei leicht widersprüchliche Depotgebühr-Angaben
   zusammengeführt.** Der ehemalige `broker.json`-Eintrag nannte die
   gestaffelte Gebühr „0 € (Free Broker) / 4,99 €/Monat (Prime+)", der
   ehemalige `depot.json`-Eintrag pauschal „0 €/Jahr". Nach der
   Broker/Depot-Zusammenführung zeigt die Karte die differenziertere
   `brokerDepotfee` als Hauptangabe; das Flag `depotgebuehrBedingungslos: true`
   aus dem Depot-Datensatz steht weiter für den „Depotführung bedingungslos
   kostenlos"-Filter/Badge. Vor Launch beim Anbieter verifizieren, welche
   Angabe tatsächlich zutrifft.

6. **Herkunft der Broker-Ratings (★, z. B. 4,3 / 5) ist nicht dokumentiert.**
   Die erfundenen Leserbewertungen und Bewertungszahlen („312 Bewertungen")
   auf den Broker-Detailseiten wurden am 23.10.2026 entfernt; die Sterne-
   Ratings sind seitdem ehrlich als „Finanzpal-Einschätzung" bzw.
   „Redaktionelle Einschätzung von Finanzpal" beschriftet. Vor dem Launch
   klären, worauf sie beruhen — dokumentieren (Methodik auf `ueber-uns.html`)
   oder durch den Finanzpal-Score ersetzen.

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
5. **Newsletter-Formular hat kein Backend.** Das Eingabefeld auf der
   Startseite (`.newsletter-form`) sammelt aktuell nichts — ESP (z. B. Brevo,
   Mailchimp) anbinden, sobald entschieden.
6. **Netlify-SSO-Gate entfernen**, sobald die Seite öffentlich gehen soll
   (aktuell bewusst dahinter, nur fürs Team sichtbar).
7. Entscheidung zu den bekannten offenen Punkten oben treffen.

**Erledigt:** Echtes Logo eingebunden (2026-10-23) — das FP5-Icon
(`assets/favicon.svg`, `assets/icon-512.png`) war bereits das fertige Icon aus
dem Projekt-Dokument `brand/finanzpal-logo-fp5.md` (Navy-Hintergrund, F/P als
weiße Buchstaben, grüner Lächeln-Schwung); nur die Wordmark im Header/Footer
lief noch über `--font-body` (Inter). Jetzt lädt jede Seite zusätzlich
**Sora SemiBold** (Google Fonts, `&family=Sora:wght@600`) und `.wordmark`
nutzt eine neue `--font-logo`-Variable (Sora, Fallback Inter) mit
`letter-spacing: -0.03em` statt `-0.02em` — passend zur Vorgabe im
Logo-Dokument. Alle anderen Überschriften/Fließtext bleiben unverändert
(Source Serif 4 / Inter); das ist eine bewusst unangetastete,
separate Entscheidung.

## Lokal testen

JSON-gespeiste Tabellen brauchen `http://`, nicht `file://`. Lokalen Server
starten:

```
cd finanzpal-test
python3 -m http.server 8000
```

Dann im Browser: http://localhost:8000

## Mobile App (`mobile/`)

Die Android-/iOS-App (Expo/React Native + Supabase-Login) liegt seit Oktober 2026
im selben Repo unter `mobile/`. Sie nutzt die Website als einzige Datenquelle:

- **Vergleiche:** alle 13 Vergleiche aus den gleichen `data/*.json`-Dateien
  (inkl. Finanzpal-Score, Caveats, „Unsere Empfehlung"). Die App hat eine Kopie
  unter `mobile/data/`, die `mobile/tools/sync-data.mjs` erzeugt — das Skript
  zieht außerdem die Disclosure-Texte („Werbung: …") aus den Vergleichsseiten
  und `assets/insurance-tabs.js`.
- **Rechner:** alle 7 Rechner nativ in der App (`mobile/lib/calc.ts`, gleiche
  Formeln, Startwerte und Disclaimer-Texte wie die `assets/*rechner.js` bzw.
  `haushaltsbuch.js` — gegeneinander getestet). Das Haushaltsbuch speichert
  wie auf der Website nur lokal (auf dem Gerät statt im Browser). Ratgeber,
  Methodik, Impressum und Datenschutz öffnen die Website-Seiten in der App.
- **Finanz-Check:** gleiches Quiz wie `finanz-check.html` — Fragen und Gewichte
  zieht das Sync-Skript direkt aus `assets/finanz-check.js` (für alle 96
  Antwortkombinationen gegen die Website getestet, identisch). In der App
  oben auf der Startseite; nach dem Quiz zeigt sie „Deine Empfehlungen" und
  springt im jeweiligen Vergleich direkt zum empfohlenen Anbieter.
- **Farben/Logo:** `mobile/components/theme.ts` spiegelt die Tokens aus
  `assets/style.css`; App-Icon = FP5-Logo.

**Automatische Prüfung:** `.github/workflows/mobile-app.yml` (GitHub Actions)
installiert die App-Pakete, prüft TypeScript und baut die Android-/iOS-Bundles
bei jedem Push, der `mobile/`, `data/` oder die von der App genutzten
Website-Skripte betrifft — Fehler erscheinen als ✗ am Commit, ohne die App
manuell testen zu müssen. Commits nur in `.github/` lösen ebenfalls keinen
Netlify-Deploy aus.

**Pflege:** Wer `data/*.json`, einen Disclosure-Text, einen `calc-disclaimer`,
die Finanz-Check-Fragen/-Gewichte oder die Rechner-Logik ändert, führt danach `cd mobile && npm run sync-data` aus
und committet `mobile/data/` mit (bei Rechner-Änderungen zusätzlich
`mobile/lib/calc.ts` angleichen, inkl. der 2026er Steuer-/SV-Werte im
Brutto-Netto-Rechner). Commits, die nur `mobile/` ändern, lösen dank `netlify.toml`
keinen Netlify-Deploy aus (spart Build-Minuten); `/mobile/*` wird nie als Teil
der Website ausgeliefert. Details und App-Setup: `mobile/README.md`.

## Deployment & Git-Workflow

- **Repo:** `github.com/parthibanthiru/finanzpal`, Branch `main` (umbenannt
  von `finanzpal-website`; GitHub leitet die alte URL per Redirect weiter).
  Enthält Website und App (`mobile/`). Lokal gibt es nur noch einen
  Checkout, `/home/claude/finanzpal` — editiert, committed und gepusht wird
  ausschließlich dort (siehe `CLAUDE.md` zur Vorgeschichte: ein früherer,
  separat benannter Checkout `finanzpal-website/` ist deshalb entfallen,
  weil dessen Git-Remote zwischen Turns immer wieder auf die alte URL
  zurückgesprungen war).
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
