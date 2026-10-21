(function () {
  var LANG = document.documentElement.lang === 'en' ? 'en' : 'de';
  var STR = LANG === 'en' ? {
    count: function (n, total) { return n + ' of ' + total + ' brokers'; },
    reset: 'Reset filters',
    sortName: 'Sort: Name A–Z',
    empty: 'No broker matches these filters. Try removing one.',
    feeLabel: 'Advice',
    partnersLabel: 'Partner banks',
    locationsLabel: 'Locations',
    detailsMore: 'More details',
    detailsLess: 'Fewer details',
    cta: 'Request a quote',
    sourceLabel: 'Sources'
  } : {
    count: function (n, total) { return n + ' von ' + total + ' Vermittlern'; },
    reset: 'Filter zurücksetzen',
    sortName: 'Sortieren: Name A–Z',
    empty: 'Kein Vermittler passt zu diesen Filtern. Entferne einen Filter.',
    feeLabel: 'Beratung',
    partnersLabel: 'Partnerbanken',
    locationsLabel: 'Standorte',
    detailsMore: 'Mehr Details',
    detailsLess: 'Weniger Details',
    cta: 'Angebot anfragen',
    sourceLabel: 'Quellen'
  };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function bulletsFor(item) {
    var bullets = [];
    bullets.push({ ok: true, text: item.partnerbankenText });
    bullets.push({ ok: true, text: item.standorteText });
    bullets.push({ ok: true, text: item.beratungText });
    if (item.besonderheitenText) bullets.push({ ok: true, text: item.besonderheitenText });
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
      '<article class="kk-card" id="' + escapeHtml(item.id) + '">' +
      '<div class="cc-badges"><span class="cc-badge">' + escapeHtml(item.name) + '</span></div>' +
      '<div class="cc-body">' +
      cardArtHtml(item) +
      '<div class="cc-main"><div class="cc-name">' + escapeHtml(item.name) + '</div>' +
      '<ul class="cc-bullets">' + bulletsHtml + '</ul></div>' +
      '<div class="cc-cta-col"><a href="' + escapeHtml(item.affiliateUrl) + '" class="cta-btn" rel="sponsored nofollow">' + STR.cta + '</a></div>' +
      '</div>' +
      '<hr class="cc-divider">' +
      '<button type="button" class="kk-toggle" data-toggle>' + STR.detailsMore + ' ▾</button>' +
      '<div class="kk-card-details side-facts" hidden>' +
      '<div><span class="k">' + STR.sourceLabel + '</span><span class="v">' + escapeHtml(item.sourcesNote || '') + '</span></div>' +
      '</div>' +
      '</article>'
    );
  }

  document.addEventListener('DOMContentLoaded', function () {
    var app = document.getElementById('baufi-app');
    if (!app) return;
    var source = app.getAttribute('data-source');
    var resultsEl = document.getElementById('baufi-results');
    var countEl = document.getElementById('baufi-count');
    var resetBtn = document.getElementById('baufi-reset');
    var sortSelect = document.getElementById('baufi-sort-select');

    var allItems = [];

    function applySort(items) {
      var sorted = items.slice();
      sorted.sort(function (a, b) { return a.name.localeCompare(b.name); });
      return sorted;
    }

    function render() {
      var filtered = applySort(allItems);
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

    if (sortSelect) sortSelect.addEventListener('change', render);
    if (resetBtn) resetBtn.addEventListener('click', render);

    if (window.kkSkeletonHtml) resultsEl.innerHTML = window.kkSkeletonHtml(4);
    fetch(source).then(function (r) { return r.json(); }).then(function (data) {
      allItems = data.items;
      var lastUpdatedEl = document.getElementById('baufi-last-updated');
      if (lastUpdatedEl) lastUpdatedEl.textContent = data.updated;
      render();
      if (window.kkScrollToHash) window.kkScrollToHash();
    });
  });
})();
