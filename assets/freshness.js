// "Frische-Stempel": turns the raw data stamp ("2026-10") in the trust bar
// into a status dot + month name. Data is only dated to the month, so the
// status is month-based on purpose (we never claim a day-exact check):
//   0-1 months old  -> fresh (green)
//   2-3 months old  -> amber, "Stand vor N Monaten"
//   4+ months old   -> muted, asks the reader to confirm with the provider.
(function () {
  var MONTHS = {
    de: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
    en: ['January','February','March','April','May','June','July','August','September','October','November','December']
  };
  function init() {
    var lang = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0 ? 'en' : 'de';
    var els = document.querySelectorAll('[id$="last-updated"]');
    Array.prototype.forEach.call(els, function (el) {
      function decorate() {
        var m = /^(\d{4})-(\d{2})/.exec((el.textContent || '').trim());
        if (!m || el.getAttribute('data-fp-fresh')) return;
        var y = +m[1], mo = +m[2];
        var now = new Date();
        var age = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - mo);
        var state = age <= 1 ? 'fresh' : age <= 3 ? 'aging' : 'stale';
        var name = MONTHS[lang][mo - 1] + ' ' + y;
        var note = '';
        if (state === 'aging') note = lang === 'en' ? ' (' + age + ' months ago)' : ' (vor ' + age + ' Monaten)';
        if (state === 'stale') note = lang === 'en' ? ' (' + age + ' months ago; please confirm with the provider)' : ' (vor ' + age + ' Monaten; bitte beim Anbieter bestätigen)';
        el.setAttribute('data-fp-fresh', state);
        el.innerHTML = '<span class="fp-fresh-dot" aria-hidden="true"></span>' +
          '<span class="fp-fresh-text"></span>';
        el.querySelector('.fp-fresh-text').textContent = name + note;
      }
      decorate();
      new MutationObserver(decorate).observe(el, { childList: true, characterData: true, subtree: true });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
