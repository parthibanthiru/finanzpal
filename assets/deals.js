// Deals page: renders the current list of partner offers from
// data/deals.json (DE) / data/deals.en.json (EN) into #deals-app. The data
// file starts empty — this engine is the ready-to-go rendering side, so a
// deal only needs to be appended to the JSON (see the schema comment below)
// to appear here; no HTML edits required. Until then, an honest empty
// state is shown instead of fabricated content (per the site's
// data-integrity principle: no deal amount, rate or expiry is ever
// asserted here unless it's sitting in the JSON).
//
// Deal object shape (data/deals.json):
// {
//   "id": "unique-slug",
//   "kategorie": "Girokonto & Tagesgeld",   // display label(s), comma-joined like Finanztip
//   "anbieter": "Beispielbank",
//   "initials": "BB",
//   "color": "#163A66",                      // same avatar-circle pattern as broker-mark elsewhere
//   "titel": "200 € Startguthaben",           // short headline after "<Anbieter>: "
//   "angebot": "Ein Satz, der das Kernangebot nennt.",
//   "bedingungen": "Ausführlicher Text: Mindesteinzahlung, Mindestlaufzeit, Fristen, Ausschlüsse …",
//   "gueltigBis": "2026-12-31",               // ISO date, or null if unbefristet/unbekannt
//   "affiliateUrl": "https://…",
//   "quelle": "Geprüft am 2026-10-24 direkt beim Anbieter"  // shown in the expanded terms, optional
// }
(function () {
  var LANG = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0 ? 'en' : 'de';
  var app = document.getElementById('deals-app');
  if (!app) return;
  var PREFIX = app.getAttribute('data-prefix') || '';
  var SRC = PREFIX + 'data/deals' + (LANG === 'en' ? '.en' : '') + '.json';

  var STR = LANG === 'en' ? {
    loading: 'Loading deals …',
    cta: 'Go to deal',
    terms: 'Terms & conditions',
    validUntil: function (d) { return 'Valid until ' + d; },
    checked: function (d) { return 'Checked: ' + d; },
    emptyTitle: 'No deals listed yet',
    emptyBody: 'We only list offers we have checked ourselves, so this page starts empty rather than with filler. In the meantime, our independent comparisons are a good place to look for the best current conditions:',
    errorBody: 'Deals could not be loaded right now. Please try again later.'
  } : {
    loading: 'Lade Deals …',
    cta: 'Zum Deal',
    terms: 'Bedingungen',
    validUntil: function (d) { return 'Läuft bis zum ' + d; },
    checked: function (d) { return 'Geprüft: ' + d; },
    emptyTitle: 'Noch keine Deals gelistet',
    emptyBody: 'Wir listen nur Angebote, die wir selbst geprüft haben — deshalb startet diese Seite leer statt mit Lückenfüllern. Bis die ersten Deals stehen, findest du über unsere unabhängigen Vergleiche die aktuell besten Konditionen:',
    errorBody: 'Deals konnten gerade nicht geladen werden. Bitte versuche es später erneut.'
  };

  var EMPTY_LINKS = [
    { href: 'girokonto.html', label: LANG === 'en' ? 'Checking account' : 'Girokonto' },
    { href: 'tagesgeld.html', label: LANG === 'en' ? 'Instant savings account' : 'Tagesgeld' },
    { href: 'broker.html', label: LANG === 'en' ? 'Broker & custody' : 'Broker & Depot' },
    { href: 'kreditkarte.html', label: LANG === 'en' ? 'Credit cards' : 'Kreditkarte' }
  ];

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(LANG === 'en' ? 'en-IE' : 'de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function dealCardHtml(deal) {
    var validHtml = deal.gueltigBis
      ? '<p class="deal-valid">' + escapeHtml(STR.validUntil(formatDate(deal.gueltigBis))) + '</p>'
      : '';
    var quelleHtml = deal.quelle
      ? '<p class="deal-quelle">' + escapeHtml(STR.checked(deal.quelle)) + '</p>'
      : '';
    return (
      '<article class="deal-card">' +
      '<div class="deal-head">' +
      '<span class="deal-kat">' + escapeHtml(deal.kategorie || '') + '</span>' +
      '<span class="deal-status">' + (LANG === 'en' ? 'Active' : 'Aktiv') + '</span>' +
      '</div>' +
      '<div class="deal-body">' +
      '<div class="broker-mark" style="background:' + (deal.color || '#163A66') + ';">' + escapeHtml(deal.initials || '') + '</div>' +
      '<div class="deal-main">' +
      '<h3 class="deal-title">' + escapeHtml(deal.anbieter) + (deal.titel ? ': ' + escapeHtml(deal.titel) : '') + '</h3>' +
      validHtml +
      '<p class="deal-offer">' + escapeHtml(deal.angebot || '') + '</p>' +
      '</div>' +
      '</div>' +
      '<div class="deal-actions">' +
      '<a href="' + escapeHtml(deal.affiliateUrl || '#') + '" class="cta-btn2" rel="sponsored nofollow">' + STR.cta + '</a>' +
      '</div>' +
      (deal.bedingungen
        ? '<details class="deal-terms"><summary>' + STR.terms + '</summary><p>' + escapeHtml(deal.bedingungen) + '</p>' + quelleHtml + '</details>'
        : '') +
      '</article>'
    );
  }

  function emptyHtml() {
    var links = EMPTY_LINKS.map(function (l) {
      return '<a href="' + PREFIX + l.href + '" class="chip">' + escapeHtml(l.label) + '</a>';
    }).join('');
    return (
      '<div class="deal-empty">' +
      '<h3>' + STR.emptyTitle + '</h3>' +
      '<p>' + STR.emptyBody + '</p>' +
      '<div class="deal-empty-links">' + links + '</div>' +
      '</div>'
    );
  }

  app.innerHTML = '<p class="calc-disclaimer">' + STR.loading + '</p>';

  fetch(SRC)
    .then(function (r) { return r.json(); })
    .then(function (deals) {
      app.innerHTML = Array.isArray(deals) && deals.length
        ? deals.map(dealCardHtml).join('')
        : emptyHtml();
    })
    .catch(function () {
      app.innerHTML = '<p class="calc-disclaimer">' + STR.errorBody + '</p>';
    });
})();
