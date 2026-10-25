// Renders a comparison table from a JSON data file.
// Usage: <table class="compare" data-source="data/broker.json" data-type="broker">
(function () {
  var LANG = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0 ? 'en' : 'de';
  var PREFIX = LANG === 'en' ? '../' : '';
  var STR = {
    de: { pick: 'Unsere Empfehlung', cta: 'Zum Anbieter', ctaAria: function (name) { return 'Zum Anbieter: ' + name; }, loading: 'Lade Vergleichsdaten …', notRated: 'noch nicht bewertet',
      error: function (msg) { return 'Daten konnten nicht geladen werden (' + msg + '). Lokal? Bitte über einen lokalen Server öffnen, z. B. <code>python3 -m http.server</code> — direktes Öffnen der Datei (file://) blockiert den Datenabruf im Browser.'; } },
    en: { pick: 'Our pick', cta: 'View provider', ctaAria: function (name) { return 'View provider: ' + name; }, loading: 'Loading comparison data …', notRated: 'not yet rated',
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
    },
    tagesgeld: {
      de: { zins: 'Zins', garantiedauer: 'Zins-Garantiedauer', einlagensicherung: 'Einlagensicherung' },
      en: { zins: 'Interest rate', garantiedauer: 'Rate-guarantee duration', einlagensicherung: 'Deposit protection' }
    },
    // Only the Privathaftpflicht tab (data-type="versicherungen") has scored
    // items — Hausrat/BU/Rechtsschutz/Kfz share this same renderer but their
    // items carry no `score` field, so scoreBadgeHtml() returns '' for them
    // and these labels are never used there.
    versicherungen: {
      de: { beitrag: 'Jahresbeitrag', ratingBestaetigt: 'Rating-Bestätigung (F&B PHV FFF+)', deckung: 'Deckungssumme' },
      en: { beitrag: 'Annual premium', ratingBestaetigt: 'Rating confirmation (F&B PHV FFF+)', deckung: 'Cover amount' }
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

  // Same breakdown as scoreTooltip() above, but as {label, value} rows for
  // assets/score-popover.js to render as a tappable panel (a native `title`
  // tooltip never shows on touch devices, so mobile visitors otherwise have
  // no way to see what the score is made of).
  function scoreBreakdownRows(type, breakdown) {
    var labels = (SCORE_FACTOR_LABELS[type] || {})[LANG] || {};
    var rows = [];
    for (var key in breakdown) {
      if (!Object.prototype.hasOwnProperty.call(breakdown, key)) continue;
      rows.push({ label: labels[key] || key, value: breakdown[key] });
    }
    return rows;
  }

  var SCORE_RING_R = 8;
  var SCORE_RING_C = 2 * Math.PI * SCORE_RING_R;

  function scoreBadgeHtml(type, item) {
    if (!item.score) return '';
    var band = (item.score.band || '').toLowerCase();
    var value = item.score.value;
    var title = scoreTooltip(type, item.score.breakdown || {});
    var rowsJson = escapeHtml(JSON.stringify(scoreBreakdownRows(type, item.score.breakdown || {})));
    var ariaLabel = LANG === 'en'
      ? 'Finanzpal Score ' + value + ', grade ' + item.score.band
      : 'Finanzpal-Score ' + value + ', Note ' + item.score.band;
    var offset = (SCORE_RING_C * (1 - Math.max(0, Math.min(100, value)) / 100)).toFixed(2);
    return '<a class="fp-score-badge band-' + band + '" href="ueber-uns.html#finanzpal-score" title="' + escapeHtml(title) + '" aria-label="' + escapeHtml(ariaLabel) + '" data-score-value="' + value + '" data-score-band="' + escapeHtml(item.score.band) + '" data-score-rows=\'' + rowsJson + '\' aria-haspopup="dialog" aria-expanded="false">' +
      '<svg class="fp-score-ring" width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">' +
        '<circle class="fp-score-track" cx="11" cy="11" r="' + SCORE_RING_R + '"></circle>' +
        '<circle class="fp-score-fill" cx="11" cy="11" r="' + SCORE_RING_R + '" stroke-dasharray="' + SCORE_RING_C.toFixed(2) + '" stroke-dashoffset="' + offset + '" transform="rotate(-90 11 11)"></circle>' +
        '<text x="11" y="11" class="fp-score-letter" text-anchor="middle" dominant-baseline="middle">' + escapeHtml(item.score.band) + '</text>' +
      '</svg>' +
      '<span class="fp-score-value">' + value + '</span>' +
    '</a>';
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

  // Parses a published range string (e.g. "1.000 – 75.000 €" or
  // "€1,000 – 75,000") into {min, max} integers. Used to drive the Kredite
  // page's quick-calculator highlight and range checks — it only parses
  // numbers the site already publishes, it never invents new figures.
  function parseRangeNumbers(str) {
    var nums = String(str || '').match(/\d[\d.,]*/g);
    if (!nums || nums.length < 2) return null;
    function toInt(n) { return parseInt(n.replace(/[.,]/g, ''), 10); }
    return { min: toInt(nums[0]), max: toInt(nums[1]) };
  }

  function brokerCell(item, type) {
    var nameHtml = item.recommended
      ? '<div class="broker-name linked">' + escapeHtml(item.name) + scoreBadgeHtml(type, item) + '</div><span class="broker-tag">' + STR[LANG].pick + '</span>'
      : '<div class="broker-name">' + escapeHtml(item.name) + scoreBadgeHtml(type, item) + '</div>';
    var markStyle = item.color ? ' style="background:' + item.color + ';"' : '';
    var markHtml = item.logo
      ? '<div class="broker-mark logo-chip"><img src="' + PREFIX + escapeHtml(item.logo) + '" alt="' + escapeHtml(item.name) + ' Logo" loading="lazy"></div>'
      : '<div class="broker-mark"' + markStyle + '>' + item.initials + '</div>';
    if (item.detailUrl) {
      return '<a href="' + item.detailUrl + '" class="broker-cell">' + markHtml + '<div>' + nameHtml + '</div></a>';
    }
    return '<div class="broker-cell">' + markHtml + '<div>' + nameHtml + '</div></div>';
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
    return '<a href="' + item.affiliateUrl + '" class="' + cls + '" rel="sponsored nofollow" aria-label="' + escapeHtml(STR[LANG].ctaAria(item.name)) + '">' + STR[LANG].cta + '</a>';
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
      var amountRange = parseRangeNumbers(item.amount);
      var termRange = parseRangeNumbers(item.term);
      // "Kostenlos besparbar" claim is only set when the provider's own
      // Sondertilgung text says so explicitly — not inferred for providers
      // whose text only cites the general statutory rule (§ 502 BGB) without
      // specifying their own terms.
      var sondertilgungFrei = (LANG === 'en' ? /free/i : /kostenlos/i).test(item.sondertilgung || '');
      return '<tr class="' + (item.recommended ? 'pick' : '') +
        '" data-amount-min="' + (amountRange ? amountRange.min : '') + '" data-amount-max="' + (amountRange ? amountRange.max : '') + '"' +
        ' data-term-min="' + (termRange ? termRange.min : '') + '" data-term-max="' + (termRange ? termRange.max : '') + '"' +
        ' data-sondertilgung-frei="' + (sondertilgungFrei ? '1' : '0') + '"' +
        ' data-bearbeitungsgebuehr-frei="1">' +
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
        // Lets a page-specific script (e.g. assets/kredite-filter.js) act on
        // the freshly rendered rows without re-fetching the data itself.
        table.dispatchEvent(new CustomEvent('fpcompare:rendered', { detail: { type: type, items: data.items } }));
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
