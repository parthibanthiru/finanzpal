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
      slug: 'privathaftpflicht',
      source: DIR + 'versicherungen.json',
      header: { beitrag: { de: 'Jahresbeitrag', en: 'Annual premium' }, deckung: { de: 'Deckungssumme', en: 'Cover amount' } },
      banner: { de: 'HUK24 — 34 €/Jahr, 100 Mio. € Deckungssumme', en: 'HUK24 — €34/year, €100m cover amount' },
      disclosure: {
        de: 'Werbung: Finanzpal erhält ggf. eine Provision, wenn du über einen Link eine Versicherung abschließt. Das beeinflusst unsere Bewertung nicht — Details siehe <a href="ueber-uns.html" style="text-decoration:underline;">Methodik</a>. Beiträge Stand Oktober 2026, Quelle: Anbieter-Websites und Vergleichsportale (u. a. finanzfluss.de); beim DEVK-Beitrag handelt es sich um den vom Anbieter beworbenen Einstiegspreis (ab 3,50 €/Monat). Unabhängiges Fachrating: Im Franke & Bornberg PHV-Rating 2026 (Single, veröffentlicht am 3.9.2026) erreichen HUK24, Adam Riese, VHV, AXA, Alte Leipziger und die Bayerische mit den gezeigten Tarifen die Bestnote FFF+; DEVK, HanseMerkur und Allianz gehören nicht zu den FFF+-Tarifen, für sie zeigen wir keine Sterne-Bewertung. Die übrigen Sterne-Bewertungen stammen aus Verbraucher-Vergleichsportalen und sind keine unabhängigen Fachratings. Bitte vor Abschluss aktuelle Konditionen beim Anbieter prüfen.',
        en: 'Advertisement: Finanzpal may receive a commission if you take out a policy via a link. This does not affect our rating — see <a href="ueber-uns.html" style="text-decoration:underline;">Methodology</a> for details. Premiums as of October 2026, sourced from provider websites and comparison portals (incl. finanzfluss.de); DEVK\'s premium is the provider\'s advertised starting price (from €3.50/month). Independent specialist rating: in Franke & Bornberg\'s 2026 PHV rating (single, published 3 Sep 2026), HUK24, Adam Riese, VHV, AXA, Alte Leipziger and die Bayerische reach the top grade FFF+ with the tariffs shown; DEVK, HanseMerkur and Allianz are not among the FFF+ tariffs, so we show no star rating for them. The remaining star ratings come from consumer comparison portals and are not independent specialist ratings. Please check current terms with the provider before taking out a policy.'
      }
    },
    {
      key: 'hausrat',
      slug: 'hausrat',
      source: DIR + 'hausrat.json',
      header: { beitrag: { de: 'Jahresbeitrag', en: 'Annual premium' }, deckung: { de: 'Deckung', en: 'Cover' } },
      banner: { de: 'InterRisk — 71 €/Jahr, Deckung individuell nach Wohnfläche', en: 'InterRisk — €71/year, cover scales with floor area' },
      disclosure: {
        de: 'Werbung: Finanzpal erhält ggf. eine Provision, wenn du über einen Link eine Versicherung abschließt. Das beeinflusst unsere Bewertung nicht. Beiträge basieren auf dem Modellhaushalt der Stiftung Warentest 2026 (40-jähriger Angestellter, 100 m²-Wohnung im 2. Stock, Jahreszahlung, Standort Ingolstadt) — deine eigenen Beiträge können je nach Wohnfläche, Wohnort und Ausstattung deutlich abweichen. InterRisks Bewertung ist durch das Franke & Bornberg/Handelsblatt-Rating 2026 ("exzellent") bestätigt; für HUK24, MVK und Schleswiger liegt uns kein unabhängig überprüfbares Rating vor, daher zeigen wir für sie keine Sterne-Bewertung.',
        en: 'Advertisement: Finanzpal may receive a commission if you take out a policy via a link. This does not affect our rating. Premiums are based on Stiftung Warentest\'s 2026 model household (40-year-old employee, 100 sqm second-floor apartment, annual payment, Ingolstadt) — your own premium can differ significantly by floor area, location and extras. InterRisk\'s rating is confirmed by the Franke & Bornberg/Handelsblatt 2026 rating ("exzellent"); for HUK24, MVK and Schleswiger we have no independently verifiable rating, so we show no star rating for them.'
      }
    },
    {
      key: 'bu',
      slug: 'berufsunfaehigkeit',
      source: DIR + 'bu.json',
      header: { beitrag: { de: 'Beitrag', en: 'Premium' }, deckung: { de: 'BU-Rente', en: 'Cover' } },
      banner: { de: 'Dialog — Top-Bewertung bei Franke & Bornberg, DFSI und IVFP (Gesamtscore 98/100)', en: 'Dialog — top-rated by Franke & Bornberg, DFSI and IVFP (combined score 98/100)' },
      disclosure: {
        de: 'Werbung: Finanzpal erhält ggf. eine Provision, wenn du über einen Link eine Versicherung abschließt. Das beeinflusst unsere Bewertung nicht. Der Beitrag einer Berufsunfähigkeitsversicherung hängt stark von Alter, Beruf, Gesundheit und gewünschter BU-Rente ab — ein pauschaler Vergleichsbeitrag wäre irreführend. Wir zeigen daher die Vertragsbedingungen-Bewertung von Franke & Bornberg, DFSI und IVFP (Stand 2026) statt eines Einzelpreises; für ein konkretes Angebot ist eine individuelle Anfrage beim Anbieter nötig.',
        en: 'Advertisement: Finanzpal may receive a commission if you take out a policy via a link. This does not affect our rating. A disability (BU) insurance premium depends heavily on age, occupation, health and the chosen monthly cover — a single comparison price would be misleading. We show the independent contract-terms rating from Franke & Bornberg, DFSI and IVFP (as of 2026) instead of a price; getting an actual quote requires an individual request to the provider.'
      }
    },
    {
      key: 'rechtsschutz',
      slug: 'rechtsschutz',
      source: DIR + 'rechtsschutz.json',
      header: { beitrag: { de: 'Jahresbeitrag*', en: 'Annual premium*' }, deckung: { de: 'Leistungsbereiche', en: 'Cover areas' } },
      banner: null,
      disclosure: {
        de: 'Werbung: Finanzpal erhält ggf. eine Provision, wenn du über einen Link eine Versicherung abschließt. Das beeinflusst unsere Bewertung nicht. *Der angegebene Beitrag ist eine Schätzung auf Basis des Modellhaushalts der Stiftung Warentest 2026 (40-jähriger Angestellter, Mieter, 2 Kinder, Pkw, Paket Privat + Beruf + Verkehr, 150 € Selbstbeteiligung — Gesamtspanne über alle getesteten Tarife: 251–978 €/Jahr) und ist nicht anbieterspezifisch verifiziert. Eine unabhängige Qualitätsbewertung der einzelnen Anbieter liegt uns noch nicht vor; echte, anbieterspezifische Angebote ergänzen wir vor Launch.',
        en: 'Advertisement: Finanzpal may receive a commission if you take out a policy via a link. This does not affect our rating. *The premium shown is an estimate based on Stiftung Warentest\'s 2026 model household (40-year-old employee, renter, 2 children, car, private + professional + traffic package, €150 deductible — overall range across all tested tariffs: €251–978/year) and is not verified per provider. We don\'t yet have an independent quality rating for the individual providers; real, provider-specific quotes will be added before launch.'
      }
    },
    {
      key: 'autoversicherung',
      slug: 'kfz',
      source: DIR + 'autoversicherung.json',
      header: { beitrag: { de: 'Beitrag', en: 'Premium' }, deckung: { de: 'Haftpflicht-Deckung', en: 'Liability cover' } },
      banner: { de: 'HUK24 — grobe Fahrlässigkeit eingeschlossen, Mallorca-Police inklusive', en: 'HUK24 — gross negligence included, Mallorca policy included' },
      disclosure: {
        de: 'Werbung: Finanzpal erhält ggf. eine Provision, wenn du über einen Link eine Versicherung abschließt. Das beeinflusst unsere Bewertung nicht. Der Beitrag einer Kfz-Versicherung hängt extrem stark von Fahrzeugtyp, Regional- und Typklasse, Schadenfreiheitsklasse, jährlicher Fahrleistung und weiteren individuellen Faktoren ab — ein pauschaler Vergleichsbeitrag wäre irreführend, die Unterschiede zwischen zwei Fahrern können mehrere hundert Euro pro Jahr betragen. Wir zeigen daher keinen Einzelpreis, sondern Leistungsmerkmale und die übliche Haftpflicht-Deckungssumme; für ein konkretes Angebot ist eine individuelle Anfrage beim Anbieter nötig. Angaben zu Leistungsmerkmalen laut Anbieter-Websites, Stand Oktober 2026 — eine unabhängige Testbewertung (z. B. von Stiftung Warentest) liegt uns für diese Anbieter noch nicht vor und wird ergänzt, sobald verfügbar.',
        en: 'Advertisement: Finanzpal may receive a commission if you take out a policy via a link. This does not affect our rating. A car insurance premium depends enormously on vehicle type, regional and type class, no-claims class, annual mileage and other individual factors — a single comparison price would be misleading, since the difference between two drivers can run to several hundred euros a year. We therefore show no single price, just coverage features and the typical liability cover level; getting an actual quote requires an individual request to the provider. Feature details are sourced from provider websites as of October 2026 — we don\'t yet have an independent test rating (e.g. from Stiftung Warentest) for these providers and will add one once available.'
      }
    }
  ];

  document.addEventListener('DOMContentLoaded', function () {
    var tabs = document.querySelectorAll('.type-tabs .type-tab');
    var table = document.querySelector('table.compare[data-type]');
    var disclosureEl = document.querySelector('.disclosure-note');
    var bannerEl = document.getElementById('best-pick-banner');
    var bannerTextEl = document.getElementById('best-pick-text');
    if (!tabs.length || !table || !window.FPCompare) return;

    function setBanner(cfg) {
      if (!bannerEl || !bannerTextEl) return;
      if (cfg.banner) {
        bannerTextEl.textContent = cfg.banner[LANG];
        bannerEl.hidden = false;
      } else {
        bannerEl.hidden = true;
      }
    }

    function activate(i, updateHash) {
      var cfg = TYPES[i];
      if (!cfg) return;
      tabs.forEach(function (t) { t.classList.remove('active'); });
      if (tabs[i]) tabs[i].classList.add('active');

      table.setAttribute('data-source', cfg.source);
      table.setAttribute('data-type', cfg.key);

      var ths = table.querySelectorAll('thead th');
      if (ths[1]) ths[1].textContent = cfg.header.beitrag[LANG];
      if (ths[2]) ths[2].textContent = cfg.header.deckung[LANG];

      if (disclosureEl) disclosureEl.innerHTML = cfg.disclosure[LANG];
      setBanner(cfg);

      window.FPCompare.renderTable(table);

      if (updateHash && window.history && history.replaceState) {
        history.replaceState(null, '', '#' + cfg.slug);
      }
    }

    tabs.forEach(function (tab, i) {
      tab.style.cursor = 'pointer';
      tab.addEventListener('click', function () {
        if (tab.classList.contains('active')) return;
        activate(i, true);
      });
    });

    // Deep-link support: versicherungen.html#hausrat, #berufsunfaehigkeit,
    // #rechtsschutz, #kfz (used by the "Versicherungen" nav dropdown so each
    // insurance type is a real, linkable URL instead of only reachable by
    // clicking a tab after landing on the default Privathaftpflicht view).
    function slugToIndex(hashSlug) {
      for (var i = 0; i < TYPES.length; i++) {
        if (TYPES[i].slug === hashSlug) return i;
      }
      return -1;
    }

    var initialIndex = slugToIndex((window.location.hash || '').replace('#', '').toLowerCase());
    if (initialIndex > 0) {
      activate(initialIndex, false);
    } else {
      // Default tab (Privathaftpflicht): compare.js's own DOMContentLoaded
      // listener already renders the table from its static data-source, so
      // calling the full activate() here would just re-fetch/re-render it a
      // second time — only the banner needs setting up for this tab.
      setBanner(TYPES[0]);
    }

    // A click from the Versicherungen nav dropdown to another #slug on this
    // same page (you're already on versicherungen.html, just a different
    // tab) is a same-document navigation — the browser only updates the
    // hash and fires "hashchange", it does not reload the page or re-run
    // the DOMContentLoaded listener above. Without this, switching tabs via
    // the nav (as opposed to clicking the in-page tab buttons) silently did
    // nothing once you'd already landed on a non-default tab.
    window.addEventListener('hashchange', function () {
      var hashSlug = (window.location.hash || '').replace('#', '').toLowerCase();
      var index = slugToIndex(hashSlug);
      // An empty/unrecognized hash (e.g. the nav's plain "versicherungen.html"
      // link, or the hash cleared some other way) falls back to Privathaftpflicht
      // rather than doing nothing.
      activate(index > -1 ? index : 0, false);
    });
  });
})();
