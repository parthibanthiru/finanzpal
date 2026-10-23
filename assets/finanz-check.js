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
    depot: PREFIX + 'data/broker' + SUFFIX + '.json',
    kreditkarte: PREFIX + 'data/kreditkarte' + SUFFIX + '.json',
    tagesgeld: PREFIX + 'data/tagesgeld' + SUFFIX + '.json'
  };

  var PAGE_URL = {
    girokonto: PREFIX + 'girokonto.html',
    depot: PREFIX + 'broker.html',
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
    categories: { girokonto: 'Checking account', depot: 'Custody account', kreditkarte: 'Credit card', tagesgeld: 'Instant savings account' },
    loading: 'Loading your result …',
    noDispo: 'No overdraft', noZins: '–',
    cta: 'View offer',
    reasonTemplate: function (q, opt) { return 'For "' + q + '" you picked "' + opt + '".'; }
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
    cta: 'Zum Anbieter',
    reasonTemplate: function (q, opt) { return 'Du hast bei „' + q + '" „' + opt + '" gewählt.'; }
  };

  // Small line-icon + accent color per category, purely decorative — makes
  // the four result cards scannable at a glance and ties each one back to
  // its full comparison page's own visual identity. Reuses existing design
  // tokens (no new colors) so it behaves correctly in dark mode for free.
  var CATEGORY_ICON = {
    girokonto: '<svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l7-4 7 4"/><path d="M4 8v7M8 8v7M12 8v7M16 8v7"/><path d="M2.5 17h15"/></svg>',
    depot: '<svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17V11M9 17V7M15 17V4"/><path d="M2.5 17h15"/></svg>',
    kreditkarte: '<svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4.5" width="15" height="11" rx="2"/><path d="M2.5 8.5h15"/></svg>',
    tagesgeld: '<svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7"/><path d="M7 13l6-6M7.3 8.2h.01M12.7 11.8h.01"/></svg>'
  };
  var CATEGORY_ACCENT = { girokonto: 'var(--green-deep)', depot: 'var(--gold)', kreditkarte: 'var(--red-soft)', tagesgeld: 'var(--green)' };

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
      text: { de: 'Beim Tagesgeld: Ist dir die Zinshöhe oder eine lange Zinsgarantie wichtiger?', en: 'For instant savings: does the rate or a long rate guarantee matter more?' },
      options: [
        { id: 'zins', label: { de: 'Möglichst hoher Zins', en: 'The highest possible rate' } },
        { id: 'garantie', label: { de: 'Lange garantierte Laufzeit', en: 'A long guaranteed period' } }
      ]
    },
    {
      id: 'guthabenzins',
      text: { de: 'Wie wichtig ist dir Verzinsung auf dein Giro-/Depot-Guthaben?', en: 'How important is interest on your checking account / custody cash balance?' },
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
      bedingungslos: { wichtig: { 'trade-republic': 3, 'scalable-capital': 3, flatex: 1 }, teils_ok: { comdirect: 2, consorsbank: 2 } },
      investstil: { sparplan: { 'scalable-capital': 3, 'trade-republic': 2 }, einzelkauf: { flatex: 2, comdirect: 1 }, beides: { 'scalable-capital': 2, 'trade-republic': 2 } },
      guthabenzins: { wichtig: { comdirect: 3, 'scalable-capital': 2, 'trade-republic': 2 }, egal: { flatex: 1 } }
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

  var OPT_LETTERS = ['A', 'B', 'C', 'D'];

  function init() {
    var area = document.getElementById('fc-area');
    var progressBar = document.getElementById('fc-progress-bar');
    var stepDotsEl = document.getElementById('fc-step-dots');
    if (!area) return;

    var answers = {};
    var step = 0;

    // Re-triggers the fade/slide-in animation on every question/result
    // change by toggling the class off and back on (a plain class add
    // wouldn't replay a CSS animation that's already "finished" on this
    // element).
    function animateIn() {
      area.classList.remove('fc-panel');
      void area.offsetWidth;
      area.classList.add('fc-panel');
    }

    function renderProgress() {
      progressBar.style.width = Math.min(100, (step / QUESTIONS.length) * 100) + '%';
      if (!stepDotsEl) return;
      var dots = '';
      for (var i = 0; i < QUESTIONS.length; i++) {
        var cls = 'fc-step-dot' + (i < step ? ' is-done' : '') + (i === step ? ' is-current' : '');
        dots += '<span class="' + cls + '"></span>';
      }
      stepDotsEl.innerHTML = dots;
    }

    function renderQuestion() {
      renderProgress();
      var q = QUESTIONS[step];
      var html = '<div class="quiz-step-label">' + STR.of(step + 1, QUESTIONS.length) + '</div>';
      html += '<h3 class="quiz-question">' + escapeHtml(q.text[LANG]) + '</h3>';
      html += '<div class="quiz-options">';
      q.options.forEach(function (opt, i) {
        html += '<button type="button" class="quiz-opt-btn" data-qid="' + q.id + '" data-oid="' + opt.id + '">' +
          '<span class="fc-opt-letter">' + (OPT_LETTERS[i] || (i + 1)) + '</span>' +
          '<span>' + escapeHtml(opt.label[LANG]) + '</span>' +
          '</button>';
      });
      html += '</div>';
      if (step > 0) html += '<button type="button" class="quiz-back-btn" id="fc-back">' + STR.back + '</button>';
      area.innerHTML = html;
      animateIn();

      area.querySelectorAll('.quiz-opt-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (btn.classList.contains('is-selected')) return;
          area.querySelectorAll('.quiz-opt-btn').forEach(function (b) { b.classList.remove('is-selected'); });
          btn.classList.add('is-selected');
          answers[btn.getAttribute('data-qid')] = btn.getAttribute('data-oid');
          // A short pause so the selected state is actually visible before
          // the next question replaces it — a bare instant swap reads as a
          // glitch rather than a deliberate pick.
          setTimeout(function () {
            step++;
            if (step >= QUESTIONS.length) renderResult();
            else renderQuestion();
          }, 180);
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

    // Same pattern as assets/broker-quiz.js's reasonsFor(): walk the
    // answered questions and surface the ones that actually moved the
    // needle for this winning item (weight >= 2), so the "why this pick"
    // list is a real readout of the scoring that already ran, not a new,
    // separately-asserted claim about the provider.
    function reasonsFor(cat, itemId) {
      var reasons = [];
      QUESTIONS.forEach(function (q) {
        var oid = answers[q.id];
        if (!oid) return;
        var pointMap = (WEIGHTS[cat][q.id] && WEIGHTS[cat][q.id][oid]) || {};
        if (pointMap[itemId] && pointMap[itemId] >= 2) {
          var opt = q.options.filter(function (o) { return o.id === oid; })[0];
          reasons.push(STR.reasonTemplate(q.text[LANG], opt.label[LANG]));
        }
      });
      return reasons.slice(0, 2);
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

    function resultCardHtml(cat, item, reasons) {
      var rows = factRows(cat, item);
      var rowsHtml = rows.map(function (r) {
        return '<div class="sf-row"><span class="k">' + escapeHtml(r[0]) + '</span><span class="v">' + escapeHtml(String(r[1])) + '</span></div>';
      }).join('');
      var anchor = (cat === 'tagesgeld') ? PAGE_URL[cat] : PAGE_URL[cat] + '#' + item.id;
      var reasonsHtml = reasons && reasons.length
        ? '<ul class="quiz-reasons fc-why">' + reasons.map(function (r) { return '<li>' + escapeHtml(r) + '</li>'; }).join('') + '</ul>'
        : '';
      return (
        '<div class="result-card fc-result-card" style="--fc-accent:' + CATEGORY_ACCENT[cat] + ';">' +
        '<div class="fc-cat-head">' +
        '<span class="fc-cat-icon">' + CATEGORY_ICON[cat] + '</span>' +
        '<div class="fc-cat-label">' + escapeHtml(STR.categories[cat]) + '</div>' +
        '</div>' +
        '<div class="quiz-result-head">' +
        '<div class="broker-mark" style="background:' + (item.color || '#163A66') + ';">' + escapeHtml(item.initials) + '</div>' +
        '<div class="broker-name">' + escapeHtml(item.name) + '</div>' +
        '</div>' +
        '<div class="side-facts" style="margin:14px 0;">' + rowsHtml + '</div>' +
        reasonsHtml +
        '<div class="quiz-result-actions">' +
        '<a href="' + escapeHtml(item.affiliateUrl) + '" class="cta-btn2" rel="sponsored nofollow">' + STR.cta + '</a>' +
        '<a href="' + anchor + '" class="quiz-see-all">' + STR.seeAll + '</a>' +
        '</div>' +
        '</div>'
      );
    }

    function renderResult() {
      progressBar.style.width = '100%';
      if (stepDotsEl) {
        stepDotsEl.innerHTML = QUESTIONS.map(function () { return '<span class="fc-step-dot is-done"></span>'; }).join('');
      }
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
          if (top) html += resultCardHtml(cat, top, reasonsFor(cat, ranked[0]));
        });
        html += '</div>';
        html += '<button type="button" class="cta-btn2 secondary" id="fc-restart">' + STR.restart + '</button>';
        area.innerHTML = html;
        animateIn();

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
