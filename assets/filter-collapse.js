// Phones/tablets (<=860px): the filter sidebar stacks above the results and
// can be taller than the screen, so the actual comparison starts far down the
// page. This turns it into a collapsible block behind a "Filter" button with
// a badge showing how many filters are active. Pure progressive enhancement:
// without JS (or above 860px, where style.css ignores .fp-collapsed) the
// sidebar is shown exactly as before.
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var aside = document.querySelector('.kk-filters');
    if (!aside || aside.getAttribute('data-fp-collapse') === '1') return;
    aside.setAttribute('data-fp-collapse', '1');
    var isEn = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0;
    var LABEL = isEn ? 'Filters' : 'Filter';
    var ACTIVE = function (n) { return isEn ? n + ' active' : n + ' aktiv'; };
    if (!aside.id) aside.id = 'kk-filters-panel';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'kk-filter-toggle';
    btn.setAttribute('aria-controls', aside.id);
    btn.setAttribute('aria-expanded', 'false');
    aside.parentNode.insertBefore(btn, aside);
    aside.classList.add('fp-collapsed');

    function activeCount() {
      var n = 0;
      Array.prototype.forEach.call(aside.querySelectorAll('input[type=checkbox]:checked, input[type=radio]:checked'), function () { n++; });
      Array.prototype.forEach.call(aside.querySelectorAll('input[type=range]'), function (r) { if (Number(r.value) > 0) n++; });
      Array.prototype.forEach.call(aside.querySelectorAll('select'), function (s) { if (s.selectedIndex > 0) n++; });
      Array.prototype.forEach.call(aside.querySelectorAll('.etf-chip.active'), function (c) { if (c.getAttribute('data-value') !== 'Alle') n++; });
      return n;
    }
    function render() {
      var open = !aside.classList.contains('fp-collapsed');
      var n = activeCount();
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.innerHTML = '<span>' + LABEL + '</span>' +
        (n ? '<span class="kk-filter-badge">' + ACTIVE(n) + '</span>' : '') +
        '<span class="kk-filter-chev" aria-hidden="true">' + (open ? '▴' : '▾') + '</span>';
    }
    btn.addEventListener('click', function () {
      aside.classList.toggle('fp-collapsed');
      render();
    });
    ['change', 'click', 'input'].forEach(function (ev) {
      aside.addEventListener(ev, function () { setTimeout(render, 0); });
    });
    render();
  });
})();
