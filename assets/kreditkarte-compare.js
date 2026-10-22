// Kreditkarte comparison: ranked card list with real filter logic, a
// secondary table view, and expandable per-card detail. Self-contained
// (own data fetch + render), replacing the generic compare.js table for
// this page only, so filtering can apply to whichever view is active.
(function () {
  var LANG = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0 ? 'en' : 'de';

  var STR = {
    de: {
      loading: 'Lade Vergleichsdaten …',
      error: function (msg) { return 'Daten konnten nicht geladen werden (' + msg + ').'; },
      resultCount: function (n, total) { return n + ' von ' + total + ' Kreditkarten'; },
      noResults: 'Keine Karte erfüllt diese Filter — probiere weniger Filter.',
      reset: 'Filter zurücksetzen',
      viewCards: 'Karten',
      viewTable: 'Tabelle',
      pick: 'Unsere Empfehlung',
      notRated: 'noch nicht bewertet',
      cta: 'Zum Anbieter',
      moreDetails: 'Mehr Details',
      lessDetails: 'Weniger Details',
      network: 'Netzwerk',
      condition: 'Bedingung',
      withdrawal: 'Bargeldabhebung',
      mobilePayment: 'Mobile Payment',
      filterNetwork: 'Kartennetzwerk',
      filterRating: 'Mindestbewertung',
      filterAnyRating: 'Alle Bewertungen',
      filterFeatures: 'Eigenschaften',
      filterWeltweit: 'Weltweit unbegrenzt kostenlos abheben',
      filterOhneBedingungen: 'Dauerhaft kostenlos, ohne Bedingungen',
      filterMobile: 'Mobile Payment',
      table: { provider: 'Anbieter', network: 'Netzwerk', fee: 'Jahresgebühr', fx: 'Fremdwährung', withdrawal: 'Bargeldabhebung', rating: 'Bewertung' },
      typeCredit: 'Echte Kreditkarte',
      typeDebit: 'Debitkarte',
      priceLabel: 'Jahresgebühr',
      payment: 'Bezahlung',
      paymentFree: 'Kostenlos weltweit',
      paymentFee: function (fx) { return fx + ' Fremdwährungsgebühr'; },
      zinsfreiTage: function (n) { return 'Bis zu ' + n + ' Tage zinsfrei'; },
      noInstallment: 'Keine Ratenzahlung möglich – Rechnungsbetrag wird vollständig fällig',
      installmentPrefix: 'Ratenzahlung möglich: ',
      hotelYes: 'Geeignet für Hotel- und Mietwagenbuchungen (Kreditrahmen als Kaution)',
      hotelNo: 'Als Debitkarte ohne Kreditrahmen meist nicht für Hotel-/Mietwagen-Kautionen geeignet',
      scoreTooltip: function (b) {
        return 'Finanzpal-Score: Jahresgebühr ' + b.jahresgebuehr + ' · Abhebung weltweit ' + b.abhebung + ' · Ohne Bedingungen ' + b.ohneBedingungen + ' · Zinsfreie Tage ' + b.zinsfreieTage + ' (je von 100). Methodik: ueber-uns.html#finanzpal-score';
      }
    },
    en: {
      loading: 'Loading comparison data …',
      error: function (msg) { return 'Could not load data (' + msg + ').'; },
      resultCount: function (n, total) { return n + ' of ' + total + ' credit cards'; },
      noResults: 'No card matches these filters — try removing a filter.',
      reset: 'Reset filters',
      viewCards: 'Cards',
      viewTable: 'Table',
      pick: 'Our pick',
      notRated: 'not yet rated',
      cta: 'View offer',
      moreDetails: 'More details',
      lessDetails: 'Less details',
      network: 'Network',
      condition: 'Condition',
      withdrawal: 'Cash withdrawal',
      mobilePayment: 'Mobile payment',
      filterNetwork: 'Card network',
      filterRating: 'Minimum rating',
      filterAnyRating: 'Any rating',
      filterFeatures: 'Features',
      filterWeltweit: 'Unlimited free withdrawals worldwide',
      filterOhneBedingungen: 'Permanently free, no conditions',
      filterMobile: 'Mobile payment',
      table: { provider: 'Provider', network: 'Network', fee: 'Annual fee', fx: 'Foreign transaction fee', withdrawal: 'Cash withdrawal', rating: 'Rating' },
      typeCredit: 'Credit card',
      typeDebit: 'Debit card',
      priceLabel: 'Annual fee',
      payment: 'Payment',
      paymentFree: 'Free worldwide',
      paymentFee: function (fx) { return fx + ' foreign transaction fee'; },
      zinsfreiTage: function (n) { return 'Up to ' + n + ' interest-free days'; },
      noInstallment: 'No installment option – the full balance is due each month',
      installmentPrefix: 'Installment payment available: ',
      hotelYes: 'Suitable for hotel and rental car deposits (credit line used as collateral)',
      hotelNo: 'As a debit card with no credit line, usually not suitable for hotel/rental car deposits',
      scoreTooltip: function (b) {
        return 'Finanzpal Score: Annual fee ' + b.jahresgebuehr + ' · Worldwide withdrawal ' + b.abhebung + ' · No conditions ' + b.ohneBedingungen + ' · Interest-free days ' + b.zinsfreieTage + ' (each out of 100). Methodology: ueber-uns.html#finanzpal-score';
      }
    }
  }[LANG];

  function scoreBadgeHtml(item) {
    if (!item.score) return '';
    var band = (item.score.band || '').toLowerCase();
    var title = STR.scoreTooltip(item.score.breakdown || {});
    return '<a class="fp-score-badge band-' + band + '" href="ueber-uns.html#finanzpal-score" title="' + escapeHtml(title) + '">' +
      item.score.value + ' <span class="fp-score-band">' + escapeHtml(item.score.band) + '</span></a>';
  }

  var MONTHS = {
    de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };

  function formatUpdated(str) {
    var m = /^(\d{4})-(\d{2})$/.exec(str || '');
    if (!m) return str;
    var monthName = MONTHS[LANG][parseInt(m[2], 10) - 1];
    return monthName ? monthName + ' ' + m[1] : str;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function ratingHtml(item) {
    if (item.rating === null || item.rating === undefined) {
      return '<div class="rating"><span class="score-na">' + STR.notRated + '</span></div>';
    }
    var scoreStr = LANG === 'en' ? item.rating.toFixed(1) : item.rating.toFixed(1).replace('.', ',');
    return '<div class="rating"><span class="stars">' + item.ratingStars + '</span><span class="score">' + scoreStr + '</span></div>';
  }

  function init() {
    var app = document.getElementById('kk-app');
    if (!app) return;
    var src = app.getAttribute('data-source');
    if (LANG === 'en') src = src.replace(/\.json$/, '.en.json');

    var resultsEl = document.getElementById('kk-results');
    var countEl = document.getElementById('kk-count');
    var resetBtn = document.getElementById('kk-reset');
    var viewCardsBtn = document.getElementById('kk-view-cards');
    var viewTableBtn = document.getElementById('kk-view-table');
    var networkChecks = document.querySelectorAll('input[data-filter="netzwerk"]');
    var ratingSelect = document.getElementById('kk-rating-select');
    var weltweitCheck = document.getElementById('kk-filter-weltweit');
    var ohneBedingungenCheck = document.getElementById('kk-filter-ohne');
    var applePayCheck = document.getElementById('kk-filter-apple');
    var googlePayCheck = document.getElementById('kk-filter-google');

    var allItems = [];
    var view = 'cards';
    var expanded = {};
    var layoutEl = document.querySelector('.kk-layout');

    function applyFilters(items) {
      var networks = Array.prototype.filter.call(networkChecks, function (c) { return c.checked; }).map(function (c) { return c.value; });
      var minRating = parseFloat(ratingSelect.value) || 0;
      return items.filter(function (item) {
        if (networks.length && networks.indexOf(item.netzwerk) === -1) return false;
        if (item.rating != null && item.rating < minRating) return false;
        if (weltweitCheck.checked && !item.weltweitKostenlos) return false;
        if (ohneBedingungenCheck.checked && !item.ohneBedingungen) return false;
        if (applePayCheck.checked && !item.applePay) return false;
        if (googlePayCheck.checked && !item.googlePay) return false;
        return true;
      });
    }

    function mobileIconsHtml(item) {
      var parts = [];
      if (item.applePay) parts.push('<span class="mp-chip">Apple Pay</span>');
      if (item.googlePay) parts.push('<span class="mp-chip">Google Pay</span>');
      return parts.join('');
    }

    function bulletsFor(item) {
      var bullets = [];
      if (item.kartentyp === STR.typeDebit) {
        bullets.push({ ok: false, text: item.rechnungsausgleich });
      } else {
        if (item.zinsfreieTage) bullets.push({ ok: true, text: STR.zinsfreiTage(item.zinsfreieTage) });
        else if (item.zinsfreieText) bullets.push({ ok: true, text: item.zinsfreieText });
        if (item.ratenzahlung) bullets.push({ ok: true, text: STR.installmentPrefix + item.ratenzahlungDetail });
        else bullets.push({ ok: false, text: STR.noInstallment });
        if (item.rechnungsausgleich) bullets.push({ ok: false, text: item.rechnungsausgleich });
      }
      if (item.hotelMietwagen === 'geeignet') bullets.push({ ok: true, text: STR.hotelYes });
      else if (item.hotelMietwagen === 'weniger_geeignet') bullets.push({ ok: false, text: STR.hotelNo });
      return bullets;
    }

    function cardArtHtml(item) {
      return '<div class="cc-art" style="background:' + (item.color || '#163A66') + ';">' +
        escapeHtml(item.initials) + '<span class="cc-network">' + escapeHtml(item.netzwerk) + '</span></div>';
    }

    function cardHtml(item, rank) {
      var isOpen = !!expanded[item.id];
      var isDebit = item.kartentyp === STR.typeDebit;
      var fxIsFree = parseFloat(String(item.fremdwaehrung).replace(',', '.')) === 0;
      var paymentVal = fxIsFree ? STR.paymentFree : STR.paymentFee(item.fremdwaehrung);
      var bullets = bulletsFor(item).map(function (b) {
        return '<li class="' + (b.ok ? 'ok' : 'info') + '"><span class="cc-icon">' + (b.ok ? '✓' : 'ⓘ') + '</span>' + escapeHtml(b.text) + '</li>';
      }).join('');

      var crossLinkHtml = window.kkCrossLinkHtml ? window.kkCrossLinkHtml('kreditkarte', item.id, LANG) : '';
      return '<div class="kk-card' + (item.recommended ? ' pick' : '') + '" id="' + escapeHtml(item.id) + '">' +
        '<div class="cc-badges">' +
          '<span class="cc-badge' + (isDebit ? ' debit' : '') + '">' + (isDebit ? STR.typeDebit : STR.typeCredit) + '</span>' +
          (item.ohneBedingungen ? '<span class="cc-badge">' + STR.filterOhneBedingungen + '</span>' : '') +
          (item.recommended ? '<span class="cc-badge">' + STR.pick + '</span>' : '') +
        '</div>' +
        '<div class="cc-body">' +
          cardArtHtml(item) +
          '<div class="cc-main">' +
            '<div class="cc-name">' + escapeHtml(item.name) + scoreBadgeHtml(item) + '</div>' +
            '<ul class="cc-bullets">' + bullets + '</ul>' + crossLinkHtml +
          '</div>' +
          '<div class="cc-facts">' +
            '<div class="cc-fact"><span class="k">' + STR.payment + '</span><span class="v">' + escapeHtml(paymentVal) + '</span></div>' +
            '<div class="cc-fact"><span class="k">' + STR.withdrawal + '</span><span class="v">' + escapeHtml(item.abhebung) + '</span></div>' +
          '</div>' +
          '<div class="cc-cta-col">' +
            '<div class="cc-price"><div class="amount">' + item.jahresgebuehr + '</div><div class="label">' + STR.priceLabel + '</div></div>' +
            ratingHtml(item) +
            '<a href="' + item.affiliateUrl + '" class="cta-btn" rel="sponsored nofollow">' + STR.cta + '</a>' +
          '</div>' +
        '</div>' +
        '<hr class="cc-divider">' +
        '<button type="button" class="kk-toggle" data-toggle-id="' + item.id + '">' + (isOpen ? STR.lessDetails : STR.moreDetails) + ' <span class="kk-chevron">' + (isOpen ? '▴' : '▾') + '</span></button>' +
        (isOpen ? '<div class="kk-card-details side-facts">' +
          '<div class="sf-row"><span class="k">' + STR.condition + '</span><span class="v">' + escapeHtml(item.bedingung || '—') + '</span></div>' +
          '<div class="sf-row"><span class="k">' + STR.network + '</span><span class="v">' + escapeHtml(item.netzwerk) + '</span></div>' +
          '<div class="sf-row"><span class="k">' + STR.mobilePayment + '</span><span class="v">' + (mobileIconsHtml(item) || '—') + '</span></div>' +
        '</div>' : '') +
      '</div>';
    }

    function tableHtml(items) {
      var rows = items.map(function (item) {
        return '<tr class="' + (item.recommended ? 'pick' : '') + '">' +
          '<td><div class="broker-cell"><div class="broker-mark" style="' + (item.color ? 'background:' + item.color + ';' : '') + '">' + escapeHtml(item.initials) + '</div><div>' +
            (item.recommended ? '<div class="broker-name linked">' + escapeHtml(item.name) + scoreBadgeHtml(item) + '</div><span class="broker-tag">' + STR.pick + '</span>' : '<div class="broker-name">' + escapeHtml(item.name) + scoreBadgeHtml(item) + '</div>') +
          '</div></div></td>' +
          '<td class="num-cell">' + escapeHtml(item.netzwerk) + '</td>' +
          '<td class="num-cell">' + item.jahresgebuehr + (item.bedingung ? '<div class="cell-sub">' + escapeHtml(item.bedingung) + '</div>' : '') + '</td>' +
          '<td class="num-cell">' + item.fremdwaehrung + '</td>' +
          '<td class="num-cell">' + item.abhebung + '</td>' +
          '<td>' + ratingHtml(item) + '</td>' +
          '<td><a href="' + item.affiliateUrl + '" class="' + (item.recommended ? 'cta-btn2' : 'cta-btn2 secondary') + '" rel="sponsored nofollow">' + STR.cta + '</a></td>' +
          '</tr>';
      }).join('');
      return '<div class="table-scroll"><table class="compare"><thead><tr>' +
        '<th>' + STR.table.provider + '</th><th>' + STR.table.network + '</th><th>' + STR.table.fee + '</th><th>' + STR.table.fx + '</th><th>' + STR.table.withdrawal + '</th><th>' + STR.table.rating + '</th><th></th>' +
        '</tr></thead><tbody>' + rows + '</tbody></table></div>';
    }

    function render() {
      var filtered = applyFilters(allItems);
      countEl.textContent = STR.resultCount(filtered.length, allItems.length);
      if (!filtered.length) {
        resultsEl.innerHTML = '<p class="kk-empty">' + STR.noResults + '</p>';
        return;
      }
      if (view === 'table') {
        resultsEl.innerHTML = tableHtml(filtered);
      } else {
        resultsEl.innerHTML = filtered.map(function (item, i) { return cardHtml(item, i + 1); }).join('');
        resultsEl.querySelectorAll('.kk-toggle').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var id = btn.getAttribute('data-toggle-id');
            expanded[id] = !expanded[id];
            render();
          });
        });
      }
      viewCardsBtn.classList.toggle('active', view === 'cards');
      viewTableBtn.classList.toggle('active', view === 'table');
      if (layoutEl) layoutEl.classList.toggle('kk-table-mode', view === 'table');
    }

    [].concat(
      Array.prototype.slice.call(networkChecks),
      [ratingSelect, weltweitCheck, ohneBedingungenCheck, applePayCheck, googlePayCheck]
    ).forEach(function (el) {
      el.addEventListener('change', render);
    });

    resetBtn.addEventListener('click', function () {
      networkChecks.forEach(function (c) { c.checked = false; });
      ratingSelect.value = '0';
      weltweitCheck.checked = false;
      ohneBedingungenCheck.checked = false;
      applePayCheck.checked = false;
      googlePayCheck.checked = false;
      render();
    });

    viewCardsBtn.addEventListener('click', function () { view = 'cards'; render(); });
    viewTableBtn.addEventListener('click', function () { view = 'table'; render(); });

    resultsEl.innerHTML = window.kkSkeletonHtml ? window.kkSkeletonHtml(5) : '<p class="kk-empty">' + STR.loading + '</p>';
    fetch(src)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        allItems = data.items;
        var updatedEl = document.getElementById('last-updated');
        if (updatedEl && data.updated) updatedEl.textContent = formatUpdated(data.updated);
        render();
        if (window.kkScrollToHash) window.kkScrollToHash();
      })
      .catch(function (err) {
        resultsEl.innerHTML = '<p class="kk-empty">' + STR.error(escapeHtml(err.message)) + '</p>';
      });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
