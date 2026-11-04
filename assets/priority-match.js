// "Was ist dir wichtig?" priority sliders, shared by the comparison pages.
// Personal match = weighted average of an item's real Finanzpal-Score factor
// values (item.score.breakdown, 0-100) using the visitor's slider weights.
// It needs no extra data and never changes the Finanzpal-Score itself.
//
//   var pm = fpPriority.create({
//     lang: 'de'|'en', factors: ['a','b'], labels: {a:'…'}, sortSelect: <select>,
//     defaultSort: 'rate' (sortSelect/defaultSort optional), idPrefix: 'giro', toFive: fn, onChange: render
//   });
//   pm.matchOf(item) -> 0-100 or null;  pm.chipHtml(item);  pm.reset();
(function () {
  var STR = {
    de: {
      title: 'Was ist dir wichtig?',
      hint: 'Regler nach rechts = wichtiger. Die Liste sortiert sich nach deinem Match; der Finanzpal-Score bleibt unverändert.',
      sort: 'Sortieren: Mein Match',
      match: function (n) { return 'Dein Match ' + n; }
    },
    en: {
      title: 'What matters to you?',
      hint: 'Slide right = more important. The list re-sorts by your match; the Finanzpal Score itself never changes.',
      sort: 'Sort: My match',
      match: function (n) { return 'Your match ' + n; }
    }
  };

  function create(o) {
    var S = STR[o.lang === 'en' ? 'en' : 'de'];
    var weights = {};
    o.factors.forEach(function (k) { weights[k] = 0; });

    function active() { return o.factors.some(function (k) { return weights[k] > 0; }); }
    function matchOf(item) {
      var b = item && item.score && item.score.breakdown;
      if (!b) return null;
      var sum = 0, tot = 0;
      o.factors.forEach(function (k) {
        if (weights[k] > 0 && typeof b[k] === 'number') { sum += weights[k] * b[k]; tot += weights[k]; }
      });
      return tot > 0 ? sum / tot : null;
    }
    function chipHtml(item) {
      var m = matchOf(item);
      return m == null ? '' : '<span class="cc-badge fp-match-chip">' + S.match(o.toFive(m)) + '</span>';
    }
    function compare(a, b) {
      var x = matchOf(a), y = matchOf(b);
      return (y == null ? -1 : y) - (x == null ? -1 : x);
    }

    // sortSelect is optional (the Kreditkarte page has none: it just sorts by
    // match while any slider is above 0).
    if (o.sortSelect) {
      var opt = document.createElement('option');
      opt.value = 'match';
      opt.textContent = S.sort;
      o.sortSelect.appendChild(opt);
    }

    var panel = document.createElement('div');
    panel.className = 'kk-filter-group fp-prio';
    panel.innerHTML = '<h3>' + S.title + '</h3>' + o.factors.map(function (k) {
      var id = o.idPrefix + '-prio-' + k;
      return '<label class="fp-prio-row" for="' + id + '"><span>' + o.labels[k] + '</span>' +
        '<input type="range" min="0" max="100" step="25" value="0" id="' + id + '" data-prio="' + k + '"></label>';
    }).join('') + '<p class="fp-prio-hint">' + S.hint + '</p>';
    var aside = document.querySelector('.kk-filters');
    var first = aside && aside.querySelector('.kk-filter-group');
    if (aside && first) aside.insertBefore(panel, first);

    Array.prototype.forEach.call(panel.querySelectorAll('input[data-prio]'), function (inp) {
      inp.addEventListener('input', function () {
        weights[inp.getAttribute('data-prio')] = Number(inp.value);
        if (o.sortSelect) {
          if (active()) o.sortSelect.value = 'match';
          else if (o.sortSelect.value === 'match') o.sortSelect.value = o.defaultSort;
        }
        o.onChange();
      });
    });

    function reset() {
      o.factors.forEach(function (k) { weights[k] = 0; });
      Array.prototype.forEach.call(panel.querySelectorAll('input[data-prio]'), function (i) { i.value = 0; });
    }
    return { matchOf: matchOf, chipHtml: chipHtml, compare: compare, active: active, reset: reset };
  }

  window.fpPriority = { create: create };
})();
