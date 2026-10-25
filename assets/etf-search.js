(function () {
  var LANG = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0 ? 'en' : 'de';

  var STR = {
    de: {
      loading: 'Lade ETFs …',
      error: 'Die Daten konnten nicht geladen werden.',
      resultCount: function (n) { return n === 1 ? '1 ETF' : n + ' ETFs'; },
      noResults: 'Keine ETFs gefunden. Versuche, einen Filter zu entfernen.',
      reset: 'Filter zurücksetzen',
      moreDetails: 'Details',
      lessDetails: 'Details ausblenden',
      isin: 'ISIN',
      index: 'Index',
      domizil: 'Fondsdomizil',
      waehrung: 'Fondswährung',
      auflagejahr: 'Auflagejahr',
      anbieter: 'Anbieter',
      table: { name: 'ETF', klasse: 'Anlageklasse / Region', ter: 'TER p. a.', replikation: 'Replikation', ausschuettung: 'Ertragsverwendung', groesse: 'Fondsgröße' },
      sortedAsc: function (col) { return 'Sortiert nach ' + col + ', aufsteigend. Klicken für absteigend.'; },
      sortedDesc: function (col) { return 'Sortiert nach ' + col + ', absteigend. Klicken für aufsteigend.'; },
      sortBy: function (col) { return 'Sortieren nach ' + col; },
      groesseLabel: { klein: 'klein (< 1 Mrd. €)', mittel: 'mittel (1–10 Mrd. €)', gross: 'groß (10–50 Mrd. €)', sehrgross: 'sehr groß (> 50 Mrd. €)' },
      alterLabel: { lt5: 'jünger als 5 Jahre', '5bis10': '5–10 Jahre', gt10: 'älter als 10 Jahre' }
    },
    en: {
      loading: 'Loading ETFs …',
      error: 'Could not load the data.',
      resultCount: function (n) { return n === 1 ? '1 ETF' : n + ' ETFs'; },
      noResults: 'No ETFs found. Try removing a filter.',
      reset: 'Reset filters',
      moreDetails: 'Details',
      lessDetails: 'Hide details',
      isin: 'ISIN',
      index: 'Index',
      domizil: 'Fund domicile',
      waehrung: 'Fund currency',
      auflagejahr: 'Inception year',
      anbieter: 'Provider',
      table: { name: 'ETF', klasse: 'Asset class / Region', ter: 'TER p.a.', replikation: 'Replication', ausschuettung: 'Distribution', groesse: 'Fund size' },
      sortedAsc: function (col) { return 'Sorted by ' + col + ', ascending. Click for descending.'; },
      sortedDesc: function (col) { return 'Sorted by ' + col + ', descending. Click for ascending.'; },
      sortBy: function (col) { return 'Sort by ' + col; },
      groesseLabel: { klein: 'small (< €1bn)', mittel: 'medium (€1–10bn)', gross: 'large (€10–50bn)', sehrgross: 'very large (> €50bn)' },
      alterLabel: { lt5: 'under 5 years', '5bis10': '5–10 years', gt10: 'over 10 years' }
    }
  }[LANG];

  var GROESSE_ORDER = { klein: 0, mittel: 1, gross: 2, sehrgross: 3 };

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function init() {
    var app = document.getElementById('etf-app');
    if (!app) return;
    var src = app.getAttribute('data-source');
    var resultsEl = document.getElementById('etf-results');
    var countEl = document.getElementById('etf-count');
    var resetBtn = document.getElementById('etf-reset');

    var klasseChips = document.querySelectorAll('[data-filter="anlageklasse"]');
    var providerChecks = document.querySelectorAll('input[data-filter="anbieter"]');
    var replikationChecks = document.querySelectorAll('input[data-filter="replikation"]');
    var ausschuettungChecks = document.querySelectorAll('input[data-filter="ausschuettung"]');
    var terSelect = document.getElementById('etf-ter-select');
    var groesseSelect = document.getElementById('etf-groesse-select');
    var alterSelect = document.getElementById('etf-alter-select');

    var allItems = [];
    var expanded = {};
    var activeKlasse = 'Alle';

    var SORT_ACCESSORS = {
      name: function (it) { return it.name.toLowerCase(); },
      klasse: function (it) { return (it.anlageklasse + ' ' + it.region).toLowerCase(); },
      ter: function (it) { return it.ter; },
      replikation: function (it) { return (it.replikationDetail || it.replikation || '').toLowerCase(); },
      ausschuettung: function (it) { return (it.ausschuettung || '').toLowerCase(); },
      groesse: function (it) { return GROESSE_ORDER[it.fondsgroesse]; }
    };
    var SORT_DEFAULT_DIR = { name: 'asc', klasse: 'asc', ter: 'asc', replikation: 'asc', ausschuettung: 'asc', groesse: 'desc' };
    var sortKey = 'ter';
    var sortDir = 'asc';

    function klasseOf(item) { return item.anlageklasse; }

    function applyFilters(items) {
      var checkedProviders = Array.prototype.filter.call(providerChecks, function (c) { return c.checked; }).map(function (c) { return c.value; });
      var checkedRepl = Array.prototype.filter.call(replikationChecks, function (c) { return c.checked; }).map(function (c) { return c.value; });
      var checkedAussch = Array.prototype.filter.call(ausschuettungChecks, function (c) { return c.checked; }).map(function (c) { return c.value; });
      var maxTer = parseFloat(terSelect.value);
      var minGroesse = groesseSelect.value;
      var alter = alterSelect.value;

      return items.filter(function (it) {
        if (activeKlasse !== 'Alle' && it.anlageklasse !== activeKlasse) return false;
        if (checkedProviders.length && checkedProviders.indexOf(it.provider) === -1) return false;
        if (checkedRepl.length && checkedRepl.indexOf(it.replikation) === -1) return false;
        if (checkedAussch.length && checkedAussch.indexOf(it.ausschuettung) === -1) return false;
        if (!isNaN(maxTer) && it.ter > maxTer) return false;
        if (minGroesse !== 'alle' && GROESSE_ORDER[it.fondsgroesse] < GROESSE_ORDER[minGroesse]) return false;
        if (alter !== 'alle' && it.fondsalter !== alter) return false;
        return true;
      });
    }

    function sortItems(items) {
      var accessor = SORT_ACCESSORS[sortKey] || SORT_ACCESSORS.ter;
      var copy = items.slice();
      copy.sort(function (a, b) {
        var av = accessor(a), bv = accessor(b);
        var cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
        return sortDir === 'asc' ? cmp : -cmp;
      });
      return copy;
    }

    function detailsHtml(item) {
      return '<div class="kk-card-details side-facts">' +
        '<div class="sf-row"><span class="k">' + STR.isin + '</span><span class="v">' + escapeHtml(item.isin) + '</span></div>' +
        '<div class="sf-row"><span class="k">' + STR.index + '</span><span class="v">' + escapeHtml(item.index) + '</span></div>' +
        '<div class="sf-row"><span class="k">' + STR.anbieter + '</span><span class="v">' + escapeHtml(item.provider) + '</span></div>' +
        '<div class="sf-row"><span class="k">' + STR.domizil + '</span><span class="v">' + escapeHtml(item.domizil) + '</span></div>' +
        '<div class="sf-row"><span class="k">' + STR.waehrung + '</span><span class="v">' + escapeHtml(item.waehrung) + '</span></div>' +
        '<div class="sf-row"><span class="k">' + STR.auflagejahr + '</span><span class="v">' + item.auflagejahr + '</span></div>' +
      '</div>';
    }

    function rowHtml(item) {
      var isOpen = !!expanded[item.id];
      return '<tr>' +
        '<td><div class="broker-cell"><div class="broker-mark" style="background:' + item.color + '">' + escapeHtml(item.providerInitials) + '</div>' +
          '<div><div class="broker-name">' + escapeHtml(item.name) + '</div>' +
          '<div class="cell-sub">' + escapeHtml(item.isin) + '</div></div></div></td>' +
        '<td>' + escapeHtml(item.anlageklasse) + '<div class="cell-sub">' + escapeHtml(item.region) + '</div></td>' +
        '<td>' + item.ter.toFixed(2).replace('.', LANG === 'de' ? ',' : '.') + ' %</td>' +
        '<td>' + escapeHtml(item.replikationDetail) + '</td>' +
        '<td>' + escapeHtml(item.ausschuettung) + '</td>' +
        '<td>' + escapeHtml(STR.groesseLabel[item.fondsgroesse]) + '</td>' +
        '<td><button type="button" class="kk-toggle" data-id="' + item.id + '">' + (isOpen ? STR.lessDetails : STR.moreDetails) + '</button></td>' +
        '</tr>' +
        (isOpen ? '<tr class="etf-detail-row"><td colspan="7">' + detailsHtml(item) + '</td></tr>' : '');
    }

    function render() {
      var filtered = sortItems(applyFilters(allItems));
      countEl.textContent = STR.resultCount(filtered.length);

      if (!filtered.length) {
        resultsEl.innerHTML = '<div class="kk-empty">' + STR.noResults + '</div>';
        return;
      }

      var html = '<div class="table-scroll"><table class="compare"><thead><tr>' +
        ['name', 'klasse', 'ter', 'replikation', 'ausschuettung', 'groesse'].map(sortThHtml).join('') +
        '<th></th></tr></thead><tbody>';
      filtered.forEach(function (item) { html += rowHtml(item); });
      html += '</tbody></table></div>';
      resultsEl.innerHTML = html;

      Array.prototype.forEach.call(resultsEl.querySelectorAll('.kk-toggle'), function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-id');
          expanded[id] = !expanded[id];
          render();
        });
      });

      Array.prototype.forEach.call(resultsEl.querySelectorAll('[data-sort]'), function (th) {
        var activateSort = function () {
          var key = th.getAttribute('data-sort');
          if (sortKey === key) {
            sortDir = sortDir === 'asc' ? 'desc' : 'asc';
          } else {
            sortKey = key;
            sortDir = SORT_DEFAULT_DIR[key] || 'asc';
          }
          render();
        };
        th.addEventListener('click', activateSort);
        th.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateSort(); }
        });
      });
    }

    function sortThHtml(key) {
      var label = STR.table[key];
      var active = sortKey === key;
      var arrow = active ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';
      var ariaLabel = active ? (sortDir === 'asc' ? STR.sortedAsc(label) : STR.sortedDesc(label)) : STR.sortBy(label);
      return '<th class="etf-sort-th' + (active ? ' active' : '') + '" data-sort="' + key + '" tabindex="0" role="button" aria-label="' + escapeHtml(ariaLabel) + '">' + escapeHtml(label) + '<span class="etf-sort-arrow">' + arrow + '</span></th>';
    }

    Array.prototype.forEach.call(klasseChips, function (chip) {
      chip.addEventListener('click', function () {
        activeKlasse = chip.getAttribute('data-value');
        Array.prototype.forEach.call(klasseChips, function (c) { c.classList.toggle('active', c === chip); });
        render();
      });
    });

    [].concat(
      Array.prototype.slice.call(providerChecks),
      Array.prototype.slice.call(replikationChecks),
      Array.prototype.slice.call(ausschuettungChecks)
    ).forEach(function (el) { el.addEventListener('change', render); });

    [terSelect, groesseSelect, alterSelect].forEach(function (el) {
      if (el) el.addEventListener('change', render);
    });

    resetBtn.addEventListener('click', function () {
      Array.prototype.forEach.call(providerChecks, function (c) { c.checked = false; });
      Array.prototype.forEach.call(replikationChecks, function (c) { c.checked = false; });
      Array.prototype.forEach.call(ausschuettungChecks, function (c) { c.checked = false; });
      terSelect.value = 'alle';
      groesseSelect.value = 'alle';
      alterSelect.value = 'alle';
      sortKey = 'ter';
      sortDir = 'asc';
      activeKlasse = 'Alle';
      Array.prototype.forEach.call(klasseChips, function (c) { c.classList.toggle('active', c.getAttribute('data-value') === 'Alle'); });
      render();
    });

    resultsEl.innerHTML = window.kkSkeletonHtml ? window.kkSkeletonHtml(5) : '<div class="kk-empty">' + STR.loading + '</div>';
    fetch(src).then(function (r) { return r.json(); }).then(function (data) {
      allItems = data.items;
      var lastUpdatedEl = document.getElementById('etf-last-updated');
      if (lastUpdatedEl) lastUpdatedEl.textContent = data.updated;
      render();
    }).catch(function () {
      resultsEl.innerHTML = '<div class="kk-empty">' + STR.error + '</div>';
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
