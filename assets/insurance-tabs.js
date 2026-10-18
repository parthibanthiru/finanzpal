// Makes the type-tabs on versicherungen.html switch between four insurance
// comparison tables (Privathaftpflicht / Hausrat / BU / Rechtsschutz), each
// backed by its own data/*.json file. Relies on window.FPCompare.renderTable
// from compare.js.
(function () {
  var LANG = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0 ? 'en' : 'de';
  var DIR = LANG === 'en' ? '../data/' : 'data/';

  var TYPES = [
    {
      key: 'versicherungen',
      source: DIR + 'versicherungen.json',
      header: { beitrag: { de: 'Jahresbeitrag', en: 'Annual premium' }, deckung: { de: 'Deckungssumme', en: 'Cover amount' } },
      disclosure: {
        de: 'Werbung: Finanzpal erhält ggf. eine Provision, wenn du über einen Link eine Versicherung abschließt. Das beeinflusst unsere Bewertung nicht — Details siehe <a href="ueber-uns.html" style="text-decoration:underline;">Methodik</a>. Beiträge Stand Oktober 2026, Quelle: Anbieter-Websites und finanzfluss.de. HUK24s Bewertung ist durch das Franke & Bornberg PHV-Rating 2026 (Single-Tarif FFF+, Note 0,5) bestätigt; die Bewertungen für DEVK, HanseMerkur und Allianz sind noch nicht unabhängig verifiziert. Der DEVK-Beitrag ist eine Schätzung und wird vor Launch durch ein echtes Angebot ersetzt — bitte vor Abschluss aktuelle Konditionen beim Anbieter prüfen.',
        en: 'Advertisement: Finanzpal may receive a commission if you take out a policy via a link. This does not affect our rating — see <a href="ueber-uns.html" style="text-decoration:underline;">Methodology</a> for details. Premiums as of October 2026, sourced from provider websites and finanzfluss.de. HUK24\'s rating is confirmed by Franke & Bornberg\'s 2026 PHV rating (single-person tariff, grade FFF+, 0.5); DEVK, HanseMerkur and Allianz\'s ratings are not yet independently verified. DEVK\'s premium is an estimate and will be replaced with a real quote before launch — please check current terms with the provider before taking out a policy.'
      }
    },
    {
      key: 'hausrat',
      source: DIR + 'hausrat.json',
      header: { beitrag: { de: 'Jahresbeitrag', en: 'Annual premium' }, deckung: { de: 'Deckung', en: 'Cover' } },
      disclosure: {
        de: 'Werbung: Finanzpal erhält ggf. eine Provision, wenn du über einen Link eine Versicherung abschließt. Das beeinflusst unsere Bewertung nicht. Beiträge basieren auf dem Modellhaushalt der Stiftung Warentest 2026 (40-jähriger Angestellter, 100 m²-Wohnung im 2. Stock, Jahreszahlung, Standort Ingolstadt) — deine eigenen Beiträge können je nach Wohnfläche, Wohnort und Ausstattung deutlich abweichen. InterRisks Bewertung ist durch das Franke & Bornberg/Handelsblatt-Rating 2026 ("exzellent") bestätigt; die Bewertungen für HUK24, MVK und Schleswiger sind noch nicht unabhängig verifiziert.',
        en: 'Advertisement: Finanzpal may receive a commission if you take out a policy via a link. This does not affect our rating. Premiums are based on Stiftung Warentest\'s 2026 model household (40-year-old employee, 100 sqm second-floor apartment, annual payment, Ingolstadt) — your own premium can differ significantly by floor area, location and extras. InterRisk\'s rating is confirmed by the Franke & Bornberg/Handelsblatt 2026 rating ("exzellent"); HUK24, MVK and Schleswiger\'s ratings are not yet independently verified.'
      }
    },
    {
      key: 'bu',
      source: DIR + 'bu.json',
      header: { beitrag: { de: 'Beitrag', en: 'Premium' }, deckung: { de: 'BU-Rente', en: 'Cover' } },
      disclosure: {
        de: 'Werbung: Finanzpal erhält ggf. eine Provision, wenn du über einen Link eine Versicherung abschließt. Das beeinflusst unsere Bewertung nicht. Der Beitrag einer Berufsunfähigkeitsversicherung hängt stark von Alter, Beruf, Gesundheit und gewünschter BU-Rente ab — ein pauschaler Vergleichsbeitrag wäre irreführend. Wir zeigen daher die Vertragsbedingungen-Bewertung von Franke & Bornberg, DFSI und IVFP (Stand 2026) statt eines Einzelpreises; für ein konkretes Angebot ist eine individuelle Anfrage beim Anbieter nötig.',
        en: 'Advertisement: Finanzpal may receive a commission if you take out a policy via a link. This does not affect our rating. A disability (BU) insurance premium depends heavily on age, occupation, health and the chosen monthly cover — a single comparison price would be misleading. We show the independent contract-terms rating from Franke & Bornberg, DFSI and IVFP (as of 2026) instead of a price; getting an actual quote requires an individual request to the provider.'
      }
    },
    {
      key: 'rechtsschutz',
      source: DIR + 'rechtsschutz.json',
      header: { beitrag: { de: 'Jahresbeitrag*', en: 'Annual premium*' }, deckung: { de: 'Leistungsbereiche', en: 'Cover areas' } },
      disclosure: {
        de: 'Werbung: Finanzpal erhält ggf. eine Provision, wenn du über einen Link eine Versicherung abschließt. Das beeinflusst unsere Bewertung nicht. *Der angegebene Beitrag ist eine Schätzung auf Basis des Modellhaushalts der Stiftung Warentest 2026 (40-jähriger Angestellter, Mieter, 2 Kinder, Pkw, Paket Privat + Beruf + Verkehr, 150 € Selbstbeteiligung — Gesamtspanne über alle getesteten Tarife: 251–978 €/Jahr) und ist nicht anbieterspezifisch verifiziert. Eine unabhängige Qualitätsbewertung der einzelnen Anbieter liegt uns noch nicht vor; echte, anbieterspezifische Angebote ergänzen wir vor Launch.',
        en: 'Advertisement: Finanzpal may receive a commission if you take out a policy via a link. This does not affect our rating. *The premium shown is an estimate based on Stiftung Warentest\'s 2026 model household (40-year-old employee, renter, 2 children, car, private + professional + traffic package, €150 deductible — overall range across all tested tariffs: €251–978/year) and is not verified per provider. We don\'t yet have an independent quality rating for the individual providers; real, provider-specific quotes will be added before launch.'
      }
    }
  ];

  document.addEventListener('DOMContentLoaded', function () {
    var tabs = document.querySelectorAll('.type-tabs .type-tab');
    var table = document.querySelector('table.compare[data-type]');
    var disclosureEl = document.querySelector('.disclosure-note');
    if (!tabs.length || !table || !window.FPCompare) return;

    tabs.forEach(function (tab, i) {
      tab.style.cursor = 'pointer';
      tab.addEventListener('click', function () {
        if (tab.classList.contains('active')) return;
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');

        var cfg = TYPES[i];
        if (!cfg) return;
        table.setAttribute('data-source', cfg.source);
        table.setAttribute('data-type', cfg.key);

        var ths = table.querySelectorAll('thead th');
        if (ths[1]) ths[1].textContent = cfg.header.beitrag[LANG];
        if (ths[2]) ths[2].textContent = cfg.header.deckung[LANG];

        if (disclosureEl) disclosureEl.innerHTML = cfg.disclosure[LANG];

        window.FPCompare.renderTable(table);
      });
    });
  });
})();
