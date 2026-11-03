// "Woher kommen die Zahlen?" drawer: puts the page's own disclosure text
// (sources, caveats, data date) right next to the results instead of only at
// the bottom of the page. It only re-uses wording that already exists on the
// page, so no new claims are introduced (single source of truth).
(function () {
  function init() {
    var link = document.querySelector('.method-link');
    var note = document.querySelector('.disclosure-note');
    if (!link || !note || link.getAttribute('data-fp-drawer')) return;
    link.setAttribute('data-fp-drawer', '1');
    var isEn = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0;
    var L = isEn
      ? { open: 'Where do the numbers come from?', close: 'Hide sources', stand: 'Data as of', rate: 'How we rate' }
      : { open: 'Woher kommen die Zahlen?', close: 'Quellen ausblenden', stand: 'Datenstand', rate: 'Wie wir bewerten' };

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fp-maths-toggle';
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = L.open;
    link.parentNode.insertBefore(btn, link.nextSibling);

    var drawer = document.createElement('div');
    drawer.className = 'fp-maths-drawer';
    drawer.id = 'fp-maths-drawer';
    drawer.hidden = true;
    btn.setAttribute('aria-controls', drawer.id);
    var body = document.createElement('div');
    body.className = 'fp-maths-body';
    var clone = note.cloneNode(true);
    clone.className = '';
    body.appendChild(clone);
    drawer.appendChild(body);
    var toolbar = link.closest('.kk-toolbar') || link.parentNode;
    toolbar.parentNode.insertBefore(drawer, toolbar.nextSibling);

    btn.addEventListener('click', function () {
      var open = drawer.hidden;
      drawer.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? L.close : L.open;
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
