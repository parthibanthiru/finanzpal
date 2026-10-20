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
    var sortSelect = document.getElementById('etf-sort-select');

    var allItems = [];
    var expanded = {};
    var activeKlasse = 'Alle';

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
      var mode = sortSelect ? sortSelect.value : 'ter';
      var copy = items.slice();
      if (mode === 'ter') copy.sort(function (a, b) { return a.ter - b.ter; });
      else if (mode === 'name') copy.sort(function (a, b) { return a.name.localeCompare(b.name); });
      else if (mode === 'groesse') copy.sort(function (a, b) { return GROESSE_ORDER[b.fondsgroesse] - GROESSE_ORDER[a.fondsgroesse]; });
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

      var html = '<div class="table-scroll"><table class="compare">' +
        '<thead><tr><th>' + STR.table.name + '</th><th>' + STR.table.klasse + '</th><th>' + STR.table.ter + '</th><th>' + STR.table.replikation + '</th><th>' + STR.table.ausschuettung + '</th><th>' + STR.table.groesse + '</th><th></th></tr></thead><tbody>';
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

    [terSelect, groesseSelect, alterSelect, sortSelect].forEach(function (el) {
      if (el) el.addEventListener('change', render);
    });

    resetBtn.addEventListener('click', function () {
      Array.prototype.forEach.call(providerChecks, function (c) { c.checked = false; });
      Array.prototype.forEach.call(replikationChecks, function (c) { c.checked = false; });
      Array.prototype.forEach.call(ausschuettungChecks, function (c) { c.checked = false; });
      terSelect.value = 'alle';
      groesseSelect.value = 'alle';
      alterSelect.value = 'alle';
      if (sortSelect) sortSelect.value = 'ter';
      activeKlasse = 'Alle';
      Array.prototype.forEach.call(klasseChips, function (c) { c.classList.toggle('active', c.getAttribute('data-value') === 'Alle'); });
      render();
    });

    resultsEl.innerHTML = '<div class="kk-empty">' + STR.loading + '</div>';
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
