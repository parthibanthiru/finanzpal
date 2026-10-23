(function () {
  var LANG = document.documentElement.lang === 'en' ? 'en' : 'de';
  var STR = LANG === 'en' ? {
    count: function (n, total) { return n + ' of ' + total + ' brokers'; },
    reset: 'Reset filters',
    sortFee: 'Sort: Savings rate ascending',
    sortName: 'Sort: Name A–Z',
    sortZins: 'Sort: Cash interest descending',
    sortRating: 'Sort: Rating descending',
    empty: 'No broker matches these filters. Try removing one.',
    etfText: function (item) {
      return item.etfSparplaeneAnzahl.toLocaleString('en-US') + ' ETF savings plans' + (item.etfSparplaeneKostenlos ? ', fee-free' : '');
    },
    mindestsparrate: function (n) { return 'Minimum savings rate: from €' + n + '/plan'; },
    depotfree: 'Account maintenance free of charge, no conditions',
    recommended: 'Our recommendation',
    zinsText: function (item) {
      var txt = item.guthabenzins + '% p.a. cash interest';
      if (item.guthabenzinsLimitText) txt += ' (' + item.guthabenzinsLimitText + ')';
      return txt;
    },
    depotLabel: 'Account fee',
    orderLabel: 'Order fee (share)',
    rateLabel: 'Min. savings rate',
    zinsLabel: 'Cash interest',
    ratingLabel: 'Rating',
    verwahrLabel: 'Custody fee',
    intervalLabel: 'Execution intervals',
    detailsMore: 'More details',
    detailsLess: 'Fewer details',
    cta: 'View provider',
    ctaAria: function (name) { return 'View provider: ' + name; },
    reviewLink: 'Read our full review →',
    provider: 'Provider',
    scoreTooltip: function (b) {
      return 'Finanzpal Score: Account fee ' + b.depotgebuehr + ' · ETF savings plan offer ' + b.etfSparplaene + ' · Cash interest ' + b.guthabenzins + ' · Min. savings rate ' + b.mindestsparrate + ' (each out of 100). Methodology: ueber-uns.html#finanzpal-score';
    },
    scoreLabels: { depotgebuehr: 'Account fee', etfSparplaene: 'ETF savings plan offer', guthabenzins: 'Cash interest', mindestsparrate: 'Min. savings rate' }
  } : {
    count: function (n, total) { return n + ' von ' + total + ' Brokern'; },
    reset: 'Filter zurücksetzen',
    sortFee: 'Sortieren: Mindestsparrate aufsteigend',
    sortName: 'Sortieren: Name A–Z',
    sortZins: 'Sortieren: Guthabenzins absteigend',
    sortRating: 'Sortieren: Bewertung absteigend',
    empty: 'Kein Broker passt zu diesen Filtern. Entferne einen Filter.',
    etfText: function (item) {
      return item.etfSparplaeneAnzahl.toLocaleString('de-DE') + ' ETF-Sparpläne' + (item.etfSparplaeneKostenlos ? ', kostenlos besparbar' : '');
    },
    mindestsparrate: function (n) { return 'Mindestsparrate: ab ' + n + ' €/Sparplan'; },
    depotfree: 'Depotführung kostenlos, ohne Bedingungen',
    recommended: 'Unsere Empfehlung',
    zinsText: function (item) {
      var txt = item.guthabenzins + ' % p. a. Guthabenzins';
      if (item.guthabenzinsLimitText) txt += ' (' + item.guthabenzinsLimitText + ')';
      return txt;
    },
    depotLabel: 'Depotgebühr',
    orderLabel: 'Ordergebühr (Aktie)',
    rateLabel: 'Mind. Sparrate',
    zinsLabel: 'Guthabenzins',
    ratingLabel: 'Bewertung',
    verwahrLabel: 'Verwahrentgelt',
    intervalLabel: 'Ausführungsintervalle',
    detailsMore: 'Mehr Details',
    detailsLess: 'Weniger Details',
    cta: 'Zum Anbieter',
    ctaAria: function (name) { return 'Zum Anbieter: ' + name; },
    reviewLink: 'Unseren ausführlichen Test lesen →',
    provider: 'Anbieter',
    scoreTooltip: function (b) {
      return 'Finanzpal-Score: Depotgebühr ' + b.depotgebuehr + ' · ETF-Sparplan-Angebot ' + b.etfSparplaene + ' · Guthabenzins ' + b.guthabenzins + ' · Mindestsparrate ' + b.mindestsparrate + ' (je von 100). Methodik: ueber-uns.html#finanzpal-score';
    },
    scoreLabels: { depotgebuehr: 'Depotgebühr', etfSparplaene: 'ETF-Sparplan-Angebot', guthabenzins: 'Guthabenzins', mindestsparrate: 'Mindestsparrate' }
  };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
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

  var SCORE_RING_R = 8;
  var SCORE_RING_C = 2 * Math.PI * SCORE_RING_R;

  function scoreBadgeHtml(item) {
    if (!item.score) return '';
    var band = (item.score.band || '').toLowerCase();
    var value = item.score.value;
    var title = STR.scoreTooltip(item.score.breakdown || {});
    var rowsJson = escapeHtml(JSON.stringify(scoreBreakdownRows(item.score.breakdown || {})));
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

  function bulletsFor(item) {
    var bullets = [];
    bullets.push({ ok: true, text: STR.etfText(item) + (item.etfSparplaeneCaveat ? ' — ' + item.etfSparplaeneCaveat : '') });
    bullets.push({ ok: true, text: STR.mindestsparrate(item.mindestsparrate) });
    if (item.intervalleText) bullets.push({ ok: true, text: item.intervalleText });
    if (item.guthabenzins) {
      bullets.push({ ok: true, text: STR.zinsText(item) + (item.guthabenzinsCaveat ? ' — ' + item.guthabenzinsCaveat : '') });
    } else if (item.guthabenzinsCaveat) {
      bullets.push({ ok: false, text: item.guthabenzinsCaveat });
    }
    bullets.push({ ok: item.depotgebuehrBedingungslos, text: item.verwahrentgeltText });
    return bullets;
  }

  function cardArtHtml(item) {
    return '<div class="cc-art" style="background:' + (item.color || '#163A66') + ';">' + escapeHtml(item.initials) + '</div>';
  }

  function cardHtml(item) {
    var bullets = bulletsFor(item);
    var bulletsHtml = bullets.map(function (b) {
      return '<li class="' + (b.ok ? 'ok' : 'info') + '"><span class="cc-icon">' + (b.ok ? '✓' : 'i') + '</span>' + escapeHtml(b.text) + '</li>';
    }).join('');
    var crossLinkHtml = window.kkCrossLinkHtml ? window.kkCrossLinkHtml('broker', item.id, LANG) : '';
    var reviewLinkHtml = item.detailUrl
      ? '<a class="cc-review-link" href="' + escapeHtml(item.detailUrl) + '">' + STR.reviewLink + '</a>'
      : '';
    return (
      '<article class="kk-card" id="' + escapeHtml(item.id) + '">' +
      '<div class="cc-badges"><span class="cc-badge">' + escapeHtml(item.name) + '</span>' +
      (item.recommended ? '<span class="cc-badge debit">' + escapeHtml(STR.recommended) + '</span>' : '') +
      (item.depotgebuehrBedingungslos ? '<span class="cc-badge debit">' + escapeHtml(STR.depotfree) + '</span>' : '') +
      '</div>' +
      '<div class="cc-body">' +
      cardArtHtml(item) +
      '<div class="cc-main"><div class="cc-name">' + escapeHtml(item.name) + scoreBadgeHtml(item) +
      (item.ratingStars ? ' <span class="cc-stars" title="' + item.rating + '/5">' + escapeHtml(item.ratingStars) + '</span>' : '') +
      '</div>' +
      '<ul class="cc-bullets">' + bulletsHtml + '</ul>' + crossLinkHtml + reviewLinkHtml + '</div>' +
      '<div class="cc-facts">' +
      '<div class="cc-fact"><span class="k">' + STR.depotLabel + '</span><span class="v">' + escapeHtml(item.brokerDepotfee) + '</span></div>' +
      '<div class="cc-fact"><span class="k">' + STR.orderLabel + '</span><span class="v">' + escapeHtml(item.orderfee) + '</span></div>' +
      '<div class="cc-fact"><span class="k">' + STR.rateLabel + '</span><span class="v">' + escapeHtml(item.sparplanAb) + '</span></div>' +
      '</div>' +
      '<div class="cc-cta-col"><a href="' + escapeHtml(item.affiliateUrl) + '" class="cta-btn" rel="sponsored nofollow" aria-label="' + escapeHtml(STR.ctaAria(item.name)) + '">' + STR.cta + '</a></div>' +
      '</div>' +
      '<hr class="cc-divider">' +
      '<button type="button" class="kk-toggle" data-toggle>' + STR.detailsMore + ' ▾</button>' +
      '<div class="kk-card-details side-facts" hidden>' +
      '<div><span class="k">' + STR.zinsLabel + '</span><span class="v">' + (item.guthabenzins ? item.guthabenzins + ' %' : '—') + '</span></div>' +
      '<div><span class="k">' + STR.verwahrLabel + '</span><span class="v">' + escapeHtml(item.verwahrentgeltText || '—') + '</span></div>' +
      '<div><span class="k">' + STR.intervalLabel + '</span><span class="v">' + escapeHtml(item.intervalleText || '—') + '</span></div>' +
      (item.ratingStars ? '<div><span class="k">' + STR.ratingLabel + '</span><span class="v">' + item.rating + ' / 5 (' + escapeHtml(item.ratingStars) + ')</span></div>' : '') +
      '</div>' +
      '</article>'
    );
  }

  document.addEventListener('DOMContentLoaded', function () {
    var app = document.getElementById('broker-app');
    if (!app) return;
    var source = app.getAttribute('data-source');
    var resultsEl = document.getElementById('broker-results');
    var countEl = document.getElementById('broker-count');
    var resetBtn = document.getElementById('broker-reset');
    var sortSelect = document.getElementById('broker-sort-select');
    var freeCheck = document.getElementById('broker-filter-frei');
    var zinsCheck = document.getElementById('broker-filter-zins');
    var rateSelect = document.getElementById('broker-rate-select');

    var allItems = [];

    function applyFilters(items) {
      var maxRate = parseFloat(rateSelect.value);
      return items.filter(function (item) {
        if (freeCheck.checked && !item.depotgebuehrBedingungslos) return false;
        if (zinsCheck.checked && !(item.guthabenzins > 0)) return false;
        if (!isNaN(maxRate) && item.mindestsparrate > maxRate) return false;
        return true;
      });
    }

    function applySort(items) {
      var sorted = items.slice();
      if (sortSelect.value === 'name') {
        sorted.sort(function (a, b) { return a.name.localeCompare(b.name); });
      } else if (sortSelect.value === 'zins') {
        sorted.sort(function (a, b) { return (b.guthabenzins || 0) - (a.guthabenzins || 0); });
      } else if (sortSelect.value === 'rating') {
        sorted.sort(function (a, b) { return (b.rating || 0) - (a.rating || 0); });
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

    [freeCheck, zinsCheck].forEach(function (el) { if (el) el.addEventListener('change', render); });
    if (rateSelect) rateSelect.addEventListener('change', render);
    if (sortSelect) sortSelect.addEventListener('change', render);
    if (resetBtn) resetBtn.addEventListener('click', function () {
      freeCheck.checked = false;
      zinsCheck.checked = false;
      rateSelect.value = 'alle';
      sortSelect.value = 'rate';
      render();
    });

    if (window.kkSkeletonHtml) resultsEl.innerHTML = window.kkSkeletonHtml(5);
    fetch(source).then(function (r) { return r.json(); }).then(function (data) {
      allItems = data.items;
      var lastUpdatedEl = document.getElementById('broker-last-updated');
      if (lastUpdatedEl) lastUpdatedEl.textContent = data.updated;
      render();
      if (window.kkScrollToHash) window.kkScrollToHash();
    });
  });
})();
