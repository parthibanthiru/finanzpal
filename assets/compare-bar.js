(function () {
  var MAX = 3;

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var resultsEl = document.querySelector('.kk-results');
    if (!resultsEl) return;
    var isEn = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0;
    var selected = new Map(); // item.id -> { name, bulletsHtml }

    var STR = isEn ? {
      compare: 'Compare', clear: 'Clear', view: 'Compare', close: 'Close',
      count: function (n) { return n + ' selected (max ' + MAX + ')'; }
    } : {
      compare: 'Vergleichen', clear: 'Leeren', view: 'Vergleichen', close: 'Schließen',
      count: function (n) { return n + ' ausgewählt (max. ' + MAX + ')'; }
    };

    function decorateCards() {
      var cards = resultsEl.querySelectorAll('.kk-card');
      cards.forEach(function (card) {
        if (card.querySelector('.cc-compare-check') || !card.id) return;
        var ctaCol = card.querySelector('.cc-cta-col');
        if (!ctaCol) return;
        var label = document.createElement('label');
        label.className = 'cc-compare-check';
        label.innerHTML = '<input type="checkbox"><span>' + STR.compare + '</span>';
        ctaCol.insertBefore(label, ctaCol.firstChild);
        var checkbox = label.querySelector('input');
        checkbox.addEventListener('change', function () {
          if (checkbox.checked) {
            if (selected.size >= MAX) { checkbox.checked = false; return; }
            var nameEl = card.querySelector('.cc-name');
            var bulletsEl = card.querySelector('.cc-bullets');
            selected.set(card.id, {
              name: nameEl ? nameEl.textContent : card.id,
              bulletsHtml: bulletsEl ? bulletsEl.innerHTML : ''
            });
          } else {
            selected.delete(card.id);
          }
          syncCheckboxStates();
          updateBar();
        });
      });
      syncCheckboxStates();
    }

    function syncCheckboxStates() {
      resultsEl.querySelectorAll('.cc-compare-check input').forEach(function (cb) {
        var card = cb.closest('.kk-card');
        var id = card ? card.id : null;
        cb.checked = !!(id && selected.has(id));
        cb.disabled = !cb.checked && selected.size >= MAX;
      });
    }

    var observer = new MutationObserver(function () { decorateCards(); });
    observer.observe(resultsEl, { childList: true });
    decorateCards();

    var bar = document.createElement('div');
    bar.className = 'kk-compare-bar';
    bar.innerHTML =
      '<span class="kk-compare-count"></span>' +
      '<div class="kk-compare-actions">' +
      '<button type="button" class="kk-compare-clear">' + STR.clear + '</button>' +
      '<button type="button" class="kk-compare-view cta-btn">' + STR.view + '</button>' +
      '</div>';
    document.body.appendChild(bar);

    function updateBar() {
      var n = selected.size;
      if (n < 2) { bar.classList.remove('visible'); return; }
      bar.classList.add('visible');
      bar.querySelector('.kk-compare-count').textContent = STR.count(n);
    }

    bar.querySelector('.kk-compare-clear').addEventListener('click', function () {
      selected.clear();
      syncCheckboxStates();
      updateBar();
      closeModal();
    });
    bar.querySelector('.kk-compare-view').addEventListener('click', openModal);

    var modal = document.createElement('div');
    modal.className = 'kk-compare-modal';
    modal.innerHTML =
      '<div class="kk-compare-modal-inner">' +
      '<button type="button" class="kk-compare-modal-close" aria-label="' + STR.close + '">&times;</button>' +
      '<div class="kk-compare-modal-body"></div>' +
      '</div>';
    document.body.appendChild(modal);
    modal.querySelector('.kk-compare-modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

    function openModal() {
      var body = modal.querySelector('.kk-compare-modal-body');
      body.innerHTML = Array.from(selected.values()).map(function (item) {
        return '<div class="kk-compare-col"><h3>' + escapeHtml(item.name) + '</h3><ul class="cc-bullets">' + item.bulletsHtml + '</ul></div>';
      }).join('');
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
})();
