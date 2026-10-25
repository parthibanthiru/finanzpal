// Renders a comparison table from a JSON data file.
// Usage: <table class="compare" data-source="data/broker.json" data-type="broker">
(function () {
  var LANG = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0 ? 'en' : 'de';
  var PREFIX = LANG === 'en' ? '../' : '';
  var STR = {
    de: { pick: 'Unsere Empfehlung', cta: 'Zum Anbieter', ctaAria: function (name) { return 'Zum Anbieter: ' + name; }, loading: 'Lade Vergleichsdaten …', notRated: 'noch nicht bewertet',
      error: function (msg) { return 'Daten konnten nicht geladen werden (' + msg + '). Lokal? Bitte über einen lokalen Server öffnen, z. B. <code>python3 -m http.server</code> — direktes Öffnen der Datei (file://) blockiert den Datenabruf im Browser.'; },
      sortedAsc: function (col) { return 'Sortiert nach ' + col + ', aufsteigend. Klicken für absteigend.'; },
      sortedDesc: function (col) { return 'Sortiert nach ' + col + ', absteigend. Klicken für aufsteigend.'; },
      sortBy: function (col) { return 'Sortieren nach ' + col; } },
    en: { pick: 'Our pick', cta: 'View provider', ctaAria: function (name) { return 'View provider: ' + name; }, loading: 'Loading comparison data …', notRated: 'not yet rated',
      error: function (msg) { return 'Could not load data (' + msg + '). Running locally? Please serve the files via a local server, e.g. <code>python3 -m http.server</code> — opening the file directly (file://) blocks the request in the browser.'; },
      sortedAsc: function (col) { return 'Sorted by ' + col + ', ascending. Click for descending.'; },
      sortedDesc: function (col) { return 'Sorted by ' + col + ', descending. Click for ascending.'; },
      sortBy: function (col) { return 'Sort by ' + col; } }
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

  // Premium-gradient score badge (dark navy -> band accent colour, white
  // text, small check icon) — replaces the earlier tiny ring badge with a
  // much larger, visually distinct chip. Markup is identical across every
  // *-compare.js renderer; the gradient/accent mapping lives once in
  // style.css's .fp-score-badge.band-* rules.
  function scoreBadgeHtml(type, item) {
    if (!item.score) return '';
    var band = (item.score.band || '').toLowerCase();
    var value = item.score.value;
    var title = scoreTooltip(type, item.score.breakdown || {});
    var rowsJson = escapeHtml(JSON.stringify(scoreBreakdownRows(type, item.score.breakdown || {})));
    var ariaLabel = LANG === 'en'
      ? 'Finanzpal Score ' + value + ', grade ' + item.score.band
      : 'Finanzpal-Score ' + value + ', Note ' + item.score.band;
    return '<a class="fp-score-badge band-' + band + '" href="ueber-uns.html#finanzpal-score" title="' + escapeHtml(title) + '" aria-label="' + escapeHtml(ariaLabel) + '" data-score-value="' + value + '" data-score-band="' + escapeHtml(item.score.band) + '" data-score-rows=\'' + rowsJson + '\' aria-haspopup="dialog" aria-expanded="false">' +
      '<span class="fp-score-icon" aria-hidden="true"><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#2FBF7F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>' +
      '<span class="fp-score-grade">' + escapeHtml(item.score.band) + '</span>' +
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

  // Finds the first number in a locale-formatted string and applies a
  // trailing magnitude-unit multiplier if present — DE: "." thousands / ","
  // decimal, unit "Mio."/"Mrd." (e.g. "ab 2,99 %" -> 2.99, "100 Mio. €" ->
  // 1e8); EN: "," thousands / "." decimal, unit "m"/"bn" (e.g. "from 2.99%"
  // -> 2.99, "€100m" -> 1e8) — matches how data/*.en.json already writes
  // these fields. Returns null when no leading number can be found (e.g.
  // "individuell, altersabhängig"), so a column of mixed real values and
  // free-text placeholders sorts the real values and pushes the
  // unparseable ones to the end rather than guessing — see sortByKey()'s
  // null-last handling below.
  function parseLeadingNumber(str) {
    if (str === null || str === undefined) return null;
    var s = String(str);
    var m = LANG === 'en'
      ? s.match(/(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)\s*(bn|m)?/i)
      : s.match(/(\d{1,3}(?:\.\d{3})*(?:,\d+)?|\d+(?:,\d+)?)\s*(Mio\.?|Mrd\.?)?/i);
    if (!m) return null;
    var n = LANG === 'en' ? parseFloat(m[1].replace(/,/g, '')) : parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
    if (isNaN(n)) return null;
    var unit = (m[2] || '').toLowerCase();
    if (LANG === 'en') {
      if (unit === 'bn') n *= 1e9;
      else if (unit === 'm') n *= 1e6;
    } else {
      if (unit.indexOf('mrd') === 0) n *= 1e9;
      else if (unit.indexOf('mio') === 0) n *= 1e6;
    }
    return n;
  }

  // Lower bound of a range string ("1.000 – 75.000 €" -> 1000), used as the
  // sort value for Kreditsumme/Laufzeit ("starts from" reading).
  function rangeMin(str) {
    var r = parseRangeNumbers(str);
    return r ? r.min : null;
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
      var isRated = item.rating !== null && item.rating !== undefined;
      return '<tr class="' + (item.recommended ? 'pick' : '') + '"' +
        ' data-recommended="' + (item.recommended ? '1' : '0') + '"' +
        ' data-rated="' + (isRated ? '1' : '0') + '">' +
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

  // Sortable columns per data-type. Only columns backed by a genuinely
  // comparable value are listed here — e.g. Kredite's "Sondertilgung" and
  // Versicherungen's "Leistungsumfang" are free text describing conditions,
  // not a rankable quantity, so they're left out rather than sorted
  // alphabetically in a way that would look meaningful but isn't (matches
  // the site's data-integrity principle: no implied precision/ranking the
  // underlying data can't support).
  var SORT_ACCESSORS = {
    tagesgeld: {
      name: function (it) { return it.name.toLowerCase(); },
      rate: function (it) { return parseLeadingNumber(it.rate); }
    },
    kredite: {
      name: function (it) { return it.name.toLowerCase(); },
      rate: function (it) { return parseLeadingNumber(it.rate); },
      amount: function (it) { return rangeMin(it.amount); },
      term: function (it) { return rangeMin(it.term); }
    },
    versicherungen: {
      name: function (it) { return it.name.toLowerCase(); },
      beitrag: function (it) { return parseLeadingNumber(it.beitrag); },
      deckung: function (it) { return parseLeadingNumber(it.deckung); },
      rating: function (it) { return (it.rating === null || it.rating === undefined) ? null : it.rating; }
    }
  };
  // Hausrat/BU/Rechtsschutz/Autoversicherung reuse versicherungen's accessors
  // (same field names). Many of their beitrag/deckung values are identical
  // free text across providers (e.g. BU's "individuell, altersabhängig") —
  // parseLeadingNumber returns null for those, so sorting that column is a
  // harmless no-op there rather than a misleading reorder.
  SORT_ACCESSORS.hausrat = SORT_ACCESSORS.bu = SORT_ACCESSORS.rechtsschutz = SORT_ACCESSORS.autoversicherung = SORT_ACCESSORS.versicherungen;

  // Stable sort with unparseable/missing values always pushed to the end,
  // regardless of direction (so clicking a column never silently reshuffles
  // "no data" rows to the top under descending order).
  function sortByKey(items, type, key, dir) {
    var accessor = key && (SORT_ACCESSORS[type] || {})[key];
    if (!accessor) return items;
    var copy = items.slice();
    copy.sort(function (a, b) {
      var av = accessor(a), bv = accessor(b);
      var an = av === null || av === undefined || (typeof av === 'number' && isNaN(av));
      var bn = bv === null || bv === undefined || (typeof bv === 'number' && isNaN(bv));
      if (an && bn) return 0;
      if (an) return 1;
      if (bn) return -1;
      var cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return dir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }

  function sortThLabel(th) {
    var labelEl = th.querySelector('.cmp-th-label');
    return (labelEl ? labelEl.textContent : th.textContent).trim();
  }

  function updateSortHeaderUI(table) {
    var state = table._fpSort || { key: null, dir: 'asc' };
    Array.prototype.forEach.call(table.querySelectorAll('thead [data-sort]'), function (th) {
      var key = th.getAttribute('data-sort');
      var active = state.key === key;
      th.classList.toggle('active', active);
      var arrowEl = th.querySelector('.cmp-sort-arrow');
      if (arrowEl) arrowEl.textContent = active ? (state.dir === 'asc' ? ' ▲' : ' ▼') : '';
      var label = sortThLabel(th);
      th.setAttribute('aria-label', active ? (state.dir === 'asc' ? STR[LANG].sortedAsc(label) : STR[LANG].sortedDesc(label)) : STR[LANG].sortBy(label));
    });
  }

  // Click/keyboard handlers are bound once per <th> and persist across
  // insurance-tabs.js's tab switches (same <table>/<th> DOM nodes are
  // reused, only data-type/data-source/labels change), so sort preference
  // carries over between Versicherungen's 5 tabs.
  function initSortHeaders(table) {
    Array.prototype.forEach.call(table.querySelectorAll('thead [data-sort]'), function (th) {
      if (th._fpSortBound) return;
      th._fpSortBound = true;
      var activate = function () {
        var key = th.getAttribute('data-sort');
        var state = table._fpSort || (table._fpSort = { key: null, dir: 'asc' });
        if (state.key === key) {
          state.dir = state.dir === 'asc' ? 'desc' : 'asc';
        } else {
          state.key = key;
          state.dir = 'asc';
        }
        updateSortHeaderUI(table);
        if (table._fpItems) renderBody(table, table.getAttribute('data-type'), table._fpItems);
      };
      th.addEventListener('click', activate);
      th.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
      });
    });
    updateSortHeaderUI(table);
  }

  function renderBody(table, type, items) {
    var tbody = table.querySelector('tbody');
    var renderRow = renderers[type];
    if (!tbody || !renderRow) return;
    var state = table._fpSort || { key: null, dir: 'asc' };
    var sorted = sortByKey(items, type, state.key, state.dir);
    tbody.innerHTML = sorted.map(renderRow).join('');
    // Lets a page-specific script (e.g. assets/kredite-filter.js) act on
    // the freshly rendered rows without re-fetching the data itself.
    table.dispatchEvent(new CustomEvent('fpcompare:rendered', { detail: { type: type, items: sorted } }));
  }

  function renderTable(table) {
    var src = table.getAttribute('data-source');
    if (LANG === 'en') src = src.replace(/\.json$/, '.en.json');
    var type = table.getAttribute('data-type');
    var tbody = table.querySelector('tbody');
    var renderRow = renderers[type];
    if (!tbody || !renderRow) return;

    tbody.innerHTML = '<tr class="loading-row"><td colspan="6">' + STR[LANG].loading + '</td></tr>';
    table._fpItems = null;

    fetch(src)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        table._fpItems = data.items;
        var updatedEl = document.getElementById('last-updated');
        if (updatedEl && data.updated) updatedEl.textContent = formatUpdated(data.updated);
        renderBody(table, type, data.items);
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
    tables.forEach(function (table) {
      initSortHeaders(table);
      renderTable(table);
    });
  });
})();
