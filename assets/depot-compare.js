(function () {
  var LANG = document.documentElement.lang === 'en' ? 'en' : 'de';
  var STR = LANG === 'en' ? {
    count: function (n, total) { return n + ' of ' + total + ' custody accounts'; },
    reset: 'Reset filters',
    sortFee: 'Sort: Savings rate ascending',
    sortName: 'Sort: Name A–Z',
    sortZins: 'Sort: Cash interest descending',
    empty: 'No custody account matches these filters. Try removing one.',
    etfText: function (item) {
      var txt = item.etfSparplaeneAnzahl.toLocaleString('en-US') + ' ETF savings plans' + (item.etfSparplaeneKostenlos ? ', fee-free' : '');
      return txt;
    },
    mindestsparrate: function (n) { return 'Minimum savings rate: from €' + n + '/plan'; },
    depotfree: 'Account maintenance free of charge, no conditions',
    zinsText: function (item) {
      var txt = item.guthabenzins + '% p.a. cash interest';
      if (item.guthabenzinsLimitText) txt += ' (' + item.guthabenzinsLimitText + ')';
      return txt;
    },
    zinsLabel: 'Cash interest',
    feeLabel: 'Account fee',
    rateLabel: 'Min. savings rate',
    detailsMore: 'More details',
    detailsLess: 'Fewer details',
    cta: 'View offer',
    provider: 'Provider'
  } : {
    count: function (n, total) { return n + ' von ' + total + ' Depots'; },
    reset: 'Filter zurücksetzen',
    sortFee: 'Sortieren: Mindestsparrate aufsteigend',
    sortName: 'Sortieren: Name A–Z',
    sortZins: 'Sortieren: Guthabenzins absteigend',
    empty: 'Kein Depot passt zu diesen Filtern. Entferne einen Filter.',
    etfText: function (item) {
      var txt = item.etfSparplaeneAnzahl.toLocaleString('de-DE') + ' ETF-Sparpläne' + (item.etfSparplaeneKostenlos ? ', kostenlos besparbar' : '');
      return txt;
    },
    mindestsparrate: function (n) { return 'Mindestsparrate: ab ' + n + ' €/Sparplan'; },
    depotfree: 'Depotführung kostenlos, ohne Bedingungen',
    zinsText: function (item) {
      var txt = item.guthabenzins + ' % p. a. Guthabenzins';
      if (item.guthabenzinsLimitText) txt += ' (' + item.guthabenzinsLimitText + ')';
      return txt;
    },
    zinsLabel: 'Guthabenzins',
    feeLabel: 'Depotgebühr',
    rateLabel: 'Mind. Sparrate',
    detailsMore: 'Mehr Details',
    detailsLess: 'Weniger Details',
    cta: 'Zum Anbieter',
    provider: 'Anbieter'
  };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function bulletsFor(item) {
    var bullets = [];
    bullets.push({ ok: true, text: STR.etfText(item) + (item.etfSparplaeneCaveat ? ' — ' + item.etfSparplaeneCaveat : '') });
    bullets.push({ ok: true, text: STR.mindestsparrate(item.mindestsparrate) });
    bullets.push({ ok: true, text: item.intervalleText });
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
    return (
      '<article class="kk-card">' +
      '<div class="cc-badges"><span class="cc-badge">' + escapeHtml(item.name) + '</span>' +
      (item.depotgebuehrBedingungslos ? '<span class="cc-badge debit">' + escapeHtml(STR.depotfree) + '</span>' : '') +
      '</div>' +
      '<div class="cc-body">' +
      cardArtHtml(item) +
      '<div class="cc-main"><div class="cc-name">' + escapeHtml(item.name) + '</div>' +
      '<ul class="cc-bullets">' + bulletsHtml + '</ul></div>' +
      '<div class="cc-facts">' +
      '<div class="cc-fact"><span class="k">' + STR.feeLabel + '</span><span class="v">' + escapeHtml(item.depotgebuehrText) + '</span></div>' +
      '<div class="cc-fact"><span class="k">' + STR.rateLabel + '</span><span class="v">' + item.mindestsparrate + ' €</span></div>' +
      '</div>' +
      '<div class="cc-cta-col"><a href="' + escapeHtml(item.affiliateUrl) + '" class="cta-btn" rel="sponsored nofollow">' + STR.cta + '</a></div>' +
      '</div>' +
      '<hr class="cc-divider">' +
      '<button type="button" class="kk-toggle" data-toggle>' + STR.detailsMore + ' ▾</button>' +
      '<div class="kk-card-details side-facts" hidden>' +
      '<div><span class="k">' + STR.provider + '</span><span class="v">' + escapeHtml(item.name) + '</span></div>' +
      '</div>' +
      '</article>'
    );
  }

  document.addEventListener('DOMContentLoaded', function () {
    var app = document.getElementById('depot-app');
    if (!app) return;
    var source = app.getAttribute('data-source');
    var resultsEl = document.getElementById('depot-results');
    var countEl = document.getElementById('depot-count');
    var resetBtn = document.getElementById('depot-reset');
    var sortSelect = document.getElementById('depot-sort-select');
    var freeCheck = document.getElementById('depot-filter-frei');
    var zinsCheck = document.getElementById('depot-filter-zins');
    var rateSelect = document.getElementById('depot-rate-select');

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

    Array.prototype.forEach.call(document.querySelectorAll('#depot-app ~ aside input, .kk-filters input, .kk-filters select'), function () {});
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

    fetch(source).then(function (r) { return r.json(); }).then(function (data) {
      allItems = data.items;
      var lastUpdatedEl = document.getElementById('depot-last-updated');
      if (lastUpdatedEl) lastUpdatedEl.textContent = data.updated;
      render();
    });
  });
})();
