// Powers the filter chips and quick calculator on kredite.html (+ en/).
// Waits for assets/compare.js to render the Kredite table (it dispatches
// "fpcompare:rendered" on the <table> once rows are in the DOM), then reads
// the data-* attributes compare.js embedded on each <tr> (amount/term range,
// Sondertilgung-frei, Bearbeitungsgebuehr-frei) rather than fetching or
// parsing anything itself.
(function () {
  var LANG = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0 ? 'en' : 'de';

  var STR = LANG === 'en' ? {
    noMatch: 'No loan in our comparison currently covers that amount/term combination — try a different amount or term.',
    match: function (n) {
      return n === 1
        ? '1 provider covers this amount and term — highlighted below.'
        : n + ' providers cover this amount and term — highlighted below.';
    }
  } : {
    noMatch: 'Kein Kredit in unserem Vergleich deckt diese Kombination aus Betrag und Laufzeit ab – versuchen Sie einen anderen Betrag oder eine andere Laufzeit.',
    match: function (n) {
      return n === 1
        ? '1 Anbieter deckt diesen Betrag und diese Laufzeit ab – unten markiert.'
        : n + ' Anbieter decken diesen Betrag und diese Laufzeit ab – unten markiert.';
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    var table = document.querySelector('table.compare[data-type="kredite"]');
    if (!table) return;

    var filterBar = document.querySelector('.filters');
    var chips = filterBar ? Array.prototype.slice.call(filterBar.querySelectorAll('.chip[data-filter]')) : [];
    var activeFilter = '';

    var amountSel = document.getElementById('kredit-calc-amount');
    var termSel = document.getElementById('kredit-calc-term');
    var calcBtn = document.getElementById('kredit-calc-btn');
    var resultEl = document.getElementById('kredit-calc-result');

    function rows() {
      return Array.prototype.slice.call(table.querySelectorAll('tbody tr[data-amount-min]'));
    }

    function rowMatchesFilter(row, filter) {
      if (!filter) return true;
      if (filter === 'bearbeitungsgebuehr') return row.getAttribute('data-bearbeitungsgebuehr-frei') === '1';
      if (filter === 'sondertilgung') return row.getAttribute('data-sondertilgung-frei') === '1';
      return true;
    }

    function applyFilter(filter) {
      activeFilter = filter;
      rows().forEach(function (row) {
        row.hidden = !rowMatchesFilter(row, filter);
      });
      chips.forEach(function (chip) {
        var on = chip.getAttribute('data-filter') === filter;
        chip.classList.toggle('active', on);
        chip.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        applyFilter(chip.getAttribute('data-filter') || '');
      });
    });

    function runCalc() {
      if (!amountSel || !termSel || !resultEl) return;
      var amount = parseInt(amountSel.value, 10);
      var term = parseInt(termSel.value, 10);
      var matches = [];
      rows().forEach(function (row) {
        row.classList.remove('calc-match');
        var aMin = parseInt(row.getAttribute('data-amount-min'), 10);
        var aMax = parseInt(row.getAttribute('data-amount-max'), 10);
        var tMin = parseInt(row.getAttribute('data-term-min'), 10);
        var tMax = parseInt(row.getAttribute('data-term-max'), 10);
        var fits = !isNaN(aMin) && !isNaN(aMax) && !isNaN(tMin) && !isNaN(tMax) &&
          amount >= aMin && amount <= aMax && term >= tMin && term <= tMax;
        if (fits && rowMatchesFilter(row, activeFilter)) {
          row.classList.add('calc-match');
          matches.push(row);
        }
      });
      resultEl.hidden = false;
      resultEl.textContent = matches.length ? STR.match(matches.length) : STR.noMatch;
      if (matches.length) {
        matches[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    if (calcBtn) calcBtn.addEventListener('click', runCalc);

    table.addEventListener('fpcompare:rendered', function () {
      applyFilter(activeFilter);
    });
  });
})();
