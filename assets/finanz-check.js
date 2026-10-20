// Combined "Finanz-Check" quiz: one short set of questions scores items
// across four categories at once (Girokonto, Depot, Kreditkarte,
// Tagesgeld) using the same live JSON data the four comparison pages
// use, so the result can never drift out of sync with them.
(function () {
  var LANG = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0 ? 'en' : 'de';
  var app = document.getElementById('fc-app');
  var PREFIX = app ? app.getAttribute('data-prefix') || '' : '';
  var SUFFIX = LANG === 'en' ? '.en' : '';

  var DATA_SRC = {
    girokonto: PREFIX + 'data/girokonto' + SUFFIX + '.json',
    depot: PREFIX + 'data/depot' + SUFFIX + '.json',
    kreditkarte: PREFIX + 'data/kreditkarte' + SUFFIX + '.json',
    tagesgeld: PREFIX + 'data/tagesgeld' + SUFFIX + '.json'
  };

  var PAGE_URL = {
    girokonto: PREFIX + 'girokonto.html',
    depot: PREFIX + 'depot.html',
    kreditkarte: PREFIX + 'kreditkarte.html',
    tagesgeld: PREFIX + 'tagesgeld.html'
  };

  var STR = LANG === 'en' ? {
    of: function (n, total) { return 'Question ' + n + ' of ' + total; },
    back: '← Back',
    resultTitle: 'Your Finanz-Check result',
    resultLede: 'Based on your answers — one pick per category. See the full comparison for every option and every detail.',
    seeAll: 'See full comparison →',
    restart: 'Restart Finanz-Check',
    categories: { girokonto: 'Current account', depot: 'Custody account', kreditkarte: 'Credit card', tagesgeld: 'Overnight savings' },
    loading: 'Loading your result …',
    noDispo: 'No overdraft', noZins: '–',
    cta: 'View offer'
  } : {
    of: function (n, total) { return 'Frage ' + n + ' von ' + total; },
    back: '← Zurück',
    resultTitle: 'Dein Finanz-Check-Ergebnis',
    resultLede: 'Basierend auf deinen Antworten — eine Empfehlung pro Kategorie. Den vollständigen Vergleich mit allen Details findest du auf der jeweiligen Seite.',
    seeAll: 'Zum vollständigen Vergleich →',
    restart: 'Finanz-Check neu starten',
    categories: { girokonto: 'Girokonto', depot: 'Depot', kreditkarte: 'Kreditkarte', tagesgeld: 'Tagesgeld' },
    loading: 'Lade dein Ergebnis …',
    noDispo: 'Kein Dispo', noZins: '–',
    cta: 'Zum Anbieter'
  };

  var QUESTIONS = [
    {
      id: 'bedingungslos',
      text: { de: 'Wie wichtig ist dir eine Kontoführung ganz ohne Bedingungen (kein Mindestgeldeingang nötig)?', en: 'How important is an account with no conditions at all (no minimum incoming payment)?' },
      options: [
        { id: 'wichtig', label: { de: 'Sehr wichtig', en: 'Very important' } },
        { id: 'teils_ok', label: { de: 'Eine Bedingung ist für mich okay', en: 'One condition is fine for me' } }
      ]
    },
    {
      id: 'investstil',
      text: { de: 'Wie investierst du hauptsächlich?', en: 'How do you mainly invest?' },
      options: [
        { id: 'sparplan', label: { de: 'ETF-Sparplan (regelmäßig)', en: 'ETF savings plan (regularly)' } },
        { id: 'einzelkauf', label: { de: 'Einzelkäufe (Aktien/ETFs)', en: 'One-off buys (stocks/ETFs)' } },
        { id: 'beides', label: { de: 'Beides', en: 'Both' } }
      ]
    },
    {
      id: 'kartentyp',
      text: { de: 'Brauchst du eine Kreditkarte mit Ratenzahlungsoption, oder reicht dir eine einfache Debitkarte?', en: 'Do you need a credit card with an installment option, or is a simple debit card enough?' },
      options: [
        { id: 'ratenzahlung', label: { de: 'Ratenzahlungsoption wichtig', en: 'Installment option matters' } },
        { id: 'debitkarte', label: { de: 'Debitkarte reicht völlig', en: 'A debit card is plenty' } }
      ]
    },
    {
      id: 'ausland',
      text: { de: 'Zahlst oder hebst du oft außerhalb der Eurozone Geld ab?', en: 'Do you often pay or withdraw cash outside the eurozone?' },
      options: [
        { id: 'oft', label: { de: 'Ja, regelmäßig', en: 'Yes, regularly' } },
        { id: 'selten', label: { de: 'Selten bis nie', en: 'Rarely or never' } }
      ]
    },
    {
      id: 'tagesgeld_pref',
      text: { de: 'Beim Tagesgeld: Ist dir die Zinshöhe oder eine lange Zinsgarantie wichtiger?', en: 'For overnight savings: does the rate or a long rate guarantee matter more?' },
      options: [
        { id: 'zins', label: { de: 'Möglichst hoher Zins', en: 'The highest possible rate' } },
        { id: 'garantie', label: { de: 'Lange garantierte Laufzeit', en: 'A long guaranteed period' } }
      ]
    },
    {
      id: 'guthabenzins',
      text: { de: 'Wie wichtig ist dir Verzinsung auf dein Giro-/Depot-Guthaben?', en: 'How important is interest on your current account / custody cash balance?' },
      options: [
        { id: 'wichtig', label: { de: 'Wichtig', en: 'Important' } },
        { id: 'egal', label: { de: 'Eher egal', en: "Doesn't matter much" } }
      ]
    }
  ];

  var WEIGHTS = {
    girokonto: {
      bedingungslos: { wichtig: { 'trade-republic-girokonto': 3, 'c24-smart-girokonto': 3, 'n26-standard': 2, 'comdirect-girokonto': 1 }, teils_ok: { 'comdirect-girokonto': 2, 'dkb-girokonto': 2, 'ing-girokonto': 2, 'consorsbank-girokonto': 1 } },
      kartentyp: { debitkarte: { 'trade-republic-girokonto': 1, 'c24-smart-girokonto': 1, 'n26-standard': 1 } },
      ausland: { oft: { 'trade-republic-girokonto': 2, 'c24-smart-girokonto': 2, 'comdirect-girokonto': 1 }, selten: { 'dkb-girokonto': 1, 'ing-girokonto': 1 } },
      guthabenzins: { wichtig: { 'comdirect-girokonto': 3, 'trade-republic-girokonto': 2, 'n26-standard': 1 }, egal: { 'c24-smart-girokonto': 1, 'dkb-girokonto': 1 } }
    },
    depot: {
      bedingungslos: { wichtig: { 'trade-republic-depot': 3, 'scalable-capital-depot': 3, 'flatex-depot': 1 }, teils_ok: { 'comdirect-depot': 2, 'consorsbank-depot': 2 } },
      investstil: { sparplan: { 'scalable-capital-depot': 3, 'trade-republic-depot': 2 }, einzelkauf: { 'flatex-depot': 2, 'comdirect-depot': 1 }, beides: { 'scalable-capital-depot': 2, 'trade-republic-depot': 2 } },
      guthabenzins: { wichtig: { 'comdirect-depot': 3, 'scalable-capital-depot': 2, 'trade-republic-depot': 2 }, egal: { 'flatex-depot': 1 } }
    },
    kreditkarte: {
      kartentyp: { ratenzahlung: { 'barclays-visa': 3, 'hanseatic-genialcard': 3 }, debitkarte: { 'trade-republic-visa': 2, 'c24-mastercard': 2, 'consorsbank-visa': 1 } },
      ausland: { oft: { 'trade-republic-visa': 2, 'consorsbank-visa': 2 }, selten: { 'hanseatic-genialcard': 1, 'barclays-visa': 1 } },
      bedingungslos: { wichtig: { 'trade-republic-visa': 1, 'c24-mastercard': 1 } }
    },
    tagesgeld: {
      tagesgeld_pref: { zins: { openbank: 3, 'consorsbank-tagesgeld': 2 }, garantie: { 'suresse-direkt': 3, 'consorsbank-tagesgeld': 2, ing: 1 } }
    }
  };

  var CATEGORY_KEYS = ['girokonto', 'depot', 'kreditkarte', 'tagesgeld'];

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function init() {
    var area = document.getElementById('fc-area');
    var progressBar = document.getElementById('fc-progress-bar');
    if (!area) return;

    var answers = {};
    var step = 0;

    function renderProgress() {
      progressBar.style.width = Math.min(100, (step / QUESTIONS.length) * 100) + '%';
    }

    function renderQuestion() {
      renderProgress();
      var q = QUESTIONS[step];
      var html = '<div class="quiz-step-label">' + STR.of(step + 1, QUESTIONS.length) + '</div>';
      html += '<h3 class="quiz-question">' + escapeHtml(q.text[LANG]) + '</h3>';
      html += '<div class="quiz-options">';
      q.options.forEach(function (opt) {
        html += '<button type="button" class="quiz-opt-btn" data-qid="' + q.id + '" data-oid="' + opt.id + '">' + escapeHtml(opt.label[LANG]) + '</button>';
      });
      html += '</div>';
      if (step > 0) html += '<button type="button" class="quiz-back-btn" id="fc-back">' + STR.back + '</button>';
      area.innerHTML = html;

      area.querySelectorAll('.quiz-opt-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          answers[btn.getAttribute('data-qid')] = btn.getAttribute('data-oid');
          step++;
          if (step >= QUESTIONS.length) renderResult();
          else renderQuestion();
        });
      });
      var backBtn = document.getElementById('fc-back');
      if (backBtn) backBtn.addEventListener('click', function () { step--; renderQuestion(); });
    }

    function scoreCategory(cat) {
      var scores = {};
      Object.keys(answers).forEach(function (qid) {
        var oid = answers[qid];
        var pointMap = (WEIGHTS[cat][qid] && WEIGHTS[cat][qid][oid]) || {};
        Object.keys(pointMap).forEach(function (id) { scores[id] = (scores[id] || 0) + pointMap[id]; });
      });
      return scores;
    }

    function factRows(cat, item) {
      if (cat === 'girokonto') {
        var dispoText = item.dispozins != null ? item.dispozins.toFixed(2).replace('.', LANG === 'de' ? ',' : '.') + ' %' : STR.noDispo;
        return [
          [LANG === 'en' ? 'Account fee' : 'Kontoführung', item.kontofuehrung],
          [LANG === 'en' ? 'Overdraft rate' : 'Dispozins', dispoText],
          [LANG === 'en' ? 'Card' : 'Karte', item.karteNetzwerk]
        ];
      }
      if (cat === 'depot') {
        return [
          [LANG === 'en' ? 'Account fee' : 'Depotgebühr', item.depotgebuehrText],
          [LANG === 'en' ? 'Min. savings rate' : 'Mind. Sparrate', item.mindestsparrate + ' €'],
          [LANG === 'en' ? 'Cash interest' : 'Guthabenzins', item.guthabenzins ? item.guthabenzins + ' %' : STR.noZins]
        ];
      }
      if (cat === 'kreditkarte') {
        return [
          [LANG === 'en' ? 'Annual fee' : 'Jahresgebühr', item.jahresgebuehr],
          [LANG === 'en' ? 'Card type' : 'Kartentyp', item.kartentyp],
          [LANG === 'en' ? 'FX fee' : 'Fremdwährung', item.fremdwaehrung]
        ];
      }
      return [
        [LANG === 'en' ? 'Rate' : 'Zins', item.rate],
        [LANG === 'en' ? 'Guarantee' : 'Garantie', item.guarantee],
        [LANG === 'en' ? 'Protection' : 'Einlagensicherung', item.protection]
      ];
    }

    function resultCardHtml(cat, item) {
      var rows = factRows(cat, item);
      var rowsHtml = rows.map(function (r) {
        return '<div class="sf-row"><span class="k">' + escapeHtml(r[0]) + '</span><span class="v">' + escapeHtml(String(r[1])) + '</span></div>';
      }).join('');
      var anchor = (cat === 'tagesgeld') ? PAGE_URL[cat] : PAGE_URL[cat] + '#' + item.id;
      return (
        '<div class="result-card fc-result-card">' +
        '<div class="fc-cat-label">' + escapeHtml(STR.categories[cat]) + '</div>' +
        '<div class="quiz-result-head">' +
        '<div class="broker-mark" style="background:' + (item.color || '#163A66') + ';">' + escapeHtml(item.initials) + '</div>' +
        '<div class="broker-name">' + escapeHtml(item.name) + '</div>' +
        '</div>' +
        '<div class="side-facts" style="margin:14px 0;">' + rowsHtml + '</div>' +
        '<div class="quiz-result-actions">' +
        '<a href="' + escapeHtml(item.affiliateUrl) + '" class="cta-btn2" rel="sponsored nofollow">' + STR.cta + '</a>' +
        '<a href="' + anchor + '" class="quiz-see-all">' + STR.seeAll + '</a>' +
        '</div>' +
        '</div>'
      );
    }

    function renderResult() {
      progressBar.style.width = '100%';
      area.innerHTML = '<p class="calc-disclaimer">' + STR.loading + '</p>';

      Promise.all(CATEGORY_KEYS.map(function (cat) {
        return fetch(DATA_SRC[cat]).then(function (r) { return r.json(); });
      })).then(function (datasets) {
        var html = '<h3 class="quiz-question">' + STR.resultTitle + '</h3>';
        html += '<p class="lede" style="margin-bottom:20px;">' + STR.resultLede + '</p>';
        html += '<div class="fc-results-grid">';
        CATEGORY_KEYS.forEach(function (cat, i) {
          var byId = {};
          datasets[i].items.forEach(function (it) { byId[it.id] = it; });
          var scores = scoreCategory(cat);
          var ranked = Object.keys(scores).sort(function (a, b) { return scores[b] - scores[a]; });
          if (!ranked.length) ranked = datasets[i].items.map(function (it) { return it.id; });
          var top = byId[ranked[0]];
          if (top) html += resultCardHtml(cat, top);
        });
        html += '</div>';
        html += '<button type="button" class="cta-btn2 secondary" id="fc-restart">' + STR.restart + '</button>';
        area.innerHTML = html;

        document.getElementById('fc-restart').addEventListener('click', function () {
          answers = {};
          step = 0;
          renderQuestion();
        });
      });
    }

    renderQuestion();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
