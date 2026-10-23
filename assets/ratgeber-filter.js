// Makes the category chips on ratgeber.html (+ en/) filter the guide cards.
// A chip matches cards whose .guide-cat text equals the chip's data-filter
// (empty data-filter = "Alle"/"All"), so new articles need no extra markup.
// The active filter is kept in the URL hash (e.g. ratgeber.html#investieren),
// so a filtered view can be linked and survives the back button.
(function () {
  function slug(s) {
    return s.toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var bar = document.querySelector('.rat-filters');
    if (!bar) return;
    var chips = Array.prototype.slice.call(bar.querySelectorAll('.chip[data-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.guide-card'));
    var status = document.getElementById('rat-filter-status');

    function apply(filter, updateHash) {
      var shown = 0;
      cards.forEach(function (card) {
        var cat = card.querySelector('.guide-cat');
        var match = !filter || (cat && cat.textContent.trim() === filter);
        card.hidden = !match;
        if (match) shown++;
      });
      chips.forEach(function (chip) {
        var on = chip.getAttribute('data-filter') === filter;
        chip.classList.toggle('active', on);
        chip.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (status) status.textContent = status.getAttribute(shown === 1 ? 'data-one' : 'data-many').replace('{n}', shown);
      if (updateHash && history.replaceState) {
        history.replaceState(null, '', filter ? '#' + slug(filter) : location.pathname + location.search);
      }
    }

    function fromHash() {
      var h = decodeURIComponent(location.hash.replace(/^#/, ''));
      for (var i = 0; i < chips.length; i++) {
        var f = chips[i].getAttribute('data-filter');
        if (f && slug(f) === h) return f;
      }
      return '';
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        apply(chip.getAttribute('data-filter'), true);
      });
    });
    window.addEventListener('hashchange', function () { apply(fromHash(), false); });

    apply(fromHash(), false);
  });
})();
