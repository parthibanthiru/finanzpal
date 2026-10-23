// Interactive Finanzpal-Score breakdown popover.
//
// The score badges rendered by compare.js / girokonto-compare.js /
// kinderdepot-compare.js / kreditkarte-compare.js already carry a native
// `title` tooltip with the per-factor breakdown — but a `title` tooltip
// never shows on a touch device, so mobile visitors (most of the traffic
// to a comparison page) had no way to see what a score is made of, only
// the final number. This file adds a tap/click-to-open panel that works
// everywhere, built from the `data-score-rows` JSON each badge already
// carries. Pure progressive enhancement: without this script the badges
// still work exactly as before (hover tooltip + link to the methodology
// page).
(function () {
  var isEn = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0;
  var STR = isEn
    ? { close: 'Close', methodology: 'Full methodology →', of100: '/ 100' }
    : { close: 'Schließen', methodology: 'Zur Methodik →', of100: '/ 100' };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var panel = null;
  var openTrigger = null;

  function buildPanel() {
    if (panel) return panel;
    panel = document.createElement('div');
    panel.className = 'fp-score-pop';
    panel.setAttribute('role', 'dialog');
    panel.hidden = true;
    panel.innerHTML =
      '<button type="button" class="fp-score-pop-close" aria-label="' + escapeHtml(STR.close) + '">×</button>' +
      '<div class="fp-score-pop-head"></div>' +
      '<div class="fp-score-pop-rows"></div>' +
      '<a class="fp-score-pop-link" href="ueber-uns.html#finanzpal-score">' + escapeHtml(STR.methodology) + '</a>';
    document.body.appendChild(panel);
    panel.querySelector('.fp-score-pop-close').addEventListener('click', closePanel);
    panel.addEventListener('click', function (e) { e.stopPropagation(); });
    return panel;
  }

  function closePanel() {
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    if (openTrigger) openTrigger.setAttribute('aria-expanded', 'false');
    openTrigger = null;
  }

  function rowsHtml(rows) {
    return rows.map(function (r) {
      var pct = Math.max(0, Math.min(100, r.value));
      return '<div class="fp-score-pop-row">' +
        '<span class="fp-score-pop-label">' + escapeHtml(r.label) + '</span>' +
        '<span class="fp-score-pop-bar"><span class="fp-score-pop-fill" style="width:' + pct + '%"></span></span>' +
        '<span class="fp-score-pop-val">' + escapeHtml(String(r.value)) + '</span>' +
      '</div>';
    }).join('');
  }

  function openPanel(trigger) {
    var p = buildPanel();
    var rows;
    try {
      rows = JSON.parse(trigger.getAttribute('data-score-rows') || '[]');
    } catch (e) {
      rows = [];
    }
    var value = trigger.getAttribute('data-score-value') || '';
    var band = trigger.getAttribute('data-score-band') || '';
    p.querySelector('.fp-score-pop-head').innerHTML =
      '<span class="fp-score-pop-value band-' + band.toLowerCase() + '">' + escapeHtml(value) + '</span>' +
      '<span class="fp-score-pop-of100">' + escapeHtml(STR.of100) + '</span>';
    p.querySelector('.fp-score-pop-link').href = trigger.getAttribute('href') || 'ueber-uns.html#finanzpal-score';
    p.querySelector('.fp-score-pop-rows').innerHTML = rowsHtml(rows);
    p.hidden = false;

    // Position below the trigger, flipped above if it would overflow the
    // viewport bottom, and clamped horizontally so it never runs off-screen.
    var r = trigger.getBoundingClientRect();
    var pw = p.offsetWidth, ph = p.offsetHeight;
    var left = r.left + r.width / 2 - pw / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - pw - 12));
    var top = r.bottom + 8;
    var flipped = false;
    if (top + ph > window.innerHeight - 12) {
      top = r.top - ph - 8;
      flipped = true;
    }
    p.style.left = left + 'px';
    p.style.top = Math.max(12, top) + window.scrollY + 'px';
    p.classList.toggle('flipped', flipped);

    trigger.setAttribute('aria-expanded', 'true');
    openTrigger = trigger;
    p.querySelector('.fp-score-pop-close').focus();
  }

  document.addEventListener('click', function (e) {
    var badge = e.target.closest ? e.target.closest('.fp-score-badge') : null;
    if (badge) {
      e.preventDefault();
      if (openTrigger === badge) {
        closePanel();
      } else {
        openPanel(badge);
      }
      return;
    }
    if (panel && !panel.hidden && !panel.contains(e.target)) {
      closePanel();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel && !panel.hidden) {
      var trigger = openTrigger;
      closePanel();
      if (trigger) trigger.focus();
    }
  });

  // No scroll-close listener: the panel is positioned in document (not
  // viewport) coordinates, so it scrolls along with the page and stays
  // correctly anchored to its badge — closing it on scroll would only
  // make it flicker shut the instant a click/tap itself causes the
  // browser to auto-scroll the badge into view (confirmed happening on
  // kredite.html/tagesgeld.html, whose badges sit further down the page).
  window.addEventListener('resize', function () {
    if (panel && !panel.hidden) closePanel();
  });
})();
