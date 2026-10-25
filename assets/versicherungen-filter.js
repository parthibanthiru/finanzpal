// Powers the filter chips on versicherungen.html (+ en/), across all five
// insurance tabs (Privathaftpflicht/Hausrat/BU/Rechtsschutz/Kfz). Filters by
// data-recommended/data-rated attributes that assets/compare.js's shared
// "versicherungen" row renderer embeds on each <tr> — real fields present in
// every category's data file, unlike the original "Ohne Selbstbeteiligung" /
// "Weltweiter Schutz" / "Online abschließbar" chips, which had no backing
// data in any of the five categories and were replaced rather than faked.
// Listens on "fpcompare:rendered" (dispatched by compare.js after every
// render, including a tab switch via insurance-tabs.js) so the active
// filter is re-applied whenever the table's rows change.
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var table = document.querySelector('table.compare[data-type]');
    var bar = document.querySelector('.filters');
    if (!table || !bar) return;
    var chips = Array.prototype.slice.call(bar.querySelectorAll('.chip[data-filter]'));
    if (!chips.length) return;

    var activeFilter = '';

    function rowMatches(row, filter) {
      if (!filter) return true;
      if (filter === 'recommended') return row.getAttribute('data-recommended') === '1';
      if (filter === 'rated') return row.getAttribute('data-rated') === '1';
      return true;
    }

    function apply(filter) {
      activeFilter = filter;
      var rows = Array.prototype.slice.call(table.querySelectorAll('tbody tr[data-recommended]'));
      rows.forEach(function (row) {
        row.hidden = !rowMatches(row, filter);
      });
      chips.forEach(function (chip) {
        var on = chip.getAttribute('data-filter') === filter;
        chip.classList.toggle('active', on);
        chip.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        apply(chip.getAttribute('data-filter') || '');
      });
    });

    table.addEventListener('fpcompare:rendered', function () {
      apply(activeFilter);
    });
  });
})();
