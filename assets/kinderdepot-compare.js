(function () {
  var LANG = document.documentElement.lang === 'en' ? 'en' : 'de';
  var PREFIX = LANG === 'en' ? '../' : '';
  var STR = LANG === 'en' ? {
    count: function (n, total) { return n + ' of ' + total + ' children\'s accounts'; },
    reset: 'Reset filters',
    sortRate: 'Sort: Savings rate ascending',
    sortName: 'Sort: Name A–Z',
    empty: 'No account matches these filters. Try removing one.',
    etfFreeNote: 'Fee-free ETF savings plans',
    mindestsparrate: function (n) { return 'Minimum savings rate: from €' + n + '/plan'; },
    noParentDepot: 'No parent account needed',
    zinsText: function (item) { return item.guthabenzins + '% p.a. cash interest'; },
    feeLabel: 'Account fee',
    rateLabel: 'Min. savings rate',
    etfLabel: 'ETF savings plans',
    parentLabel: 'Parent account',
    parentRequired: 'Required',
    parentNotRequired: 'Not required',
    ageLabel: 'Age / conditions',
    detailsMore: 'More details',
    detailsLess: 'Fewer details',
    cta: 'View provider',
    ctaAria: function (name) { return 'View provider: ' + name; },
    provider: 'Provider',
    sourceLabel: 'Sources',
    scoreTooltip: function (b) {
      return 'Finanzpal Score: Account fee ' + b.depotgebuehr + ' · Min. savings rate ' + b.mindestsparrate + ' · Cash interest ' + b.guthabenzins + ' · Parent-account effort ' + b.elternAufwand + ' (each out of 100). Methodology: ueber-uns.html#finanzpal-score';
    },
    scoreLabels: { depotgebuehr: 'Account fee', mindestsparrate: 'Min. savings rate', guthabenzins: 'Cash interest', elternAufwand: 'Parent-account effort' }
  } : {
    count: function (n, total) { return n + ' von ' + total + ' Kinderdepots'; },
    reset: 'Filter zurücksetzen',
    sortRate: 'Sortieren: Mindestsparrate aufsteigend',
    sortName: 'Sortieren: Name A–Z',
    empty: 'Kein Kinderdepot passt zu diesen Filtern. Entferne einen Filter.',
    etfFreeNote: 'Kostenlos besparbare ETF-Sparpläne',
    mindestsparrate: function (n) { return 'Mindestsparrate: ab ' + n + ' €/Sparplan'; },
    noParentDepot: 'Kein eigenes Depot der Eltern nötig',
    zinsText: function (item) { return item.guthabenzins + ' % p. a. Guthabenzins'; },
    feeLabel: 'Depotgebühr',
    rateLabel: 'Mind. Sparrate',
    etfLabel: 'ETF-Sparpläne',
    parentLabel: 'Elterndepot',
    parentRequired: 'Nötig',
    parentNotRequired: 'Nicht nötig',
    ageLabel: 'Alter / Voraussetzungen',
    detailsMore: 'Mehr Details',
    detailsLess: 'Weniger Details',
    cta: 'Zum Anbieter',
    ctaAria: function (name) { return 'Zum Anbieter: ' + name; },
    provider: 'Anbieter',
    sourceLabel: 'Quellen',
    scoreTooltip: function (b) {
      return 'Finanzpal-Score: Depotgebühr ' + b.depotgebuehr + ' · Mindestsparrate ' + b.mindestsparrate + ' · Guthabenzins ' + b.guthabenzins + ' · Eltern-Aufwand ' + b.elternAufwand + ' (je von 100). Methodik: ueber-uns.html#finanzpal-score';
    },
    scoreLabels: { depotgebuehr: 'Depotgebühr', mindestsparrate: 'Mindestsparrate', guthabenzins: 'Guthabenzins', elternAufwand: 'Eltern-Aufwand' }
  };

  function scoreBreakdownRows(breakdown) {
    var rows = [];
    for (var key in breakdown) {
      if (!Object.prototype.hasOwnProperty.call(breakdown, key)) continue;
      rows.push({ label: (STR.scoreLabels || {})[key] || key, value: breakdown[key] });
    }
    return rows;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function bulletsFor(item) {
    var bullets = [];
    bullets.push({ ok: true, text: STR.etfFreeNote + (item.etfSparplaeneCaveat ? ' — ' + item.etfSparplaeneCaveat : '') });
    if (item.guthabenzins) {
      bullets.push({ ok: true, text: STR.zinsText(item) + (item.guthabenzinsCaveat ? ' — ' + item.guthabenzinsCaveat : '') });
    } else if (item.guthabenzinsCaveat) {
      bullets.push({ ok: false, text: item.guthabenzinsCaveat });
    }
    bullets.push({ ok: !item.parentDepotRequired, text: item.ageLimitText });
    if (item.besonderheitenText) bullets.push({ ok: true, text: item.besonderheitenText });
    return bullets;
  }

  function cardArtHtml(item) {
    if (item.logo) {
      return '<div class="cc-art logo-chip"><img src="' + PREFIX + escapeHtml(item.logo) + '" alt="' + escapeHtml(item.name) + ' Logo" loading="lazy"></div>';
    }
    return '<div class="cc-art" style="background:' + (item.color || '#163A66') + ';">' + escapeHtml(item.initials) + '</div>';
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
      '<span class="fp-score-icon" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#2FBF7F" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>' +
      '<span class="fp-score-grade">' + escapeHtml(item.score.band) + '</span>' +
      '<span class="fp-score-value">' + value + '</span>' +
    '</a>';
  }

  function cardHtml(item) {
    var bullets = bulletsFor(item);
    var bulletsHtml = bullets.map(function (b) {
      return '<li class="' + (b.ok ? 'ok' : 'info') + '"><span class="cc-icon">' + (b.ok ? '✓' : 'i') + '</span>' + escapeHtml(b.text) + '</li>';
    }).join('');
    return (
      '<article class="kk-card" id="' + escapeHtml(item.id) + '">' +
      '<div class="cc-badges"><span class="cc-badge">' + escapeHtml(item.name) + '</span>' +
      (!item.parentDepotRequired ? '<span class="cc-badge debit">' + escapeHtml(STR.noParentDepot) + '</span>' : '') +
      '</div>' +
      '<div class="cc-body">' +
      cardArtHtml(item) +
      '<div class="cc-main"><div class="cc-name">' + escapeHtml(item.name) + scoreBadgeHtml(item) + '</div></div>' +
      '</div>' +
      '<div class="cc-stats">' +
      '<div class="cc-stat"><span class="k">' + STR.feeLabel + '</span><span class="v">' + escapeHtml(item.depotgebuehrText) + '</span></div>' +
      '<div class="cc-stat"><span class="k">' + STR.rateLabel + '</span><span class="v">' + item.mindestsparrate + ' €</span></div>' +
      (item.etfSparplaeneAnzahl ? '<div class="cc-stat"><span class="k">' + STR.etfLabel + '</span><span class="v">' + item.etfSparplaeneAnzahl.toLocaleString(LANG === 'en' ? 'en-US' : 'de-DE') + '</span></div>' : '') +
      '<div class="cc-stat"><span class="k">' + STR.parentLabel + '</span><span class="v">' + (item.parentDepotRequired ? STR.parentRequired : STR.parentNotRequired) + '</span></div>' +
      '</div>' +
      '<ul class="cc-bullets">' + bulletsHtml + '</ul>' +
      '<div class="cc-cta-col"><a href="' + escapeHtml(item.affiliateUrl) + '" class="cta-btn" rel="sponsored nofollow" aria-label="' + escapeHtml(STR.ctaAria(item.name)) + '">' + STR.cta + '</a></div>' +
      '<hr class="cc-divider">' +
      '<button type="button" class="kk-toggle" data-toggle>' + STR.detailsMore + ' ▾</button>' +
      '<div class="kk-card-details side-facts" hidden>' +
      '<div><span class="k">' + STR.ageLabel + '</span><span class="v">' + escapeHtml(item.ageLimitText) + '</span></div>' +
      '<div><span class="k">' + STR.sourceLabel + '</span><span class="v">' + escapeHtml(item.sourcesNote || '') + '</span></div>' +
      '</div>' +
      '</article>'
    );
  }

  document.addEventListener('DOMContentLoaded', function () {
    var app = document.getElementById('kinderdepot-app');
    if (!app) return;
    var source = app.getAttribute('data-source');
    var resultsEl = document.getElementById('kinderdepot-results');
    var countEl = document.getElementById('kinderdepot-count');
    var resetBtn = document.getElementById('kinderdepot-reset');
    var sortSelect = document.getElementById('kinderdepot-sort-select');
    var noParentCheck = document.getElementById('kinderdepot-filter-no-parent');
    var rateSelect = document.getElementById('kinderdepot-rate-select');

    var allItems = [];

    function applyFilters(items) {
      var maxRate = parseFloat(rateSelect.value);
      return items.filter(function (item) {
        if (noParentCheck.checked && item.parentDepotRequired) return false;
        if (!isNaN(maxRate) && item.mindestsparrate > maxRate) return false;
        return true;
      });
    }

    function applySort(items) {
      var sorted = items.slice();
      if (sortSelect.value === 'name') {
        sorted.sort(function (a, b) { return a.name.localeCompare(b.name); });
      } else {
        sorted.sort(function (a, b) { return a.mindestsparrate - b.mindestsparrate; });
      }
      return sorted;
    }

    function render() {
      var filtered = applySort(applyFilters(allItems));
      countEl.textContent = STR.count(filtered.length, allItems.length);
      if (!filtered.length) {
        resultsEl.innerHTML = '<p class="kk-empty">' + STR.empty + '</p>';
        return;
      }
      resultsEl.innerHTML = filtered.map(cardHtml).join('');
      Array.prototype.forEach.call(resultsEl.querySelectorAll('[data-toggle]'), function (btn) {
        btn.addEventListener('click', function () {
          var details = btn.nextElementSibling;
          var isHidden = details.hasAttribute('hidden');
          if (isHidden) { details.removeAttribute('hidden'); btn.textContent = STR.detailsLess + ' ▴'; }
          else { details.setAttribute('hidden', ''); btn.textContent = STR.detailsMore + ' ▾'; }
        });
      });
    }

    if (noParentCheck) noParentCheck.addEventListener('change', render);
    if (rateSelect) rateSelect.addEventListener('change', render);
    if (sortSelect) sortSelect.addEventListener('change', render);
    if (resetBtn) resetBtn.addEventListener('click', function () {
      noParentCheck.checked = false;
      rateSelect.value = 'alle';
      sortSelect.value = 'rate';
      render();
    });

    if (window.kkSkeletonHtml) resultsEl.innerHTML = window.kkSkeletonHtml(5);
    fetch(source).then(function (r) { return r.json(); }).then(function (data) {
      allItems = data.items;
      var lastUpdatedEl = document.getElementById('kinderdepot-last-updated');
      if (lastUpdatedEl) lastUpdatedEl.textContent = data.updated;
      render();
      if (window.kkScrollToHash) window.kkScrollToHash();
    });
  });
})();
