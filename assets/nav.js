document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('nav.top');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  initNavDropdowns();
  initThemeToggle();
});

function initNavDropdowns() {
  var drops = document.querySelectorAll('.nav-drop');
  if (!drops.length) return;

  function closeAll(except) {
    drops.forEach(function (d) {
      if (d !== except) d.classList.remove('open');
    });
  }

  drops.forEach(function (drop) {
    var btn = drop.querySelector('.nav-drop-btn');
    if (!btn) return;
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var willOpen = !drop.classList.contains('open');
      closeAll(willOpen ? drop : null);
      drop.classList.toggle('open', willOpen);
      btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  });

  document.addEventListener('click', function () { closeAll(null); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll(null);
  });
}

function initThemeToggle() {
  var actions = document.querySelector('.header-actions');
  if (!actions) return;
  var isEn = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0;
  var label = isEn ? 'Toggle dark mode' : 'Dunkelmodus umschalten';

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'theme-toggle-btn';
  btn.setAttribute('aria-label', label);
  btn.innerHTML = '<span class="theme-icon theme-icon-sun" aria-hidden="true">☀</span><span class="theme-icon theme-icon-moon" aria-hidden="true">☾</span>';

  var searchBtn = actions.querySelector('.search-btn');
  if (searchBtn) actions.insertBefore(btn, searchBtn);
  else actions.appendChild(btn);

  function currentTheme() {
    var stored = null;
    try { stored = localStorage.getItem('fp-theme'); } catch (e) {}
    if (stored === 'dark' || stored === 'light') return stored;
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  function applyTheme(theme, persist) {
    document.documentElement.setAttribute('data-theme', theme);
    if (persist) {
      try { localStorage.setItem('fp-theme', theme); } catch (e) {}
    }
  }

  // Reflect current effective theme in the attribute (covers the case where
  // no explicit choice is stored yet, so the icon state is correct from the start).
  applyTheme(currentTheme(), false);

  btn.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
  });
}
