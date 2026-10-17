// Renders a comparison table from a JSON data file.
// Usage: <table class="compare" data-source="data/broker.json" data-type="broker">
(function () {
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function brokerCell(item) {
    var nameHtml = item.recommended
      ? '<div class="broker-name linked">' + escapeHtml(item.name) + '</div><span class="broker-tag">Unsere Empfehlung</span>'
      : '<div class="broker-name">' + escapeHtml(item.name) + '</div>';
    var markStyle = item.color ? ' style="background:' + item.color + ';"' : '';
    if (item.detailUrl) {
      return '<a href="' + item.detailUrl + '" class="broker-cell"><div class="broker-mark"' + markStyle + '>' + item.initials + '</div><div>' + nameHtml + '</div></a>';
    }
    return '<div class="broker-cell"><div class="broker-mark"' + markStyle + '>' + item.initials + '</div><div>' + nameHtml + '</div></div>';
  }

  function ratingHtml(stars, score) {
    return '<div class="rating"><span class="stars">' + stars + '</span><span class="score">' + score.toFixed(1).replace('.', ',') + '</span></div>';
  }

  function ctaHtml(item) {
    var cls = item.recommended ? 'cta-btn2' : 'cta-btn2 secondary';
    return '<a href="' + item.affiliateUrl + '" class="' + cls + '" rel="sponsored nofollow">Zum Anbieter</a>';
  }

  var renderers = {
    broker: function (item) {
      return '<tr class="' + (item.recommended ? 'pick' : '') + '">' +
        '<td>' + brokerCell(item) + '</td>' +
        '<td class="num-cell">' + item.depotfee + '</td>' +
        '<td class="num-cell">' + item.orderfee + '</td>' +
        '<td class="num-cell">' + item.sparplanAb + '</td>' +
        '<td>' + ratingHtml(item.ratingStars, item.rating) + '</td>' +
        '<td>' + ctaHtml(item) + '</td>' +
        '</tr>';
    },
    tagesgeld: function (item) {
      return '<tr class="' + (item.recommended ? 'pick' : '') + '">' +
        '<td>' + brokerCell(item) + '</td>' +
        '<td><span class="rate-val">' + item.rate + '</span></td>' +
        '<td class="num-cell">' + item.guarantee + '</td>' +
        '<td class="num-cell">' + item.minDeposit + '</td>' +
        '<td class="num-cell">' + item.protection + '</td>' +
        '<td>' + ctaHtml(item) + '</td>' +
        '</tr>';
    },
    kredite: function (item) {
      return '<tr class="' + (item.recommended ? 'pick' : '') + '">' +
        '<td>' + brokerCell(item) + '</td>' +
        '<td><span class="rate-val">' + item.rate + '</span></td>' +
        '<td class="num-cell">' + item.amount + '</td>' +
        '<td class="num-cell">' + item.term + '</td>' +
        '<td class="num-cell">' + item.sondertilgung + '</td>' +
        '<td>' + ctaHtml(item) + '</td>' +
        '</tr>';
    },
    versicherungen: function (item) {
      return '<tr class="' + (item.recommended ? 'pick' : '') + '">' +
        '<td>' + brokerCell(item) + '</td>' +
        '<td class="num-cell">' + item.beitrag + '</td>' +
        '<td class="num-cell">' + item.deckung + '</td>' +
        '<td><div class="cover-list">' + item.leistungen + '</div></td>' +
        '<td>' + ratingHtml(item.ratingStars, item.rating) + '</td>' +
        '<td>' + ctaHtml(item) + '</td>' +
        '</tr>';
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    var tables = document.querySelectorAll('table.compare[data-source]');
    tables.forEach(function (table) {
      var src = table.getAttribute('data-source');
      var type = table.getAttribute('data-type');
      var tbody = table.querySelector('tbody');
      var renderRow = renderers[type];
      if (!tbody || !renderRow) return;

      fetch(src)
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function (data) {
          tbody.innerHTML = data.items.map(renderRow).join('');
          var updatedEl = document.getElementById('last-updated');
          if (updatedEl && data.updated) updatedEl.textContent = data.updated;
        })
        .catch(function (err) {
          tbody.innerHTML = '<tr class="loading-row"><td colspan="6">Daten konnten nicht geladen werden (' + escapeHtml(err.message) + '). Lokal? Bitte über einen lokalen Server öffnen, z. B. <code>python3 -m http.server</code> — direktes Öffnen der Datei (file://) blockiert den Datenabruf im Browser.</td></tr>';
        });
    });
  });
})();
