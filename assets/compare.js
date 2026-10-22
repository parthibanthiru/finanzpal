// Renders a comparison table from a JSON data file.
// Usage: <table class="compare" data-source="data/broker.json" data-type="broker">
(function () {
  var LANG = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0 ? 'en' : 'de';
  var STR = {
    de: { pick: 'Unsere Empfehlung', cta: 'Zum Anbieter', loading: 'Lade Vergleichsdaten …', notRated: 'noch nicht bewertet',
      error: function (msg) { return 'Daten konnten nicht geladen werden (' + msg + '). Lokal? Bitte über einen lokalen Server öffnen, z. B. <code>python3 -m http.server</code> — direktes Öffnen der Datei (file://) blockiert den Datenabruf im Browser.'; } },
    en: { pick: 'Our pick', cta: 'View offer', loading: 'Loading comparison data …', notRated: 'not yet rated',
      error: function (msg) { return 'Could not load data (' + msg + '). Running locally? Please serve the files via a local server, e.g. <code>python3 -m http.server</code> — opening the file directly (file://) blocks the request in the browser.'; } }
  };

  // Human-readable labels for each rubric factor key that can show up in a
  // `score.breakdown` object, keyed by category so two categories can reuse
  // the same factor name with different wording if needed. Used only for the
  // badge tooltip — see assets/girokonto-compare.js for the same pattern
  // applied to its own card renderer.
  var SCORE_FACTOR_LABELS = {
    kredite: {
      de: { zinssatz: 'Zinssatz', sondertilgung: 'Sondertilgung', kreditrahmen: 'Kreditrahmen' },
      en: { zinssatz: 'Interest rate', sondertilgung: 'Special repayment', kreditrahmen: 'Loan amount range' }
    }
  };

  function scoreTooltip(type, breakdown) {
    var labels = (SCORE_FACTOR_LABELS[type] || {})[LANG] || {};
    var parts = [];
    for (var key in breakdown) {
      if (!Object.prototype.hasOwnProperty.call(breakdown, key)) continue;
      parts.push((labels[key] || key) + ' ' + breakdown[key]);
    }
    var prefix = LANG === 'en' ? 'Finanzpal Score: ' : 'Finanzpal-Score: ';
    var suffix = LANG === 'en'
      ? ' (each out of 100). Methodology: ueber-uns.html#finanzpal-score'
      : ' (je von 100). Methodik: ueber-uns.html#finanzpal-score';
    return prefix + parts.join(' · ') + suffix;
  }

  function scoreBadgeHtml(type, item) {
    if (!item.score) return '';
    var band = (item.score.band || '').toLowerCase();
    var title = scoreTooltip(type, item.score.breakdown || {});
    return '<a class="fp-score-badge band-' + band + '" href="ueber-uns.html#finanzpal-score" title="' + escapeHtml(title) + '">' +
      item.score.value + ' <span class="fp-score-band">' + escapeHtml(item.score.band) + '</span></a>';
  }

  var MONTHS = {
    de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };

  function formatUpdated(str) {
    var m = /^(\d{4})-(\d{2})$/.exec(str || '');
    if (!m) return str;
    var monthName = MONTHS[LANG][parseInt(m[2], 10) - 1];
    if (!monthName) return str;
    return LANG === 'en' ? monthName + ' ' + m[1] : monthName + ' ' + m[1];
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function brokerCell(item, type) {
    var nameHtml = item.recommended
      ? '<div class="broker-name linked">' + escapeHtml(item.name) + scoreBadgeHtml(type, item) + '</div><span class="broker-tag">' + STR[LANG].pick + '</span>'
      : '<div class="broker-name">' + escapeHtml(item.name) + scoreBadgeHtml(type, item) + '</div>';
    var markStyle = item.color ? ' style="background:' + item.color + ';"' : '';
    if (item.detailUrl) {
      return '<a href="' + item.detailUrl + '" class="broker-cell"><div class="broker-mark"' + markStyle + '>' + item.initials + '</div><div>' + nameHtml + '</div></a>';
    }
    return '<div class="broker-cell"><div class="broker-mark"' + markStyle + '>' + item.initials + '</div><div>' + nameHtml + '</div></div>';
  }

  function ratingHtml(stars, score) {
    if (score === null || score === undefined) {
      return '<div class="rating"><span class="score-na">' + STR[LANG].notRated + '</span></div>';
    }
    var scoreStr = LANG === 'en' ? score.toFixed(1) : score.toFixed(1).replace('.', ',');
    return '<div class="rating"><span class="stars">' + stars + '</span><span class="score">' + scoreStr + '</span></div>';
  }

  function ctaHtml(item) {
    var cls = item.recommended ? 'cta-btn2' : 'cta-btn2 secondary';
    return '<a href="' + item.affiliateUrl + '" class="' + cls + '" rel="sponsored nofollow">' + STR[LANG].cta + '</a>';
  }

  var renderers = {
    tagesgeld: function (item) {
      return '<tr class="' + (item.recommended ? 'pick' : '') + '">' +
        '<td>' + brokerCell(item, 'tagesgeld') + '</td>' +
        '<td><span class="rate-val">' + item.rate + '</span></td>' +
        '<td class="num-cell">' + item.guarantee + '</td>' +
        '<td class="num-cell">' + item.minDeposit + '</td>' +
        '<td class="num-cell">' + item.protection + '</td>' +
        '<td>' + ctaHtml(item) + '</td>' +
        '</tr>';
    },
    kredite: function (item) {
      return '<tr class="' + (item.recommended ? 'pick' : '') + '">' +
        '<td>' + brokerCell(item, 'kredite') + '</td>' +
        '<td><span class="rate-val">' + item.rate + '</span></td>' +
        '<td class="num-cell">' + item.amount + '</td>' +
        '<td class="num-cell">' + item.term + '</td>' +
        '<td class="num-cell">' + item.sondertilgung + '</td>' +
        '<td>' + ctaHtml(item) + '</td>' +
        '</tr>';
    },
    versicherungen: function (item) {
      return '<tr class="' + (item.recommended ? 'pick' : '') + '">' +
        '<td>' + brokerCell(item, 'versicherungen') + '</td>' +
        '<td class="num-cell">' + item.beitrag + '</td>' +
        '<td class="num-cell">' + item.deckung + '</td>' +
        '<td><div class="cover-list">' + item.leistungen + '</div></td>' +
        '<td>' + ratingHtml(item.ratingStars, item.rating) + '</td>' +
        '<td>' + ctaHtml(item) + '</td>' +
        '</tr>';
    }
  };
  // Hausrat, BU, Rechtsschutz and Autoversicherung share the same row shape (beitrag/deckung/leistungen) as versicherungen.
  renderers.hausrat = renderers.versicherungen;
  renderers.bu = renderers.versicherungen;
  renderers.rechtsschutz = renderers.versicherungen;
  renderers.autoversicherung = renderers.versicherungen;

  function renderTable(table) {
    var src = table.getAttribute('data-source');
    if (LANG === 'en') src = src.replace(/\.json$/, '.en.json');
    var type = table.getAttribute('data-type');
    var tbody = table.querySelector('tbody');
    var renderRow = renderers[type];
    if (!tbody || !renderRow) return;

    tbody.innerHTML = '<tr class="loading-row"><td colspan="6">' + STR[LANG].loading + '</td></tr>';

    fetch(src)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        tbody.innerHTML = data.items.map(renderRow).join('');
        var updatedEl = document.getElementById('last-updated');
        if (updatedEl && data.updated) updatedEl.textContent = formatUpdated(data.updated);
      })
      .catch(function (err) {
        tbody.innerHTML = '<tr class="loading-row"><td colspan="6">' + STR[LANG].error(escapeHtml(err.message)) + '</td></tr>';
      });
  }

  // Exposed so a page-specific script (e.g. insurance type-tab switching) can
  // re-render a table after changing its data-source/data-type attributes.
  window.FPCompare = { renderTable: renderTable };

  document.addEventListener('DOMContentLoaded', function () {
    var tables = document.querySelectorAll('table.compare[data-source]');
    tables.forEach(renderTable);
  });
})();
