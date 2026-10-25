// Girokonto comparison: curated list of checking accounts, filterable by
// fee-free terms, card network, overdraft rate and more. Self-contained,
// reusing the kk-/cc- card and filter primitives shared across the site.
(function () {
  var LANG = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0 ? 'en' : 'de';
  var PREFIX = LANG === 'en' ? '../' : '';

  var STR = {
    de: {
      loading: 'Lade Vergleichsdaten …',
      error: 'Die Daten konnten nicht geladen werden.',
      resultCount: function (n, total) { return n + ' von ' + total + ' Girokonten'; },
      noResults: 'Kein Konto erfüllt diese Filter — probiere weniger Filter.',
      cta: 'Zum Anbieter',
      ctaAria: function (name) { return 'Zum Anbieter: ' + name; },
      moreDetails: 'Mehr Details',
      lessDetails: 'Weniger Details',
      kontofuehrung: 'Kontoführung',
      dispozins: 'Dispozins',
      keinDispo: 'Kein Dispo (reines Guthabenkonto)',
      abhebung: 'Bargeldabhebung',
      fremdwaehrung: 'Fremdwährung',
      notAvailable: '—',
      guthabenzinsText: function (z) { return z.toFixed(2).replace('.', ',') + ' % Guthabenzins'; },
      einlagensicherungPrefix: 'Einlagensicherung: ',
      anbieter: 'Anbieter',
      scoreTooltip: function (b) {
        return 'Finanzpal-Score: Kontoführung ' + b.kontofuehrung + ' · Dispozins ' + b.dispozins + ' · Guthabenzins ' + b.guthabenzins + ' · Karte & Flexibilität ' + b.karteFlexibilitaet + ' (je von 100). Methodik: ueber-uns.html#finanzpal-score';
      },
      scoreLabels: { kontofuehrung: 'Kontoführung', dispozins: 'Dispozins', guthabenzins: 'Guthabenzins', karteFlexibilitaet: 'Karte & Flexibilität' }
    },
    en: {
      loading: 'Loading comparison data …',
      error: 'Could not load the data.',
      resultCount: function (n, total) { return n + ' of ' + total + ' checking accounts'; },
      noResults: 'No account matches these filters — try removing a filter.',
      cta: 'View provider',
      ctaAria: function (name) { return 'View provider: ' + name; },
      moreDetails: 'More details',
      lessDetails: 'Less details',
      kontofuehrung: 'Account fee',
      dispozins: 'Overdraft rate',
      keinDispo: 'No overdraft (pure cash account)',
      abhebung: 'Cash withdrawal',
      fremdwaehrung: 'Foreign transaction fee',
      notAvailable: '—',
      guthabenzinsText: function (z) { return z.toFixed(2) + '% interest on balance'; },
      einlagensicherungPrefix: 'Deposit protection: ',
      anbieter: 'Provider',
      scoreTooltip: function (b) {
        return 'Finanzpal Score: Account fee ' + b.kontofuehrung + ' · Overdraft rate ' + b.dispozins + ' · Cash interest ' + b.guthabenzins + ' · Card & flexibility ' + b.karteFlexibilitaet + ' (each out of 100). Methodology: ueber-uns.html#finanzpal-score';
      },
      scoreLabels: { kontofuehrung: 'Account fee', dispozins: 'Overdraft rate', guthabenzins: 'Cash interest', karteFlexibilitaet: 'Card & flexibility' }
    }
  }[LANG];

  function scoreBreakdownRows(breakdown) {
    var rows = [];
    for (var key in breakdown) {
      if (!Object.prototype.hasOwnProperty.call(breakdown, key)) continue;
      rows.push({ label: (STR.scoreLabels || {})[key] || key, value: breakdown[key] });
    }
    return rows;
  }

  // Premium-gradient score badge — see assets/compare.js for the shared
  // rationale/markup this mirrors.
  function scoreBadgeHtml(item) {
    if (!item.score) return '';
    var band = (item.score.band || '').toLowerCase();
    var value = item.score.value;
    var title = STR.scoreTooltip(item.score.breakdown || {});
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

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function bulletsFor(item) {
    var bullets = [];
    bullets.push({ ok: false, text: item.karteText });
    if (item.guthabenzins) bullets.push({ ok: true, text: STR.guthabenzinsText(item.guthabenzins) });
    bullets.push({ ok: false, text: STR.einlagensicherungPrefix + item.einlagensicherung });
    return bullets;
  }

  function cardArtHtml(item) {
    if (item.logo) {
      return '<div class="cc-art logo-chip"><img src="' + PREFIX + escapeHtml(item.logo) + '" alt="' + escapeHtml(item.name) + ' Logo" loading="lazy"></div>';
    }
    return '<div class="cc-art" style="background:' + (item.color || '#163A66') + ';">' + escapeHtml(item.initials) + '<span class="cc-network">' + escapeHtml(item.karteNetzwerk) + '</span></div>';
  }

  function init() {
    var app = document.getElementById('giro-app');
    if (!app) return;
    var src = app.getAttribute('data-source');
    var resultsEl = document.getElementById('giro-results');
    var countEl = document.getElementById('giro-count');
    var resetBtn = document.getElementById('giro-reset');
    var bedingungslosCheck = document.getElementById('giro-filter-bedingungslos');
    var kreditkarteCheck = document.getElementById('giro-filter-kreditkarte');
    var guthabenzinsCheck = document.getElementById('giro-filter-zins');
    var netzwerkChecks = document.querySelectorAll('input[data-filter="netzwerk"]');
    var dispoSelect = document.getElementById('giro-dispo-select');
    var sortSelect = document.getElementById('giro-sort-select');

    var allItems = [];
    var expanded = {};

    function applyFilters(items) {
      var networks = Array.prototype.filter.call(netzwerkChecks, function (c) { return c.checked; }).map(function (c) { return c.value; });
      var maxDispo = parseFloat(dispoSelect.value);
      return items.filter(function (item) {
        if (bedingungslosCheck.checked && !item.bedingungslos) return false;
        if (kreditkarteCheck.checked && !item.kreditkarteEnthalten) return false;
        if (guthabenzinsCheck.checked && !(item.guthabenzins > 0)) return false;
        if (networks.length && networks.indexOf(item.karteNetzwerk) === -1) return false;
        if (!isNaN(maxDispo) && item.dispozins != null && item.dispozins > maxDispo) return false;
        return true;
      });
    }

    function sortItems(items) {
      var mode = sortSelect.value;
      var copy = items.slice();
      if (mode === 'name') copy.sort(function (a, b) { return a.name.localeCompare(b.name); });
      else if (mode === 'dispo') copy.sort(function (a, b) { return (a.dispozins == null ? 99 : a.dispozins) - (b.dispozins == null ? 99 : b.dispozins); });
      else copy.sort(function (a, b) { return a.kontofuehrungSort - b.kontofuehrungSort; });
      return copy;
    }

    function cardHtml(item) {
      var isOpen = !!expanded[item.id];
      var bullets = bulletsFor(item).map(function (b) {
        return '<li class="' + (b.ok ? 'ok' : 'info') + '"><span class="cc-icon">' + (b.ok ? '✓' : 'ⓘ') + '</span>' + escapeHtml(b.text) + '</li>';
      }).join('');
      var dispoText = item.dispozins != null ? item.dispozins.toFixed(2).replace('.', LANG === 'de' ? ',' : '.') + ' %' : STR.keinDispo;
      var crossLinkHtml = window.kkCrossLinkHtml ? window.kkCrossLinkHtml('girokonto', item.id, LANG) : '';
      return '<div class="kk-card" id="' + escapeHtml(item.id) + '">' +
        '<div class="cc-badges"><span class="cc-badge debit">' + escapeHtml(item.anbieter) + '</span>' +
          (item.bedingungslos ? '<span class="cc-badge">' + (LANG === 'en' ? 'Unconditionally free' : 'Bedingungslos kostenlos') + '</span>' : '') +
        '</div>' +
        '<div class="cc-body">' +
          cardArtHtml(item) +
          '<div class="cc-main"><div class="cc-name">' + escapeHtml(item.name) + scoreBadgeHtml(item) + '</div></div>' +
        '</div>' +
        '<div class="cc-stats">' +
          '<div class="cc-stat"><span class="k">' + STR.kontofuehrung + '</span><span class="v">' + escapeHtml(item.kontofuehrung) + '</span></div>' +
          '<div class="cc-stat"><span class="k">' + STR.dispozins + '</span><span class="v">' + dispoText + '</span></div>' +
          '<div class="cc-stat"><span class="k">' + STR.abhebung + '</span><span class="v">' + escapeHtml(item.abhebung) + '</span></div>' +
          '<div class="cc-stat"><span class="k">' + STR.fremdwaehrung + '</span><span class="v">' + escapeHtml(item.fremdwaehrung || STR.notAvailable) + '</span></div>' +
        '</div>' +
        '<ul class="cc-bullets">' + bullets + '</ul>' + crossLinkHtml +
        '<div class="cc-cta-col">' +
          '<a href="' + item.affiliateUrl + '" class="cta-btn" rel="sponsored nofollow" aria-label="' + escapeHtml(STR.ctaAria(item.name)) + '">' + STR.cta + '</a>' +
        '</div>' +
        '<hr class="cc-divider">' +
        '<button type="button" class="kk-toggle" data-toggle-id="' + item.id + '">' + (isOpen ? STR.lessDetails : STR.moreDetails) + ' <span class="kk-chevron">' + (isOpen ? '▴' : '▾') + '</span></button>' +
        (isOpen ? '<div class="kk-card-details side-facts">' +
          '<div class="sf-row"><span class="k">' + STR.anbieter + '</span><span class="v">' + escapeHtml(item.anbieter) + '</span></div>' +
          (item.bedingung ? '<div class="sf-row"><span class="k">—</span><span class="v">' + escapeHtml(item.bedingung) + '</span></div>' : '') +
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
      Array.prototype.slice.call(netzwerkChecks),
      [bedingungslosCheck, kreditkarteCheck, guthabenzinsCheck, dispoSelect, sortSelect]
    ).forEach(function (el) { el.addEventListener('change', render); });

    resetBtn.addEventListener('click', function () {
      Array.prototype.forEach.call(netzwerkChecks, function (c) { c.checked = false; });
      bedingungslosCheck.checked = false;
      kreditkarteCheck.checked = false;
      guthabenzinsCheck.checked = false;
      dispoSelect.value = 'alle';
      sortSelect.value = 'preis';
      render();
    });

    resultsEl.innerHTML = window.kkSkeletonHtml ? window.kkSkeletonHtml(4) : '<div class="kk-empty">' + STR.loading + '</div>';
    fetch(src).then(function (r) { return r.json(); }).then(function (data) {
      allItems = data.items;
      var updatedEl = document.getElementById('giro-last-updated');
      if (updatedEl) updatedEl.textContent = data.updated;
      render();
      if (window.kkScrollToHash) window.kkScrollToHash();
    }).catch(function () {
      resultsEl.innerHTML = '<div class="kk-empty">' + STR.error + '</div>';
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
