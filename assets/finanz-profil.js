(function () {
  var KEY = 'fp-profil';
  var isEn = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0;

  function readProfile() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; }
  }
  function writeProfile(partial) {
    var current = readProfile();
    for (var k in partial) { if (Object.prototype.hasOwnProperty.call(partial, k)) current[k] = partial[k]; }
    try { localStorage.setItem(KEY, JSON.stringify(current)); } catch (e) {}
  }
  function clearProfileKeys(keys) {
    var current = readProfile();
    keys.forEach(function (k) { delete current[k]; });
    try { localStorage.setItem(KEY, JSON.stringify(current)); } catch (e) {}
  }

  // id -> profile key, across the pages that share this concept
  var BEDINGUNGSLOS_IDS = ['giro-filter-bedingungslos', 'broker-filter-frei', 'kk-filter-ohne'];
  var ZINS_IDS = ['giro-filter-zins', 'broker-filter-zins'];
  var RESET_IDS = ['giro-reset', 'broker-reset', 'kk-reset'];

  document.addEventListener('DOMContentLoaded', function () {
    var profile = readProfile();
    var appliedSomething = false;

    BEDINGUNGSLOS_IDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (typeof profile.bedingungslos === 'boolean' && profile.bedingungslos && !el.checked) {
        el.checked = true;
        appliedSomething = true;
      }
      el.addEventListener('change', function () { writeProfile({ bedingungslos: el.checked }); });
    });

    ZINS_IDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (typeof profile.zins === 'boolean' && profile.zins && !el.checked) {
        el.checked = true;
        appliedSomething = true;
      }
      el.addEventListener('change', function () { writeProfile({ zins: el.checked }); });
    });

    var networkInputs = document.querySelectorAll('input[data-filter="netzwerk"]');
    if (networkInputs.length && profile.netzwerk && profile.netzwerk.length) {
      networkInputs.forEach(function (c) {
        if (profile.netzwerk.indexOf(c.value) !== -1 && !c.checked) {
          c.checked = true;
          appliedSomething = true;
        }
      });
    }
    networkInputs.forEach(function (c) {
      c.addEventListener('change', function () {
        var values = Array.prototype.filter.call(networkInputs, function (x) { return x.checked; }).map(function (x) { return x.value; });
        writeProfile({ netzwerk: values });
      });
    });

    RESET_IDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', function () {
        clearProfileKeys(['bedingungslos', 'zins', 'netzwerk']);
        hideBanner();
      });
    });

    if (appliedSomething) showBanner();

    function hideBanner() {
      var banner = document.getElementById('fp-profil-banner');
      if (banner) banner.remove();
    }

    function showBanner() {
      var filters = document.querySelector('.kk-filters');
      if (!filters || document.getElementById('fp-profil-banner')) return;
      var banner = document.createElement('div');
      banner.id = 'fp-profil-banner';
      banner.className = 'fp-profil-banner';
      var text = isEn
        ? 'Pre-selected from your filters on another comparison page.'
        : 'Vorausgewählt anhand deiner Filter auf einer anderen Vergleichsseite.';
      banner.innerHTML = '<span>' + text + '</span><button type="button" aria-label="' + (isEn ? 'Dismiss' : 'Schließen') + '">&times;</button>';
      filters.insertBefore(banner, filters.firstChild);
      banner.querySelector('button').addEventListener('click', function () { banner.remove(); });
    }
  });
})();
