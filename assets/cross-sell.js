(function () {
  var GROUPS = [
    { label: 'Trade Republic', girokonto: 'trade-republic-girokonto', broker: 'trade-republic', kreditkarte: 'trade-republic-visa' },
    { label: 'Consorsbank', girokonto: 'consorsbank-girokonto', broker: 'consorsbank', kreditkarte: 'consorsbank-visa' },
    { label: 'comdirect', girokonto: 'comdirect-girokonto', broker: 'comdirect' },
    { label: 'C24', girokonto: 'c24-smart-girokonto', kreditkarte: 'c24-mastercard' }
  ];

  var PAGE_META = {
    girokonto: { url: 'girokonto.html', de: 'Girokonto-Vergleich', en: 'checking account comparison' },
    broker: { url: 'broker.html', de: 'Broker- &amp; Depot-Vergleich', en: 'broker &amp; custody account comparison' },
    kreditkarte: { url: 'kreditkarte.html', de: 'Kreditkarte-Vergleich', en: 'credit card comparison' }
  };

  function crossLinksFor(pageKey, itemId) {
    var links = [];
    GROUPS.forEach(function (g) {
      if (g[pageKey] !== itemId) return;
      Object.keys(g).forEach(function (k) {
        if (k === pageKey || k === 'label' || !g[k]) return;
        links.push({ page: k, id: g[k] });
      });
    });
    return links;
  }

  window.kkCrossLinkHtml = function (pageKey, itemId, lang) {
    var links = crossLinksFor(pageKey, itemId);
    if (!links.length) return '';
    var parts = links.map(function (l) {
      var meta = PAGE_META[l.page];
      var text = lang === 'en' ? ('Also see it in our ' + meta.en) : ('auch im ' + meta.de);
      return '<a href="' + meta.url + '#' + l.id + '">' + text + ' →</a>';
    });
    return '<div class="cc-crosslink">' + parts.join(' &middot; ') + '</div>';
  };
})();
