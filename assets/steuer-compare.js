// Steuerprogramm comparison: curated list of tax-filing software, filterable
// by target group, platform, submission-based payment and price. Self-
// contained (own data fetch + render), reusing the kk-/cc- card and filter
// primitives shared with the Kreditkarte page.
(function () {
  var LANG = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0 ? 'en' : 'de';

  var STR = {
    de: {
      loading: 'Lade Vergleichsdaten …',
      error: 'Die Daten konnten nicht geladen werden.',
      resultCount: function (n, total) { return n + ' von ' + total + ' Steuerprogrammen'; },
      noResults: 'Kein Programm erfüllt diese Filter — probiere weniger Filter.',
      reset: 'Filter zurücksetzen',
      cta: 'Zum Anbieter',
      moreDetails: 'Mehr Details',
      lessDetails: 'Weniger Details',
      price: 'Preis',
      plattform: 'Plattform',
      plattformLabel: { web: 'Web', app: 'App', desktop: 'Desktop' },
      zielgruppeLabel: { angestellte: 'Angestellte', selbststaendige: 'Selbstständige', vermietung: 'Vermietung', kapitalertraege: 'Kapitalerträge', rente: 'Rente' },
      geeignetFuer: 'Geeignet für: ',
      vorjahresImportText: 'Datenübernahme aus dem Vorjahr möglich',
      belegerfassungText: 'Fotoerfassung von Belegen möglich',
      zahlungText: 'Zahlung erst bei Abgabe fällig',
      filterZielgruppe: 'Zielgruppe',
      filterPlattform: 'Plattform',
      filterZahlung: 'Zahlung',
      filterZahlungCheck: 'Nur Zahlung bei Abgabe',
      filterPreis: 'Max. Preis',
      anbieter: 'Anbieter',
      scoreTooltipPrefix: 'Finanzpal-Score: ',
      scoreTooltipSuffix: ' (je von 100; fehlt ein Faktor — z. B. ein nicht bezifferter Preis —, wird er ausgelassen und die übrigen neu gewichtet). Methodik: ueber-uns.html#finanzpal-score',
      scoreLabels: { preis: 'Preis', zielgruppenabdeckung: 'Zielgruppenabdeckung', plattformabdeckung: 'Plattformabdeckung', elsterKlarheit: 'Klarheit zum ELSTER-Zertifikat' }
    },
    en: {
      loading: 'Loading comparison data …',
      error: 'Could not load the data.',
      resultCount: function (n, total) { return n + ' of ' + total + ' tax programs'; },
      noResults: 'No program matches these filters — try removing a filter.',
      reset: 'Reset filters',
      cta: 'View provider',
      moreDetails: 'More details',
      lessDetails: 'Less details',
      price: 'Price',
      plattform: 'Platform',
      plattformLabel: { web: 'Web', app: 'App', desktop: 'Desktop' },
      zielgruppeLabel: { angestellte: 'Employees', selbststaendige: 'Self-employed', vermietung: 'Rental income', kapitalertraege: 'Investment income', rente: 'Pensioners' },
      geeignetFuer: 'Suitable for: ',
      vorjahresImportText: 'Prior-year data import available',
      belegerfassungText: 'Photo capture of receipts available',
      zahlungText: 'Payment only due when you file',
      filterZielgruppe: 'Target group',
      filterPlattform: 'Platform',
      filterZahlung: 'Payment',
      filterZahlungCheck: 'Payment only on submission',
      filterPreis: 'Max. price',
      anbieter: 'Provider',
      scoreTooltipPrefix: 'Finanzpal Score: ',
      scoreTooltipSuffix: ' (each out of 100; a missing factor — e.g. an unstated price — is dropped and the rest reweighted). Methodology: ueber-uns.html#finanzpal-score',
      scoreLabels: { preis: 'Price', zielgruppenabdeckung: 'Target-group coverage', plattformabdeckung: 'Platform coverage', elsterKlarheit: 'ELSTER-certificate clarity' }
    }
  }[LANG];

  var ZIELGRUPPEN = ['angestellte', 'selbststaendige', 'vermietung', 'kapitalertraege', 'rente'];
  var PLATTFORMEN = ['web', 'app', 'desktop'];

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function scoreBreakdownRows(breakdown) {
    var rows = [];
    for (var key in breakdown) {
      if (!Object.prototype.hasOwnProperty.call(breakdown, key)) continue;
      rows.push({ label: (STR.scoreLabels || {})[key] || key, value: breakdown[key] });
    }
    return rows;
  }

  function scoreTooltip(breakdown) {
    var parts = [];
    for (var key in breakdown) {
      if (!Object.prototype.hasOwnProperty.call(breakdown, key)) continue;
      parts.push(((STR.scoreLabels || {})[key] || key) + ' ' + breakdown[key]);
    }
    return STR.scoreTooltipPrefix + parts.join(' · ') + STR.scoreTooltipSuffix;
  }

  // Premium-gradient score badge — see assets/compare.js for the shared
  // rationale/markup this mirrors.
  function scoreBadgeHtml(item) {
    if (!item.score) return '';
    var band = (item.score.band || '').toLowerCase();
    var value = item.score.value;
    var title = scoreTooltip(item.score.breakdown || {});
    var rowsJson = escapeHtml(JSON.stringify(scoreBreakdownRows(item.score.breakdown || {})));
    var ariaLabel = LANG === 'en'
      ? 'Finanzpal Score ' + value + ', grade ' + item.score.band
      : 'Finanzpal-Score ' + value + ', Note ' + item.score.band;
    return '<a class="fp-score-badge band-' + band + '" href="ueber-uns.html#finanzpal-score" title="' + escapeHtml(title) + '" aria-label="' + escapeHtml(ariaLabel) + '" data-score-value="' + value + '" data-score-band="' + escapeHtml(item.score.band) + '" data-score-rows=\'' + rowsJson + '\' aria-haspopup="dialog" aria-expanded="false">' +
      '<span class="fp-score-icon" aria-hidden="true"><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#2FBF7F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>' +
      '<span class="fp-score-grade">' + escapeHtml(item.score.band) + '</span>' +
      '<span class="fp-score-value">' + value + '</span>' +
    '</a>';
  }

  function bulletsFor(item) {
    var bullets = [];
    var supported = ZIELGRUPPEN.filter(function (z) { return item.zielgruppen[z] === true; })
      .map(function (z) { return STR.zielgruppeLabel[z]; });
    if (supported.length) bullets.push({ ok: true, text: STR.geeignetFuer + supported.join(', ') });
    (item.zielgruppenAusschluss || []).forEach(function (note) { bullets.push({ ok: false, text: note }); });
    if (item.vorjahresImport === true) bullets.push({ ok: true, text: STR.vorjahresImportText });
    if (item.belegerfassung === true) bullets.push({ ok: true, text: STR.belegerfassungText });
    if (item.zahlungErstBeiAbgabe === true) bullets.push({ ok: true, text: STR.zahlungText });
    if (item.elsterZertifikat) bullets.push({ ok: false, text: item.elsterZertifikat });
    return bullets;
  }

  function plattformText(item) {
    return PLATTFORMEN.filter(function (p) { return item.plattform[p] === true; })
      .map(function (p) { return STR.plattformLabel[p]; }).join(' · ') || '—';
  }

  function cardArtHtml(item) {
    return '<div class="cc-art" style="background:' + (item.color || '#163A66') + ';">' + escapeHtml(item.initials) + '</div>';
  }

  function init() {
    var app = document.getElementById('steuer-app');
    if (!app) return;
    var src = app.getAttribute('data-source');
    var resultsEl = document.getElementById('steuer-results');
    var countEl = document.getElementById('steuer-count');
    var resetBtn = document.getElementById('steuer-reset');
    var zielgruppeChecks = document.querySelectorAll('input[data-filter="zielgruppe"]');
    var plattformChecks = document.querySelectorAll('input[data-filter="plattform"]');
    var zahlungCheck = document.getElementById('steuer-filter-zahlung');
    var preisSelect = document.getElementById('steuer-preis-select');
    var sortSelect = document.getElementById('steuer-sort-select');

    var allItems = [];
    var expanded = {};

    function applyFilters(items) {
      var zg = Array.prototype.filter.call(zielgruppeChecks, function (c) { return c.checked; }).map(function (c) { return c.value; });
      var pf = Array.prototype.filter.call(plattformChecks, function (c) { return c.checked; }).map(function (c) { return c.value; });
      var maxPreis = parseFloat(preisSelect.value);
      return items.filter(function (item) {
        if (zg.some(function (z) { return item.zielgruppen[z] !== true; })) return false;
        if (pf.some(function (p) { return item.plattform[p] !== true; })) return false;
        if (zahlungCheck.checked && item.zahlungErstBeiAbgabe !== true) return false;
        if (!isNaN(maxPreis) && item.preisSort > maxPreis) return false;
        return true;
      });
    }

    function sortItems(items) {
      var mode = sortSelect.value;
      var copy = items.slice();
      if (mode === 'name') copy.sort(function (a, b) { return a.name.localeCompare(b.name); });
      else copy.sort(function (a, b) { return a.preisSort - b.preisSort; });
      return copy;
    }

    function cardHtml(item) {
      var isOpen = !!expanded[item.id];
      var bullets = bulletsFor(item).map(function (b) {
        return '<li class="' + (b.ok ? 'ok' : 'info') + '"><span class="cc-icon">' + (b.ok ? '✓' : 'ⓘ') + '</span>' + escapeHtml(b.text) + '</li>';
      }).join('');
      return '<div class="kk-card" id="' + escapeHtml(item.id) + '">' +
        '<div class="cc-badges"><span class="cc-badge">' + escapeHtml(item.anbieter) + '</span></div>' +
        '<div class="cc-body">' +
          cardArtHtml(item) +
          '<div class="cc-main"><div class="cc-name">' + escapeHtml(item.name) + scoreBadgeHtml(item) + '</div></div>' +
        '</div>' +
        '<div class="cc-stats">' +
          '<div class="cc-stat"><span class="k">' + STR.price + '</span><span class="v">' + escapeHtml(item.preis) + '</span></div>' +
          '<div class="cc-stat"><span class="k">' + STR.plattform + '</span><span class="v">' + plattformText(item) + '</span></div>' +
        '</div>' +
        '<ul class="cc-bullets">' + bullets + '</ul>' +
        '<div class="cc-cta-col">' +
          '<a href="' + item.affiliateUrl + '" class="cta-btn" rel="sponsored nofollow">' + STR.cta + '</a>' +
        '</div>' +
        '<hr class="cc-divider">' +
        '<button type="button" class="kk-toggle" data-toggle-id="' + item.id + '">' + (isOpen ? STR.lessDetails : STR.moreDetails) + ' <span class="kk-chevron">' + (isOpen ? '▴' : '▾') + '</span></button>' +
        (isOpen ? '<div class="kk-card-details side-facts">' +
          '<div class="sf-row"><span class="k">' + STR.anbieter + '</span><span class="v">' + escapeHtml(item.anbieter) + '</span></div>' +
        '</div>' : '') +
      '</div>';
    }

    function render() {
      var filtered = sortItems(applyFilters(allItems));
      countEl.textContent = STR.resultCount(filtered.length, allItems.length);
      if (!filtered.length) {
        resultsEl.innerHTML = '<div class="kk-empty">' + STR.noResults + '</div>';
        return;
      }
      resultsEl.innerHTML = filtered.map(cardHtml).join('');
      Array.prototype.forEach.call(resultsEl.querySelectorAll('.kk-toggle'), function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-toggle-id');
          expanded[id] = !expanded[id];
          render();
        });
      });
    }

    [].concat(
      Array.prototype.slice.call(zielgruppeChecks),
      Array.prototype.slice.call(plattformChecks),
      [zahlungCheck, preisSelect, sortSelect]
    ).forEach(function (el) { el.addEventListener('change', render); });

    resetBtn.addEventListener('click', function () {
      Array.prototype.forEach.call(zielgruppeChecks, function (c) { c.checked = false; });
      Array.prototype.forEach.call(plattformChecks, function (c) { c.checked = false; });
      zahlungCheck.checked = false;
      preisSelect.value = 'alle';
      sortSelect.value = 'preis';
      render();
    });

    resultsEl.innerHTML = window.kkSkeletonHtml ? window.kkSkeletonHtml(4) : '<div class="kk-empty">' + STR.loading + '</div>';
    fetch(src).then(function (r) { return r.json(); }).then(function (data) {
      allItems = data.items;
      var updatedEl = document.getElementById('steuer-last-updated');
      if (updatedEl) updatedEl.textContent = data.updated;
      render();
    }).catch(function () {
      resultsEl.innerHTML = '<div class="kk-empty">' + STR.error + '</div>';
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
