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
| `broker.html` (+ 3 Detailseiten + 1 "vs"-Seite) | Broker- & Depot-Vergleich in einer Seite: Depot-/Ordergebühr, ETF-Sparpläne, Mindestsparrate, Guthabenzins, Rating — kartenbasiert (ehemals zwei getrennte Seiten `broker.html`/`depot.html`, seit Oktober 2026 zusammengeführt); `broker-trade-republic-vs-scalable-capital.html` stellt zwei Broker direkt gegenüber (Pilot, siehe „Kopf-an-Kopf-Seiten" unten) |
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
| `deals.html` | Liste geprüfter Partner-Angebote/Aktionen (`data/deals.json`), siehe „Deals" unten — startet bewusst leer |
| `altersvorsorgedepot.html`, `fruehstart-rente.html` | 2027-Reform-Tracker, siehe „Altersvorsorgedepot & Frühstart-Rente" unten — bewusst ohne Anbieter-Vergleichstabelle, da noch kein Anbieter zertifiziert/final |

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
Icon + Akzentfarbe, siehe unten), filterbar über die Themen-Chips
(`assets/ratgeber-filter.js`, verlinkbar z. B. `ratgeber.html#absichern`); aktuell 10 Artikel über 6 Kategorien
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
├── *.html                      38 Seiten auf Deutsch (siehe Seitenübersicht oben)
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
│   ├── steuerprogramm.json / .en.json    Steuerprogramm-Vergleichsdaten
│   └── deals.json / .en.json             Partner-Deals (`deals.html`); startet als `[]`,
│                                           siehe „Deals" unten für das Schema
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
│   ├── ratgeber-filter.js          Themen-Filter (Chips) auf ratgeber.html, Filter im URL-Hash (#investieren)
│   ├── kredite-filter.js           Filter-Chips + Schnellrechner auf kredite.html (hört auf das
│   │                                "fpcompare:rendered"-Event von compare.js)
│   ├── kk-skeleton.js              Lade-Skeleton für Kreditkarten-/Depot-Karten
│   ├── compare-bar.js              Fixierte „Vergleichen"-Leiste (Mehrfachauswahl → Vergleich)
│   ├── sparplanrechner.js          Logik für Sparplanrechner & Zinseszinsrechner
│   ├── kreditrechner.js            Annuitätenformel für den Kreditrechner
│   ├── baufinanzierungsrechner.js  Annuitätendarlehen-Logik für Baufinanzierung
│   ├── nettolohnrechner.js         SV-Beiträge + §32a-EStG-Tarif + Soli (Steuerklasse I)
│   ├── haushaltsbuch.js            localStorage-Budget-Tracker
│   ├── altersvorsorge-rechner.js   Rentenlücken-Logik
│   └── deals.js                    Rendert data/deals.json in #deals-app; zeigt ehrlichen
│                                     Leerzustand statt erfundener Angebote
├── tools/                          Wartungsskripte für seitenweite Änderungen
│   ├── build_nav.py                 Regeneriert die Top-Nav identisch in allen 80 Dateien
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
├── .github/workflows/push-notify.yml App-Mitteilungen bei neuen Anbietern/Ratgebern (mobile/data/)
├── .github/workflows/mobile-web-preview.yml App als Web-Vorschau (ohne Konto) → Branch `web-preview`
├── netlify.toml                    Kein Deploy bei Commits nur in mobile/ oder .github/; /mobile/* nie ausliefern
└── README.md                       Diese Datei
```

## Navigation

Die Top-Nav ist über alle Seiten identisch und gruppiert die Einzel-Links in
Dropdowns, damit auch Seiten ohne eigenen Nav-Slot (z. B. Girokonto,
Baufinanzierung, alle Rechner) von oben erreichbar sind:
**Konten ▾** (Finanz-Check, Girokonto, Tagesgeld, Kreditkarte) ·
**Broker ▾** (Broker & Depot, Kinderdepot, ETF-Suche) ·
**Kredite ▾** (Ratenkredit, Baufinanzierung) ·
**Versicherungen ▾** (Privathaftpflicht, Hausrat, Berufsunfähigkeit,
Rechtsschutz, Kfz) · **Rechner ▾** (alle 7 Rechner) · **Ratgeber** ·
**Mehr ▾** (Steuerprogramm, Deals, Über uns). Öffnet per Klick und (auf
Geräten mit Maus) per Hover, klappt auf Mobile zu einer flachen,
eingerückten Liste unter dem Hamburger-Menü auf. Neue Unterseite ergänzen =
neuen `<a>`-Eintrag im passenden Dropdown-Panel in jeder betroffenen
`.html`-Datei (es gibt kein serverseitiges Nav-Template) — dafür
`tools/build_nav.py` ausführen statt von Hand zu editieren, siehe
`tools/README.md`.

**Nav: Mehr-Dropdown (2026-10-24).** Die Bar war mit 9 Top-Level-Einträgen
(5 davon Dropdowns, 22 Unterpunkte insgesamt) zu voll — `Rechner` allein
trug 7 Links. Statt die fünf Vergleichs-Dropdowns anzutasten (sie sind der
Haupt-Traffic-Treiber), wurden die drei Einzel-Links mit dem geringsten
eigenständigen Gewicht — **Steuerprogramm**, **Deals** und **Über uns** —
in ein neues `Mehr ▾`-Dropdown zusammengefasst. **Ratgeber** bleibt als
eigener Link stehen (Content-Hub, kein Long-Tail-Eintrag). Ergebnis: 9 → 7
Top-Level-Einträge, nichts sitzt mehr als einen Klick tief als vorher.
Umgesetzt rein in `tools/build_nav.py` (`mehr` als neuer Dropdown-Slot in
`SLOT_ORDER`/`DROPDOWN_SLOTS`, `DE_PANELS["mehr"]`/`EN_PANELS["mehr"]`,
`FILE_TO_KEY`-Einträge der drei Seiten umgehängt) und per
`python3 tools/build_nav.py` über alle 76 Seiten neu generiert — die
Footer-Spalten („Vergleiche" etc.) sind davon nicht betroffen, nur der
Header. Eine größere Restrukturierung (ein einziges „Vergleiche"-Mega-Menü
für alle fünf Produkt-Dropdowns) wurde als nächster, größerer Schritt
besprochen, aber bewusst zurückgestellt.

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

### Anbieter-Logos (`assets/logos/`, `"logo"`-Feld)

Anbieter in den Vergleichskarten/-tabellen zeigen standardmäßig ein farbiges
Initialen-Badge (`item.color` + `item.initials`). Für Anbieter, bei denen ein
echtes Logo vorliegt, überschreibt ein optionales `"logo"`-Feld im JSON-Eintrag
(z. B. `"logo": "assets/logos/trade-republic.svg"`) dieses Badge durch das
echte Logo — Fallback auf das Initialen-Badge bleibt erhalten, wenn `"logo"`
fehlt, sodass nicht-logoisierte Anbieter unverändert weiter funktionieren.

- Logo-Dateien liegen als SVG unter `assets/logos/<anbieter-slug>.svg`
  (bevorzugt aus offiziellen Presse-/Brand-Kits, Dateiname = Anbieter-Slug).
- Gerendert wird das Logo in einem `.logo-chip` (weißer Hintergrund,
  `object-fit: contain`, `assets/style.css`), damit auch Logos ohne eigenen
  Hintergrund (z. B. schwarzes Wordmark auf transparent) in Light **und**
  Dark Theme lesbar bleiben.
- Implementiert in den Kartenseiten (`assets/girokonto-compare.js`,
  `assets/broker-compare.js`, `assets/kreditkarte-compare.js`,
  `assets/kinderdepot-compare.js`) sowie in der gemeinsamen Tabellen-Renderer
  `brokerCell()` in `assets/compare.js` (Tagesgeld/Kredite/Versicherungen).
  Jede Stelle prüft `item.logo` zuerst und fällt sonst auf das bestehende
  Badge zurück.
- EN-Seiten lösen den Pfad über das vorhandene `PREFIX`-Muster auf
  (`../` vor dem `logo`-Pfad), analog zu den anderen Asset-Pfaden im Projekt.
- Aktuell hinterlegt (15 Anbieter): Trade Republic, Scalable Capital,
  Consorsbank, comdirect, flatex, DKB, Smartbroker+, finanzen.net Zero,
  justTRADE, ING, C24, N26, Openbank, 1822direkt und norisbank — jeweils in
  allen Kategorien, in denen der Anbieter vorkommt (Girokonto, Broker,
  Kreditkarte, Kinderdepot, Tagesgeld, Kredite). Zwei Logo-Dateien mussten
  angepasst werden, da sie nicht wie geliefert auf einem weißen `.logo-chip`
  funktioniert hätten: `c24.svg` bekam ein passendes Hintergrund-Rechteck
  (Original war komplett weiß, also auf Weiß unsichtbar) und
  `comdirect.svg`s `fill="currentColor"` wurde durch eine feste Hex-Farbe
  ersetzt (ein per `<img>` eingebundenes SVG hat keinen CSS-Kontext, aus dem
  `currentColor` einen Wert ziehen könnte). Die übrigen ~73 Anbieter über
  alle Kategorien zeigen weiterhin das Initialen-Badge, bis echte
  Logo-Dateien nachgereicht werden.

### Vergleichskarten-Layout: ein verschmolzener Badge-Stat-Strip (`.cc-stats`/`.cc-stat`)

`broker-compare.js`, `girokonto-compare.js`, `kreditkarte-compare.js` und
`kinderdepot-compare.js` rendern alle dieselbe Karten-Struktur
(`.kk-card` → `.cc-badges` → `.cc-body` → … → `.cc-cta-col`). Eine erste
Version fügte eine separate Badge-Reihe (`.cc-claims`) über dem Stat-Panel
ein, um die wichtigsten Kennzahlen hervorzuheben — das führte aber dazu,
dass jede Zahl 2–3x auf der Karte auftauchte (Badge + Stat + teils Bullet).
Das wurde entfernt und durch einen einzigen Streifen ersetzt, in dem jede
Kennzahl genau einmal erscheint:

- **`.cc-stats`/`.cc-stat`** — ersetzt sowohl das alte schmale
  `.cc-facts`-Panel (rechte Spalte) als auch die separate Claims-Badge-Reihe
  durch EINEN horizontalen Streifen aus gleich breiten, einheitlich gefüllten
  Badge-Zellen (`flex: 1 1 110px`, `background: var(--tag-bg)`, `border:
  var(--green)` — derselbe „Pill"-Look wie vorher nur die Claims hatten,
  jetzt aber direkt auf den Stat-Zellen mit Label + Wert). Pro Seite 2–4
  Zellen je nach verfügbaren Feldern (z. B. Broker/Kinderdepot zusätzlich
  eine ETF-Sparpläne-Zelle, sofern `item.etfSparplaeneAnzahl` vorhanden ist).
  `.cc-stat .k`/`.v` sind `display: block` + `overflow: hidden;
  text-overflow: ellipsis` (wichtig: ohne `display: block` greift
  `text-overflow` bei einem `<span>` nicht — führte in einer Zwischenversion
  zu horizontalem Overflow auf dem 390px-Mobile-Viewport, von
  `audit_quick.py` korrekt erkannt und seitdem gefixt).
- **Einheitlich 4 Zellen pro Karte, über alle vier Seiten:**
  - Broker: Depotgebühr, Ordergebühr, Mind. Sparrate, ETF-Sparpläne
  - Girokonto: Kontoführung, Dispozins, Bargeldabhebung, Fremdwährung
    (fehlt `fremdwaehrung` bei einem Anbieter: Zelle zeigt „—")
  - Kreditkarte: Jahresgebühr, Zahlung, Bargeldabhebung, Netzwerk — die
    vorher separate große `.cc-price`-Preisanzeige im CTA-Bereich wurde
    entfernt (Klasse jetzt ungenutzt, aus `style.css` entfernt) und die
    Jahresgebühr stattdessen als Stat-Zelle geführt, analog zu Broker; die
    „Netzwerk"-Zeile im aufklappbaren Detail-Panel wurde entfernt, da jetzt
    bereits in der Stat-Zelle sichtbar
  - Kinderdepot: Depotgebühr, Mind. Sparrate, ETF-Sparpläne, Elterndepot
    (nötig/nicht nötig — `item.parentDepotRequired`); `ageLimitText` blieb
    bewusst NUR Bullet/Detail-Panel-Feld, da die Werte oft ganze Sätze sind
    („Konto geht mit dem 18. Geburtstag automatisch über …") und als
    einzeilige Badge nicht lesbar wären
  - Steuerprogramm ist die Ausnahme mit nur 2 Zellen statt 4 (Preis,
    Plattform) — siehe unten, warum
- **Bullets entschlackt:** Bullet-Punkte, die exakt denselben Wert wie eine
  Stat-Zelle wiederholt haben, wurden aus `bulletsFor()` entfernt bzw.
  umformuliert (z. B. `STR.mindestsparrate(...)` bei Broker/Kinderdepot
  entfernt; der ETF-Bullet nennt die Zahl nicht mehr; bei Girokonto wurden
  die Abhebung-/Fremdwährung-Bullets entfernt, da jetzt Stat-Zellen).
  Übrig bleiben nur Bullets mit echtem Zusatznutzen (Caveats, Intervalle,
  Verwahrentgelt, Besonderheiten).
- **`.cc-cta-col`** ist ein eigenständiger, volle-Breite-Block statt eines
  Flex-Items in `.cc-body` — bei Kreditkarte jetzt nur noch Sternebewertung
  + CTA-Button (kein separates Preisfeld mehr, s. o.).
- **`steuer-compare.js` (Steuersoftware-Vergleich) seit 2026-10-25 auf
  `.cc-stats`/`.cc-stat` umgestellt, aber mit nur 2 Zellen statt 4:**
  nutzte bis dahin das ältere, schmale `.cc-facts`/`.cc-fact`-Spaltenlayout
  (Preis + Plattform, rechts neben den Bullets). Jetzt dieselbe
  `.cc-stats`-Badge-Optik wie die anderen vier Kategorien, aber weiterhin
  nur 2 Zellen (Preis, Plattform) — ein Zwischenschritt hatte testweise
  auch Datenübernahme (`item.vorjahresImport`) und Zahlung bei Abgabe
  (`item.zahlungErstBeiAbgabe`) als 3./4. Zelle ergänzt, das wurde aber auf
  Wunsch wieder auf 2 zurückgenommen; beide Felder stehen deshalb wieder
  ausschließlich als Bullets (`vorjahresImportText`/`zahlungText`), wie
  vor dem Umbau. `item.belegerfassung` war nie Teil der Stat-Zellen (bei
  9 von 10 Anbietern `null`, als Badge kaum informativ) und bleibt
  ebenfalls Bullet. Die dadurch ungenutzten `.cc-facts`/`.cc-fact`-CSS-
  Regeln wurden aus `style.css` entfernt (keine andere Seite nutzt sie).
- `compare-bar.js` (injiziert die „Vergleichen"-Checkbox in `.cc-cta-col`)
  und der Vergleichs-Modal (liest `.cc-name`/`.cc-bullets` aus) funktionieren
  unverändert weiter, da beide Klassen nur per `querySelector` gesucht
  werden, unabhängig von ihrer Position im DOM.

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

**Score zurückhalten (`scoreHold`):** Ist bei einem Anbieter eine
Score-Eingangsgröße (Gebühr, Zins …) noch nicht bestätigt, bekommt der Eintrag
in `data/*.json` ein Feld `"scoreHold": "<Grund>"` — `tools/compute_scores.py`
vergibt dann keinen Score (und entfernt einen vorhandenen, DE und EN), statt
eine glatte Zahl auf unbestätigten Daten zu bauen. Die Seiten und die App
zeigen ohne Score einfach kein Score-Badge. Feld entfernen, sobald die Daten
bestätigt sind, und das Skript erneut laufen lassen. Aktuell: die
Consorsbank-Kreditkarte (siehe offene Punkte).

**Stand Oktober 2026 — Kategorien Girokonto, Kredite, Kreditkarte, Tagesgeld,
Kinderdepot, Broker/Depot, Versicherungen (nur Privathaftpflicht) &
Steuerprogramm.**
Zusätzlich zu den Rohdaten zeigen `girokonto.html`/
`en/girokonto.html`, `kreditkarte.html`/`en/kreditkarte.html` und
`kinderdepot.html`/`en/kinderdepot.html` (alle drei Karten-Layout, jeweils
eigenes Vergleichs-JS) sowie `kredite.html`/`en/kredite.html`,
`tagesgeld.html`/`en/tagesgeld.html` und der Privathaftpflicht-Reiter von
`versicherungen.html`/`en/versicherungen.html` (Tabellen-Layout,
`assets/compare.js`) einen Finanzpal-Score-Badge pro Zeile
(`.fp-score-badge`):
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
  - **Broker & Depot (neu, 2026-10-24):** Depotführung 30 % ·
    ETF-Sparplan-Angebot 25 % · Guthabenzins 25 % · Mindestsparrate 20 %.
    Zwei auf der Seite ebenfalls gezeigte Felder fließen bewusst **nicht**
    in den Score ein: die Ordergebühr, weil mehrere Anbieter dafür selbst
    widersprüchliche Angaben nennen (justtrade, dkb-broker), und die
    bestehende Sterne-Bewertung (`rating`/`ratingStars`) neben dem Namen
    — die ist eine bislang undokumentierte redaktionelle Einschätzung
    (siehe „Bekannte offene Punkte" #3) und soll durch den Score ergänzt,
    nicht mit ihm vermischt werden. `broker-compare.js` bekam dafür
    dieselben `scoreTooltip`/`scoreLabels`/`scoreBreakdownRows`/
    `scoreBadgeHtml`-Bausteine wie die anderen vier Kategorien;
    `broker.html`/`en/broker.html` laden jetzt zusätzlich
    `assets/score-popover.js`, und ihr „Wie wir bewerten"-Link (siehe
    unten) zeigt entsprechend wieder auf `#finanzpal-score` statt
    `#methodik`.
  - **Versicherungen — nur Privathaftpflicht (neu, 2026-10-24):**
    Jahresbeitrag 35 % · Rating-Bestätigung 40 % · Deckungssumme 25 %.
    `versicherungen.html`/`en/` bündelt fünf Versicherungs-Reiter
    (Privathaftpflicht/Hausrat/BU/Rechtsschutz/Kfz, siehe
    `assets/insurance-tabs.js`) über ein gemeinsames Tabellen-Layout
    (`assets/compare.js`, `data-type` wechselt pro Reiter) — bewusst nur
    der erste Reiter (`data/versicherungen.json`, `data-type="versicherungen"`)
    bekommt einen Score. Die anderen vier bleiben unbewertet, weil ihre
    Daten die oben beschriebene Mindestqualität nicht erfüllen: Hausrat hat
    bei 6 von 10 Anbietern gar keinen recherchierten Beitrag ("Prämie ...
    nicht separat recherchiert"), BU/Rechtsschutz/Kfz haben überhaupt
    keinen parsebaren Einzelpreis (freier Text wie "individuell,
    altersabhängig" oder "ab 299 €/Jahr*"). Die Badge-Beschränkung passiert
    nicht durch Sonderlogik, sondern einfach dadurch, dass nur
    `data/versicherungen.json`/`.en.json` ein `score`-Feld bekommen haben —
    `scoreBadgeHtml()` zeigt ohnehin nichts an, wenn `item.score` fehlt, und
    die anderen vier Reiter teilen sich zwar denselben Renderer
    (`renderers.hausrat = renderers.versicherungen` usw. in `compare.js`),
    aber eben ohne `score`-Daten. Rating-Bestätigung zählt bewusst mit dem
    höchsten Gewicht: das vorhandene `rating`-Feld ist bereits das
    disclosure-dokumentierte Franke & Bornberg PHV-Rating-2026-FFF+-Flag
    (`null` = nicht in der FFF+-Gruppe, kein Werturteil "schlecht"). Getsafe
    bekommt `"scoreHold"` (kein pauschaler Jahresbeitrag, volldigitale
    Tarifermittlung in der App — analog zur Consorsbank-Kreditkarte).
    `versicherungen.html`/`en/` laden jetzt zusätzlich
    `assets/score-popover.js`; ihr Methodik-Link bleibt bei "Wie wir
    vergleichen"/`#methodik`, weil die Seite nur zu einem Fünftel bewertet
    ist, nicht auf "Wie wir bewerten"/`#finanzpal-score` umgestellt.
  - **Steuerprogramm (neu, 2026-10-24):** Preis 40 % ·
    Zielgruppenabdeckung 30 % · Plattformabdeckung 20 % · Klarheit zum
    ELSTER-Zertifikat 10 % — eigene Gewichtung, weicht vom ersten Entwurf im
    Projektdokument ab (dort 35/30/20/10 = nur 95 %, hier auf 100 % korrigiert
    durch Preis 40 %). Zielgruppenabdeckung/Plattformabdeckung zählen nur
    Felder, die der Anbieter ausdrücklich mit `true` bestätigt — `null`
    (nicht recherchiert) zählt wie `false`, nie wie bestätigt. Bei Taxman ist
    `preisSort` `null` (Anbieter nennt keinen bezifferten Preis); dafür fällt
    der Preis-Faktor für diesen einen Eintrag weg und die übrigen drei werden
    auf 100 % neu gewichtet — dafür wurde `compute_item_score()` in
    `compute_scores.py` generisch erweitert (eine Faktorfunktion darf jetzt
    `None` statt einer Zahl zurückgeben; wirkt sich auf die bestehenden sechs
    Kategorien nicht aus, deren Funktionen nie `None` liefern).
    `assets/steuer-compare.js` bekam dieselben `scoreBadgeHtml()`/
    `scoreTooltip()`/`scoreBreakdownRows()`-Bausteine wie die anderen
    Karten-Layouts; `steuerprogramm.html`/`en/` laden jetzt zusätzlich
    `assets/score-popover.js`.
  - **Bewusst (noch) nicht bewertet: Baufinanzierung.** Das Projektdokument
    skizziert dafür einen Reichweite/Beratungstiefe-Rubrik ohne Preisfaktor —
    beim Blick in `data/baufinanzierung.json` selbst (2026-10-24) zeigt sich
    aber, dass 5 von 10 Vermittlern ihre Partnerbanken-Anzahl auf der eigenen
    Seite gar nicht beziffern, und mehrere `standorteText`-Werte reine
    Online-Portale ohne eigenes Filialnetz beschreiben — das ließe sich nicht
    fair gegen filialbasierte Vermittler in eine "Standorte"-Kennzahl
    pressen, ohne ein anderes Geschäftsmodell fälschlich als schlechter
    darzustellen. `baufinanzierung` ist deshalb (noch) nicht in `RUBRICS`
    registriert — siehe Kommentar dort.

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
  kinderdepot broker versicherungen steuerprogramm` (oder ohne Argument für
  alle registrierten Kategorien). Danach, weil `data/*.json` sich ändert:
  `cd mobile && npm run sync-data` nicht vergessen (siehe „Mobile App"
  unten).
- Jedes `score`-Objekt enthält `value`, `band`, ein `breakdown` je Teilkriterium
  (im Badge-Tooltip sichtbar) und `computedFrom` (Monat der Berechnung) — bewusst
  offengelegt statt einer nackten Zahl.
- Das Badge-Markup selbst sitzt an vier Stellen, je nach Layout der
  Zielseite: `scoreBadgeHtml()`/`scoreTooltip()` in
  `assets/girokonto-compare.js`, `assets/kreditkarte-compare.js` und
  `assets/kinderdepot-compare.js` (jeweils Karten, Kreditkarte zusätzlich
  mit einer Tabellen-Ansicht im selben Skript) sowie dieselben Funktionen
  generisch in `assets/compare.js` (Tabellen, geteilt zwischen Kredite,
  Tagesgeld und den fünf Versicherungs-Reitern — Badge erscheint nur, wenn
  `item.score` in den Daten steht, aktuell nur bei `data/versicherungen.json`
  (Privathaftpflicht); `SCORE_FACTOR_LABELS.versicherungen` zeigt das Muster
  für die Tooltip-Labels einer neuen Tabellen-Kategorie).
- Neue Kategorie bewerten = Rubrik in `compute_scores.py` ergänzen (siehe
  `GIROKONTO_RUBRIC`/`KREDITE_RUBRIC`/`KREDITKARTE_RUBRIC`/`TAGESGELD_RUBRIC`/
  `KINDERDEPOT_RUBRIC`/`PRIVATHAFTPFLICHT_RUBRIC`/`STEUERPROGRAMM_RUBRIC` als
  Vorlage — Letztere auch als Beispiel für eine Faktorfunktion, die bei
  fehlendem Eingangswert `None` statt eines geschätzten Werts zurückgibt),
  Badge-Rendering an der richtigen Stelle
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
  Eingebunden auf allen Seiten mit bewerteten Kategorien (`girokonto`,
  `kredite`, `tagesgeld`, `kreditkarte`, `kinderdepot`, `broker`,
  `versicherungen`, je DE/EN) direkt nach dem jeweiligen Vergleichs-Skript.
  Neue bewertete Kategorie = Script-Tag dort ebenfalls ergänzen. Der
  `title`-Tooltip bleibt zusätzlich bestehen (Progressive Enhancement, kein
  Funktionsverlust ohne JS/mit altem Browser).

## Affiliate-Disclosure: Konsistenz & Lesbarkeit

**Seit 2026-10-24.** Audit aller drei Disclosure-Stellen (`.disclosure-note`
unter Vergleichstabellen/-karten, `.fine` neben dem Hero-CTA und `.sc-fine`
in der Sidebar der Broker-Detailseiten):
- **Wortlaut-Inkonsistenz behoben.** Auf allen drei Broker-Detailseiten
  (Trade Republic, Scalable Capital, Consorsbank, je DE/EN) sagte der
  Hero-CTA-Hinweis etwas anderes als der Sidebar-Hinweis auf derselben
  Seite (DE: „Finanzpal erhält ggf. eine Provision" vs. „ggf. Provision
  für Finanzpal"; EN: „Finanzpal may receive a commission" vs. „possible
  commission for Finanzpal") — jetzt überall identischer Wortlaut. Auf den
  EN-Vergleichsseiten gab es zusätzlich einen Advertising/Advertisement-
  Split (3 von 7 Seiten sagten „Advertising: … may earn a commission",
  die übrigen „Advertisement: … may receive a commission") — auf
  „Advertisement: … may receive a commission" vereinheitlicht.
- **Lesbarkeit erhöht**, ohne aus dezentem Kleingedrucktem eine laute
  Warnung zu machen: `.disclosure-note` 12,5px → 13px, `.fine` 11,5px →
  12px, `.sc-fine` 11px → 11,5px; das jeweils erste Wort
  („Werbung"/„Advertisement") ist jetzt fett und in der normalen
  Textfarbe (`--ink` statt `--ink-soft`) gesetzt, der Rest bleibt
  gedämpft — der Hinweis soll als ehrliche Kennzeichnung auffallen,
  nicht wie Rechtstext wirken, aber auch nicht wie eine Warnmeldung.
- Neue Disclosure-Stelle ergänzen = erstes Wort in `<strong>` setzen,
  identischen Wortlaut wie die anderen Vorkommen auf derselben Seite
  verwenden (`.disclosure-note strong, .fine strong, .sc-fine strong` in
  `style.css` übernimmt die Farbe automatisch).

## CTA-Buttons: Copy-Konsistenz & Screenreader-Labels

**Seit 2026-10-24.** Audit der Anbieter-CTA-Buttons auf allen Vergleichsseiten
(nicht der grünen `.best-rate-banner`-Buttons im Hero — die bleiben bewusst
`href="#"`, siehe „Vor dem Launch unbedingt erledigen"):
- **Copy vereinheitlicht.** Vorher uneinheitlich: 4 von 5 Render-Skripten
  nutzten DE „Zum Anbieter" + EN „View offer" (inhaltlich nicht dieselbe
  Aussage), `broker-compare.js` nutzte als einziges „Zum Angebot"/„View
  offer". Jetzt überall **„Zum Anbieter" / „View provider"** — ehrlicher
  als „Angebot"/„offer", weil der Link tatsächlich nur zur Anbieter-Seite
  führt, nicht zu einer zugesicherten Sonderkonditionen-Seite.
- **Screenreader-Label pro Button.** Eine Liste mit 10+ Karten/Zeilen hatte
  vorher 10+ identische Links „Zum Anbieter" ohne Unterscheidung — für
  Screenreader-Nutzer, die per Linkliste statt visuell navigieren, nicht
  unterscheidbar. Jeder CTA-Button bekommt jetzt zusätzlich
  `aria-label="Zum Anbieter: <Anbietername>"` (sichtbarer Text bleibt
  knapp „Zum Anbieter"). Betroffen: `assets/compare.js` (Kredite/
  Tagesgeld/Versicherungen), `girokonto-compare.js`,
  `kinderdepot-compare.js`, `kreditkarte-compare.js` (Karten- **und**
  Tabellenansicht), `broker-compare.js`. Neue Kategorie mit Anbieter-CTA =
  `ctaAria(name)`-Funktion im jeweiligen `STR`-Objekt ergänzen und ins
  `aria-label` des CTA-Links einbauen, nach demselben Muster.

## "Wie wir bewerten"-Links (Methodik-Transparenz)

**Seit 2026-10-23, auf allen 8 Vergleichsseiten (DE+EN = 16 Seiten;
Steuerprogramm kam am 2026-10-24 mit seinem eigenen Score dazu).** Ein
kleiner, immer sichtbarer Link direkt über der Ergebnisliste — nicht erst
im Footer oder hinter einem Klick auf den Score-Badge versteckt, sondern
genau da, wo jemand kurz vor dem Klick auf eine CTA steht:
- Kartenlayout-Seiten (`girokonto.html`, `kreditkarte.html`,
  `kinderdepot.html`, `broker.html`, `steuerprogramm.html`, je DE/EN): in
  der `.kk-toolbar`-Zeile,
  direkt neben der Ergebnis-Anzahl (`<span class="kk-toolbar-left">…</span>`
  gruppiert beide, damit das bestehende `justify-content: space-between`
  der Toolbar nicht durch ein drittes Flex-Kind verzerrt wird).
- Tabellenlayout-Seiten (`kredite.html`, `tagesgeld.html`,
  `versicherungen.html`, je DE/EN): rechtsbündig in der `.filters`-Zeile
  über der Tabelle (`.filters .method-link { margin-left: auto; }`).

Zusätzlich verlinkt der bestehende Affiliate-Disclosure-Absatz
(`.disclosure-note`) unter jeder Tabelle/Kartenliste jetzt ebenfalls auf
die Methodik — zwei Seiten (`girokonto.html`, `kinderdepot.html`) hatten
dort bisher gar keinen Link, die übrigen fünf verlinkten nur pauschal auf
`ueber-uns.html` statt auf den passenden Abschnitt.

Beide Link-Typen zeigen, je nach Kategorie, auf einen von zwei Ankern in
`ueber-uns.html`/`en/ueber-uns.html`:
- **`#finanzpal-score`** für die Kategorien mit Finanzpal-Score
  (Girokonto, Kredite, Tagesgeld, Kreditkarte, Kinderdepot, Broker & Depot).
- **`#methodik`** (auf dem bestehenden Abschnitt „Unsere Methodik je
  Kategorie") für `versicherungen.html`, weil die Seite nur in ihrem ersten
  Reiter (Privathaftpflicht) einen Score hat — die vier anderen Reiter
  (Hausrat, BU, Rechtsschutz, Kfz) haben keinen. Ein Pro-Seiten-Link kann
  nicht pro Reiter unterscheiden, daher bleibt die generische „vergleichen"-
  Formulierung, solange nicht alle fünf Reiter bewertet sind.

Neue CSS-Klassen in `assets/style.css`: `.method-link` (das Link-Styling
selbst), `.kk-toolbar-left` (Wrapper für Kartenlayout-Seiten),
`.filters .method-link` (rechtsbündig für Tabellenlayout-Seiten). Neue
Kategorie mit Score = denselben Link in Toolbar/Filters und
Disclosure-Note ergänzen, Anchor je nachdem ob die Kategorie schon einen
Score hat.

**Polish-Pass (gleicher Tag):** `ⓘ`-Icon vor dem Linktext (`<span
class="mi">`) für bessere Scanbarkeit neben Chips/Select; eigener
`:focus-visible`-Ring auf `.method-link` (vorher nur `:hover`, Tastatur-
Nutzer sahen keinen Fokus-Indikator); Linktext für Kategorien ohne Score
auf „Wie wir vergleichen →" geändert statt „Wie wir bewerten →" —
Letzteres würde einen Score suggerieren, den es dort (bewusst) noch nicht
gibt.

**2026-10-24:** Broker & Depot bekam einen Finanzpal-Score (siehe
„Finanzpal-Score" oben) und wechselte dadurch von „Wie wir vergleichen →"
/ `#methodik` zurück auf „Wie wir bewerten →" / `#finanzpal-score`, in
Toolbar-Link und Disclosure-Note gleichermaßen.

**2026-10-24 (später am selben Tag):** Versicherungen bekam ebenfalls einen
Finanzpal-Score, aber **nur für den Privathaftpflicht-Reiter** (siehe
„Finanzpal-Score" oben) — Hausrat, BU, Rechtsschutz und Kfz bleiben ohne
Score. Da der Methodik-Link pro Seite (nicht pro Reiter) gilt und vier von
fünf Reitern weiterhin unbewertet sind, bleibt `versicherungen.html`/`en/`
bei „Wie wir vergleichen →" / `#methodik`, statt auf „Wie wir bewerten →"
umzustellen — eine Umstellung würde für Besucher auf den vier unbewerteten
Reitern einen Score suggerieren, den es dort nicht gibt.

## Kopf-an-Kopf-Seiten ("vs"-Seiten)

**Pilot, seit 2026-10-23 — eine einzige Seite, bewusst nicht auf andere
Paare/Kategorien ausgeweitet, bis das mit dem Nutzer abgestimmt ist.**
`broker-trade-republic-vs-scalable-capital.html` / `en/...` stellen zwei
Broker direkt gegenüber (3-spaltige Vergleichstabelle, zwei CTAs, zwei
Vorteils-Spalten, Verdict-Absatz, FAQ) statt sie nur in der großen
`broker.html`-Übersicht nebeneinander zu zeigen. Technisch eine normale
Detailseite, keine neue Infrastruktur:
- Wiederverwendet bestehende Komponenten der Broker-Detailseiten
  (`.broker-hero`, `.hero-id`, `.broker-mark`, `table.fees`, `.pros-cons`/
  `.pc-col`, `.side-card`, `.alt-list`) statt ein eigenes Layout zu bauen.
  Neu in `assets/style.css`: `.dual-cta-row` (zwei CTA-Buttons
  nebeneinander), `table.fees td.num.win` (grün/fett für den jeweils
  besseren Wert einer Zeile), `.pc-col.alt` (petrolfarbene Überschrift für
  eine Vorteils-Spalte, die — anders als `.pc-col.con` — keine Nachteile
  zeigt, sondern die Pluspunkte des *anderen* Anbieters im direkten
  Vergleich; `.con` nur verwenden, wenn die Spalte tatsächlich Nachteile
  auflistet), `.fine` (vorher nur innerhalb `.hero-cta` gültig, jetzt
  global nutzbar).
  Folgt dem Daten-Integritäts-Prinzip: keine fiktiven Sterne-Bewertungen in
  der Vergleichstabelle, bestehende Unsicherheiten der Quelldaten
  (schwankende ETF-Sparplan-Zahl, Guthabenzins 2,25 %/2,50 %) als
  Fußnote übernommen statt einer scheinbar exakten Zahl.
- Eingebunden ins übrige Site-Gerüst wie jede andere Seite: Eintrag in
  `tools/build_nav.py` (`FILE_TO_KEY`, Gruppe „Broker"), zwei neue
  Such-Einträge in `assets/nav.js`, zwei neue `<url>`-Blöcke in
  `sitemap.xml`, Querverlinkung („⇄ vs. …") im `.alt-list` beider
  Einzeltestseiten (`broker-trade-republic.html`, `broker-scalable-capital.html`,
  je DE/EN).
- Bevor weitere Paare oder Kategorien (Girokonto, Kreditkarte, …) nach
  diesem Muster gebaut werden: Rücksprache mit dem Nutzer, da das deutlich
  mehr Seiten/Pflegeaufwand bedeutet — diese eine Seite ist absichtlich nur
  ein Testballon.

## Finanz-Check: Design-Polish (2026-10-24)

`finanz-check.html`/`en/` (das kombinierte 6-Fragen-Quiz über alle vier
Konten-Kategorien, `assets/finanz-check.js`) bekam einen visuellen Polish-
Pass, ohne Fragen, Gewichte oder die zugrunde liegenden Live-Daten
anzufassen:
- **Schritt-Punkte (`#fc-step-dots`)** neben dem bestehenden dünnen
  Fortschrittsbalken — ein Punkt pro Frage, aktueller Schritt vergrößert,
  erledigte Schritte eingefärbt. Macht auf einen Blick klar, wie viele
  Fragen noch kommen, was der reine Prozent-Balken allein nicht zeigt.
- **Verlaufsfarbener Akzentbalken** oben auf der Quiz-Box
  (`.fc-quiz-box::before`, grün-deep → gold) sowie ein eigener, pro
  Kategorie eingefärbter Akzentstreifen oben auf jeder Ergebniskarte
  (`--fc-accent` als Inline-Custom-Property, über
  `CATEGORY_ACCENT` in `finanz-check.js` gesetzt — nutzt ausschließlich
  bestehende Design-Tokens: `--green-deep`/`--gold`/`--red-soft`/`--green`
  für Girokonto/Depot/Kreditkarte/Tagesgeld, keine neuen Farben, daher ohne
  Zusatzaufwand dark-mode-fest).
- **Kategorie-Icons** (kleine Inline-SVG-Strichzeichnungen,
  `CATEGORY_ICON` in `finanz-check.js`) vor dem Kategorienamen auf jeder
  Ergebniskarte, in einem getönten Kreis in der jeweiligen Akzentfarbe.
- **Lettered Options (A/B/C …)**: jede Antwort-Schaltfläche bekommt einen
  kleinen Kreis mit Buchstabe davor (`.fc-opt-letter`) — rein dekorativ,
  macht die Optionsliste scanbarer.
- **Kurze Auswahl-Rückmeldung:** ein Klick markiert die gewählte Antwort
  sichtbar (`.is-selected`), bevor nach 180 ms zur nächsten Frage
  gewechselt wird, statt sofort umzuschalten.
- **Fade/Slide-Übergang** (`.fc-panel` + `@keyframes fcFadeIn`) beim
  Wechsel zwischen Fragen und zum Ergebnis.

Fragen, Gewichte und die vier zugrunde liegenden `data/*.json`-Dateien
sind unverändert — daher kein `npm run sync-data`-Datendrift (geprüft:
`mobile/data/` blieb nach dem Sync identisch).

### Ergebnis-Ansicht: Vergleichstabelle statt Kartenraster (2026-10-24)

Direkt im Anschluss an den Polish-Pass wurde die Ergebnis-Ansicht noch
einmal neu gebaut, auf Basis eines Nutzer-Reviews mehrerer Mockups
(Story Reveal, Dashboard, Report Card, Vergleichstabelle) — gewählt wurde
die **Vergleichstabelle**:
- Das bisherige 2×2-Kartenraster (`.fc-results-grid`/`.fc-result-card`)
  ist einer einzeiligen Tabelle pro Kategorie gewichen
  (`.fc-cmp-table`, neu in `assets/style.css`), eingebettet im
  seitenweiten `<section class="table-scroll">`-Wrapper, den auch die
  übrigen Vergleichstabellen der Seite (z. B. `kredite.html`) für
  horizontales Scrollen auf schmalen Viewports nutzen
  (`.fc-cmp-table { min-width: 640px; }`).
- Spalten: Kategorie (Icon + Name, `.fc-cmp-cat`, akzentfarben wie zuvor
  über `CATEGORY_ACCENT`), Anbieter (`.fc-cmp-name`), die drei
  Kernfakten aus `factRows(cat, item)` (unverändert wiederverwendet) und
  eine CTA-Spalte mit „Zum Anbieter"-Button plus Link zum
  vollständigen Einzelvergleich.
- Die „Warum diese Wahl?"-Begründungsliste aus dem Polish-Pass
  (`reasonsFor(cat, itemId)`) wurde wieder entfernt — die Tabellenform
  ist bewusst „effizient und informationsdicht statt dekorativ"; die
  zugrunde liegende `.quiz-reasons`-CSS-Klasse bleibt unangetastet, da
  sie weiterhin vom unabhängigen `assets/broker-quiz.js`-Feature genutzt
  wird.
- Die Ergebnis-Box bekommt beim Anzeigen der Tabelle die Modifier-Klasse
  `.fc-quiz-box.is-result` (880 px statt der 560 px breiten Fragen-Box),
  damit die Tabelle genug Platz hat, ohne die schmale, zentrierte
  Frage-für-Frage-Ansicht zu verbreitern.
- Entwickelt anhand eines Vorab-Mockups im Claude-Design-Canvas
  (Artboard „09-ComparisonTable"), das zusammen mit den drei
  nicht gewählten Alternativen zu Review-Zwecken erstellt wurde.
- Fragen, Gewichte und Daten weiterhin unverändert — kein
  `npm run sync-data`-Datendrift (geprüft).

## Bekannte offene Punkte (bewusste Entscheidungen, nicht vergessen)

1. **Consorsbank-Kreditkarte: Kartenbezeichnung und Konditionen prüfen.**
   Unser Eintrag „Consorsbank Visa Karte" (0 €, 0 % Fremdwährung) ließ sich
   nicht bestätigen: Laut kreditkarte24.de (Stand 17.10.2026) ist die
   kostenlose Kreditkarte der Consorsbank die „Visa Gold Light"
   (Charge-Karte), die kostenlose Visa Debit kostet außerhalb der Eurozone
   2,10 %, und Finanzflusss Bewertung (4,1) bezieht sich auf die
   kostenpflichtige Visa Gold (108 €/Jahr). Die Sterne-Bewertung ist
   entfernt (`rating: null`), die Bedingung weist auf die offene Prüfung hin;
   vor Launch auf consorsbank.de verifizieren und den Eintrag korrigieren.
2. **Alle `affiliateUrl`-Felder in `data/*.json` sind noch `"#"`.** Noch keine
   echten Partnerlinks (siehe Launch-Liste unten).
3. **Herkunft der Broker-Ratings (★, z. B. 4,3 / 5) ist nicht dokumentiert.**
   Die erfundenen Leserbewertungen und Bewertungszahlen („312 Bewertungen")
   auf den Broker-Detailseiten wurden am 23.10.2026 entfernt; die Sterne-
   Ratings sind seitdem ehrlich als „Finanzpal-Einschätzung" bzw.
   „Redaktionelle Einschätzung von Finanzpal" beschriftet. Vor dem Launch
   klären, worauf sie beruhen — dokumentieren (Methodik auf `ueber-uns.html`)
   oder durch den Finanzpal-Score ersetzen. **Teilweise erledigt
   (2026-10-24):** Broker & Depot hat jetzt einen Finanzpal-Score als
   offengelegte Alternative dazu (siehe „Finanzpal-Score" oben); die
   Sterne-Bewertung selbst steht aber weiterhin unverändert daneben — ob
   sie ganz entfernt, dokumentiert oder dauerhaft parallel zum Score
   gezeigt wird, ist noch offen.
4. **Kredite-Schnellrechner und Filter-Chips waren rein dekorativ (behoben
   2026-10-25).** `kredite.html`/`en/` zeigte eine statische Vorschau des
   Schnellrechners (Werte als `<div>`, kein Klick-Handler) und die drei
   Filter-Chips waren `<span>`-Elemente ohne Funktion. Jetzt:
   - **Schnellrechner:** echte `<select>`-Felder (Betrag 1.000–100.000 €,
     Laufzeit 12–120 Monate, Zweck nur informativ) + echter Button
     („Zinsen anzeigen"/„Show rates"). `assets/compare.js` berechnet beim
     Rendern pro Zeile `data-amount-min/-max`/`data-term-min/-max` aus den
     bereits veröffentlichten Bereichsangaben (Regex-Parsing von z. B.
     „1.000 – 75.000 €"/„€1,000 – 75,000" — keine neuen/erfundenen Zahlen)
     und feuert danach ein `fpcompare:rendered`-Event auf die `<table>`.
     Das neue `assets/kredite-filter.js` hört darauf, markiert beim Klick
     passende Zeilen (`tr.calc-match`, `box-shadow: inset 3px 0 0 …` statt
     `border-left`, um die Spaltenbreite nicht zu beeinflussen — siehe die
     Overflow-Lehre im Abschnitt „Vergleichskarten-Layout" oben) und zeigt
     eine Ergebniszeile unter dem Rechner.
   - **Filter-Chips:** wurden zu echten `<button data-filter>` (gleiches
     Muster wie `ratgeber.html`/`assets/ratgeber-filter.js`). Zwei der drei
     ursprünglichen Chips sind jetzt funktional:
     „Ohne Bearbeitungsgebühr" (`data-bearbeitungsgebuehr-frei="1"`,
     einheitlich für alle 10 Anbieter gesetzt — gestützt auf das
     BGH-Urteil vom 13.05.2014, Az. XI ZR 405/12 und XI ZR 170/13, das
     Bearbeitungsentgelte in Verbraucherdarlehen für unzulässig erklärt
     hat; Zitat im Disclosure-Text unter der Tabelle) und „Sondertilgung
     kostenlos" (`data-sondertilgung-frei`, per Keyword-Match `/kostenlos/i`
     bzw. `/free/i` aus dem bereits veröffentlichten `sondertilgung`-Text
     abgeleitet — keine neue Datenquelle).
   - **Bewusst nicht übernommen:** der dritte ursprüngliche Chip
     „Sofortzusage möglich" wurde entfernt statt funktional nachgebaut.
     Eine Recherche je Anbieter ergab nur für die ING eine verifizierbare
     Aussage („Kreditzusage sofort"); für die übrigen neun Anbieter ließ
     sich das weder bestätigen noch verneinen. Eine erfundene oder geratene
     Pro-Anbieter-Markierung hätte dem Data-Integrity-Prinzip widersprochen,
     daher ist der Chip ersatzlos entfernt statt mit ungesicherten Daten
     wieder "funktionsfähig" gemacht zu werden.
   - **Bewusst nicht mitbehoben:** `tagesgeld.html` und
     `versicherungen.html`/`en/` haben denselben nicht-funktionalen
     `.filters .chip`-Markup-Pattern wie `kredite.html` vor diesem Fix, sind
     aber vom Nutzer nicht als defekt gemeldet worden und wurden daher
     absichtlich nicht angefasst (kein Scope-Creep auf ungemeldete Seiten).
     Betroffen bei Bedarf: gleiches Muster wie oben, neues
     `assets/tagesgeld-filter.js`/`versicherungen-filter.js` nötig, da
     `kredite-filter.js` fest an `table.compare[data-type="kredite"]` und
     dessen Kredite-spezifische `data-*`-Attribute gebunden ist.
5. **Versicherungen-Reiter: Finanzpal-Score nur für Privathaftpflicht.**
   `versicherungen.html`/`en/` zeigt fünf Reiter über ein gemeinsames
   Tabellen-Layout; seit 2026-10-24 hat nur der erste (Privathaftpflicht)
   einen Finanzpal-Score. Hausrat, BU, Rechtsschutz und Kfz bleiben bewusst
   unbewertet, weil ihre Rohdaten die Mindestqualität nicht erfüllen (siehe
   „Finanzpal-Score" oben für Details je Reiter). Sollte sich die
   Datenqualität für einen dieser Reiter verbessern (z. B. Hausrat-Prämien
   vollständig recherchiert statt „nicht separat recherchiert"), ist eine
   eigene Rubrik dafür zu ergänzen — nicht einfach die bestehende
   `PRIVATHAFTPFLICHT_RUBRIC` auf andere Felder anwenden.

**Am 23.10.2026 geklärt** (Quellen im jeweiligen Disclosure-Text bzw. in der
Commit-Nachricht):
- *DEVK-Beitrag (PHV)* ist keine Schätzung mehr, sondern als beworbener
  Einstiegspreis des Anbieters gekennzeichnet („ab 3,50 €/Monat").
- *PHV-Ratings:* Franke & Bornberg PHV-Rating 2026 (Single, 3.9.2026) —
  HUK24, Adam Riese, VHV, AXA, Alte Leipziger und die Bayerische FFF+ (im
  Feld `leistungen` vermerkt); DEVK, HanseMerkur und Allianz nicht unter den
  FFF+-Tarifen → Sterne entfernt.
- *Hausrat:* für HUK24, MVK und Schleswiger keine überprüfbare Quelle für die
  Sterne gefunden → entfernt (InterRisk bleibt, F&B/Handelsblatt bestätigt).
- *Scalable Capital:* laut Anbieter-Factsheet (07/2026) gibt es keine
  Depotgebühr; die 4,99 €/Monat sind die optionale Prime+-Order-Flatrate.
  `brokerDepotfee` und die Detailseite (DE/EN: Fakten, Gebührentabelle,
  Fazit, Vor-/Nachteile, FAQ) entsprechend korrigiert; Guthabenzins mit
  Hinweis auf die abweichenden Quellen (2,50 % vs. 2,60 %, variabel).

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

## Haushaltsbuch: Schnellerfassung fester Kosten (2026-10-24)

`haushaltsbuch.html`/`en/` (`assets/haushaltsbuch.js`) bekam einen neuen
Abschnitt **„Schnellerfassung: Feste Kosten"** oberhalb des bestehenden
Buchungsformulars:
- Eine Reihe von Chip-Buttons (`.chip`, bereits bestehende Komponente,
  z. B. aus dem FAQ-Bereich bekannt) für die typischen wiederkehrenden
  Fixkosten eines Haushalts: Miete, Strom, Heizung/Gas, Wasser,
  Rundfunkbeitrag, Internet, Handy/SIM-Karte, Versicherung, Streaming-Abo,
  Fitnessstudio, ÖPNV-Ticket (`FIXKOSTEN` in `assets/haushaltsbuch.js`).
- Ein Klick trägt Typ (Ausgabe), Kategorie und Beschreibung automatisch ins
  Formular ein und fokussiert das Betragsfeld — es muss nur noch der
  konkrete Betrag ergänzt werden, statt jede Fixkosten-Buchung von Hand zu
  betiteln.
- Neue Kategorie **„Internet & Handy"** (`kommunikation`) in `KATEGORIEN`,
  da Internet/Handy inhaltlich nicht zu „Wohnen" passen; rein additiv, alte
  gespeicherte Buchungen mit den bisherigen Kategorie-Ids bleiben gültig.
- Keine Beträge sind vorbelegt — passend zum Daten-Integritätsprinzip
  trägt niemand außer der Nutzer selbst einen Euro-Betrag ein.
- Gespiegelt in der Mobile-App: `mobile/lib/haushaltsbuch.ts` (neue
  Kategorie + `FIXKOSTEN`/`fixkostenLabel`), `mobile/app/(app)/rechner/haushaltsbuch.tsx`
  (gleiche Chip-Reihe oberhalb von „Neue Buchung") sowie
  `mobile/lib/strings/de.ts`/`en.ts` (`calc.haushalt.categories.kommunikation`,
  `calc.haushalt.fixkosten`).

## Deals (2026-10-24)

Neue Seite `deals.html`/`en/` (eigener Nav-Eintrag „Deals" zwischen
Steuerprogramm und Rechner, eigene Zeile in der Footer-„Vergleiche"-Spalte,
im Site-Suchindex, in `sitemap.xml`) — modelliert nach Finanztips
`/deals/`-Seite: eine Liste geprüfter Kontoprämien, Zinsaktionen und
Rabatte von Partnern, je Karte mit Kategorie-Label, Status-Badge,
Anbieter-Avatar, Kurzangebot, Gültigkeitsdatum (falls bekannt) und
aufklappbaren Bedingungen inkl. Prüfdatum.

- **`data/deals.json` / `.en.json`** ist das einzige, was gepflegt werden
  muss, um einen Deal zu ergänzen — `assets/deals.js` rendert daraus die
  Karten, keine HTML-Änderung nötig. Schema (ein Objekt pro Deal, als
  Kommentar am Kopf von `assets/deals.js` dokumentiert): `id`, `kategorie`,
  `anbieter`, `initials`, `color`, `titel`, `angebot`, `bedingungen`,
  `gueltigBis` (ISO-Datum oder `null`), `affiliateUrl`, `quelle`
  (Prüfdatum/-ort, erscheint in den aufgeklappten Bedingungen).
- **Bewusst mit `[]` gestartet, nicht mit Platzhalter-Deals.** Dem
  Daten-Integritätsprinzip folgend wird hier keine Prämien-/Zins-Zahl
  gezeigt, die wir nicht direkt beim Anbieter nachvollziehen können —
  bis echte, geprüfte Deals vorliegen, zeigt die Seite einen ehrlichen
  Leerzustand (`.deal-empty`) mit Links zu den bestehenden Vergleichen
  statt erfundener Angebote.
- Kein Zinssatz, keine Prämien-Zahl und keine Frist wird je ohne eigenes
  Feld im JSON behauptet — ein neuer Deal-Eintrag muss alle Angaben, die
  er zeigt, auch im JSON mitbringen (kein hartkodierter Text in
  `deals.js`/`deals.html`).
- Eigene `disclosure-note` wie auf den Vergleichsseiten plus eigener
  `FOOTER_LEGAL_OVERRIDES`-Eintrag in `tools/build_nav.py` (die generische
  „… ein Konto eröffnest"-Formulierung passt nicht für jeden Deal-Typ).
- `tools/build_nav.py`: `FILE_TO_KEY["deals.html"]`, `deals.html` als erste
  Zeile in `FOOTER_COMPARE_DE`/`_EN` — nach jeder künftigen Nav-Änderung
  läuft `python3 tools/build_nav.py` wie gewohnt über alle (jetzt 76)
  Seiten. (Ursprünglich als eigener Top-Level-Nav-Slot eingeführt; seit dem
  Nav: Mehr-Dropdown vom 2026-10-24, siehe Abschnitt „Navigation" oben,
  sitzt Deals im Header unter `Mehr ▾` statt als eigener Link — die
  Footer-„Vergleiche"-Spalte war davon nicht betroffen.)

## Altersvorsorgedepot & Frühstart-Rente (2026-10-24)

Zwei neue Tracker-Seiten für die 2027er Rentenreform:
`altersvorsorgedepot.html`/`en/` und `fruehstart-rente.html`/`en/`. Beide
folgen bewusst nicht dem normalen Vergleichsseiten-Muster (Karten +
`data/*.json`), weil es für keines der beiden Produkte am Stand 2026-10-24
eine vergleichbare Anbieter-Tabelle geben kann:

- **Altersvorsorgedepot:** Anbieter können erst ab 1. Januar 2027 starten;
  das Bundeszentralamt für Steuern (BZSt) hatte zum 6. Oktober 2026 noch
  kein einziges Depot zertifiziert. Statt einer Vergleichstabelle mit
  Zahlen, die wir nicht verifizieren können, zeigt die Seite Status
  (0 zertifizierte Anbieter), die Förderung laut Koalitionsvereinbarung
  (bis 540 €/Jahr Grundzulage + 300 €/Jahr Kinderzulage) und eine Liste,
  welche Anbieter laut eigenen Angaben bereits unverbindliche
  Vormerkungen annehmen (`.deal-list`/`.deal-card`-Muster wie auf
  `deals.html`, aber hier direkt im HTML statt aus einem JSON, da es sich
  um Status-Text statt Vergleichszahlen handelt).
- **Frühstart-Rente:** Gesetz vom Bundestag am 16. Oktober 2026
  beschlossen, Bundesrat-Zustimmung laut Berichterstattung noch offen —
  10 €/Monat pro Kind (Geburtsjahrgang ab 2020) vom Staat, zusätzlich
  freiwillige Einzahlungen bis 6.840 €/Jahr möglich. Die Seite erklärt den
  Unterschied zwischen eigenem Vertrag („Standarddepot", ca. 1 %/Jahr
  Kostendeckel) und der automatischen Auffanglösung (Sondervermögen des
  Bundes ab 1. Januar 2028, Bundesbank-verwaltet) und verlinkt auf
  `altersvorsorgedepot.html`, statt eine eigene Anbieter-Tabelle für ein
  noch nicht existierendes Produkt zu erfinden.
- Beide Seiten haben bewusst **keinen eigenen Top-Level-Nav-Eintrag**
  (Entscheidung analog zu Deals vor dessen Mehr-Dropdown-Zeit) —
  erreichbar über `tools/build_nav.py`s `FOOTER_COMPARE_DE`/`_EN`
  (Footer-Spalte „Vergleiche", direkt nach „Deals"), den Site-Suchindex
  (`assets/nav.js`), `sitemap.xml` sowie Verlinkungen von
  `altersvorsorge-rechner.html` und dem bestehenden Ratgeber-Artikel
  `ratgeber-altersvorsorgedepot.html` aus.
- `ratgeber-altersvorsorgedepot.html`/`en/` war veraltet (alte, vor der
  finalen Gesetzgebung geschätzte Förderbeträge) und wurde im selben Zug
  auf die seit 30. Mai 2026 geltenden Zahlen (Altersvorsorgereformgesetz,
  BGBl. 2026 I Nr. 156) korrigiert, inkl. Riester-Bestandsschutz/
  freiwilliger-Wechsel-Hinweis und Verlinkung auf beide neuen Tracker-Seiten.
- Keine `data/*.json`-Dateien und kein Mobile-Sync nötig — beide Seiten
  sind handgeschriebener Status-Text ohne tabellarische Vergleichsdaten,
  fallen also nicht unter einen der Mobile-Sync-Trigger in den
  Arbeitsregeln oben.
- `tools/build_nav.py`: `FILE_TO_KEY["altersvorsorgedepot.html"]` und
  `["fruehstart-rente.html"]` jeweils `(None, None)` (kein aktiver
  Nav-Highlight), mit Kommentar zur Begründung; nach jeder künftigen
  Nav-Änderung läuft `python3 tools/build_nav.py` wie gewohnt über alle
  (jetzt 80) Seiten.

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
- **Deutsch und Englisch:** Die App gibt es komplett in beiden Sprachen (folgt
  der Handysprache, umstellbar unter Profil → Sprache). Englische Vergleichsdaten,
  Disclosures, Rechner-Hinweise, Quiz-Texte und Ratgeber-Titel kommen aus
  `data/*.en.json` und den `en/`-Seiten; Links öffnen die englischen Seiten.
- **Finanz-Check:** gleiches Quiz wie `finanz-check.html` — Fragen und Gewichte
  zieht das Sync-Skript direkt aus `assets/finanz-check.js` (für alle 96
  Antwortkombinationen gegen die Website getestet, identisch). In der App
  oben auf der Startseite; nach dem Quiz zeigt sie „Deine Empfehlungen" und
  springt im jeweiligen Vergleich direkt zum empfohlenen Anbieter. Wie die
  Website (seit der Tabellen-Ansicht) zeigt die App keine „Warum diese Empfehlung"-Gründe mehr.
- **Suche, ETF-Suche, Score-Aufschlüsselung:** Suchfeld auf der Startseite
  (Anbieter in allen Vergleichen, ETFs per Name/ISIN, Rechner und Ratgeber);
  ETF-Suche mit den Filtern von `etf-suche.html` (Logik aus `assets/etf-search.js`
  portiert, gegen die Website getestet); Tipp auf den Finanzpal-Score zeigt die
  Faktoren mit den Labels der Website (`STR.scoreLabels` der Vergleichsskripte bzw.
  `SCORE_FACTOR_LABELS` in `compare.js`, per Sync nach `mobile/data/score-labels.json`).
- **Mitteilungen (Push):** Opt-in unter Profil. Kommt durch ein Update ein neuer
  Anbieter in `data/*.json` oder ein neuer Ratgeber in `ratgeber.html` dazu (und ist
  per Sync in `mobile/data/` gelandet), schickt `.github/workflows/push-notify.yml`
  eine kurze Mitteilung (nur Namen, keine Zahlen; geänderte Konditionen lösen nichts
  aus). Braucht einmalig Supabase-Tabelle, EAS-Projekt und zwei GitHub-Secrets —
  bis dahin Probelauf ohne Versand. **Offener Punkt:** noch nicht eingerichtet
  (siehe `mobile/README.md`, Abschnitt 7).
- **Überweisen:** am 24.10.2026 in eine eigene App ausgelagert („Money Transfer",
  Arbeitstitel; eigenes GitHub-Repo, eigenes Design, eigene Supabase-Konten). Nicht mehr
  Teil dieser App.
- **Web-Vorschau:** Die App lässt sich ohne Handy und ohne Konto im Browser ansehen
  (Vorschau-Modus, `EXPO_PUBLIC_PREVIEW=1`). Der Build landet bei jedem Push in
  `mobile/` auf dem Branch `web-preview` (nur gebaute Dateien, statisch hostbar);
  eine private claude.ai-Seite „Finanzpal App-Vorschau" zeigt eine Kopie.
- **Farben/Logo:** `mobile/components/theme.ts` spiegelt die Tokens aus
  `assets/style.css`; App-Icon = FP5-Logo.

**Automatische Prüfung:** `.github/workflows/mobile-app.yml` (GitHub Actions)
installiert die App-Pakete, prüft TypeScript, lässt die Screen-Tests laufen
(jeder Screen auf DE/EN, hell/dunkel, plus Klick-Abläufe) und baut die Android-/iOS-Bundles
bei jedem Push, der `mobile/`, `data/` oder die von der App genutzten
Website-Skripte betrifft — Fehler erscheinen als ✗ am Commit, ohne die App
manuell testen zu müssen. Commits nur in `.github/` lösen ebenfalls keinen
Netlify-Deploy aus.

**Pflege:** Wer `data/*.json` / `*.en.json`, einen Disclosure-Text (DE oder EN),
einen `calc-disclaimer`, die Finanz-Check-Fragen/-Gewichte, die Score-Faktor-Labels
(`*-compare.js` `STR.scoreLabels`, `compare.js` `SCORE_FACTOR_LABELS`), die Ratgeber-Artikelliste
(`ratgeber.html` / `en/ratgeber.html`) oder die Rechner-Logik ändert, führt danach `cd mobile && npm run sync-data` aus
und committet `mobile/data/` mit (bei Rechner-Änderungen zusätzlich
`mobile/lib/calc.ts` angleichen, inkl. der 2026er Steuer-/SV-Werte im
Brutto-Netto-Rechner; bei Änderungen an `assets/etf-search.js` bzw. an der Bewertung in
`finanz-check.js` die Ports `mobile/lib/etf.ts` bzw. `mobile/lib/finanzCheck.ts`). Commits, die nur `mobile/` ändern, lösen dank `netlify.toml`
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
- Robo-Advisor-Vergleich (im ursprünglichen Launch-Plan als Investing-
  Kategorie vorgesehen, bisher nicht gebaut).
- Eigener Festgeld-Vergleich (bisher nur Tagesgeld; Festgeld kommt nur im
  Ratgeber-Artikel vor).
- BU-Lücke-Rechner (Bedarfsermittlung vor der BU-Vergleichstabelle).
- Mieten-oder-Kaufen-Rechner.
- Checklisten-Artikel (z. B. "Broker wechseln", "Depotübertrag").
- Mehr Ratgeber-Artikel; neue Artikel brauchen zusätzlich zur `.guide-card`
  im `.rat-grid` auch einen Eintrag in der Icon/Farb-Zuordnung (siehe oben).
- Finanzpal-Score auf die verbleibenden Kategorien ausweiten, sobald deren
  Rohdaten die Mindestqualität erfüllen (Baufinanzierung, Hausrat/BU/
  Rechtsschutz/Kfz — siehe „Bekannte offene Punkte" oben und „Finanzpal-
  Score" für den aktuellen Stand; das System selbst ist seit 2026-10-24
  gebaut und dokumentiert, nicht mehr nur Konzept).
