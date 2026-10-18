// Generic "which broker fits you" matching quiz. Scores brokers from
// data/broker.json using a small weights table (questions/options -> points
// per broker id), then shows the top match + runner-up with live data from
// the JSON (so it can never drift out of sync with the comparison table).
(function () {
  var LANG = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0 ? 'en' : 'de';
  // Path depth (root page vs. /en/ subfolder) matches how compare.js's own
  // data-source attributes are written per page — read it from the table
  // on the page instead of hardcoding, so this engine works unmodified at
  // either depth.
  var tableEl = document.querySelector('table.compare[data-type="broker"]');
  var baseSrc = tableEl ? tableEl.getAttribute('data-source') : 'data/broker.json';
  var DATA_SRC = LANG === 'en' ? baseSrc.replace(/broker\.json$/, 'broker.en.json') : baseSrc;

  var STR = {
    de: {
      toggleOpen: 'Nicht sicher, welcher Broker passt? Mach den 60-Sekunden-Test →',
      toggleClose: 'Test schließen',
      back: '← Zurück',
      next: 'Weiter',
      of: 'Frage {n} von {total}',
      resultTitle: 'Das passt zu dir',
      resultWhy: 'Warum?',
      runnerUp: 'Das passt auch gut',
      restart: 'Test neu starten',
      seeAll: 'Alle Broker im Vergleich ansehen',
      cta: 'Zum Anbieter',
      loading: 'Lade Empfehlung …',
      reasonTemplate: function (q, opt) { return 'Du hast bei „' + q + '" „' + opt + '" gewählt.'; }
    },
    en: {
      toggleOpen: 'Not sure which broker fits? Take the 60-second quiz →',
      toggleClose: 'Close quiz',
      back: '← Back',
      next: 'Next',
      of: 'Question {n} of {total}',
      resultTitle: 'Your match',
      resultWhy: 'Why?',
      runnerUp: 'Also a good fit',
      restart: 'Restart quiz',
      seeAll: 'See all brokers in the comparison',
      cta: 'View offer',
      loading: 'Loading recommendation …',
      reasonTemplate: function (q, opt) { return 'For "' + q + '" you picked "' + opt + '".'; }
    }
  }[LANG];

  var QUESTIONS = [
    {
      id: 'q1',
      text: { de: 'Was machst du hauptsächlich?', en: 'What do you mainly do?' },
      options: [
        { id: 'sparplan', label: { de: 'ETF-Sparplan (regelmäßig)', en: 'ETF savings plan (regularly)' } },
        { id: 'einzelkauf', label: { de: 'Einzelkäufe (Aktien/ETFs)', en: 'One-off buys (stocks/ETFs)' } },
        { id: 'beides', label: { de: 'Beides', en: 'Both' } }
      ]
    },
    {
      id: 'q2',
      text: { de: 'Wie oft kaufst oder verkaufst du (außerhalb des Sparplans)?', en: 'How often do you buy or sell (outside the savings plan)?' },
      options: [
        { id: 'selten', label: { de: 'Selten (0–2×/Monat)', en: 'Rarely (0–2×/month)' } },
        { id: 'oft', label: { de: 'Oft (3+/Monat)', en: 'Often (3+/month)' } }
      ]
    },
    {
      id: 'q3',
      text: { de: 'Brauchst du Girokonto oder weitere Bankprodukte beim selben Anbieter?', en: 'Do you need a checking account or other banking products from the same provider?' },
      options: [
        { id: 'ja', label: { de: 'Ja, alles aus einer Hand', en: 'Yes, everything in one place' } },
        { id: 'nein', label: { de: 'Nein, nur ein Depot reicht', en: 'No, just a brokerage account is fine' } }
      ]
    },
    {
      id: 'q4',
      text: { de: 'Was ist dir wichtiger?', en: 'What matters more to you?' },
      options: [
        { id: 'kosten', label: { de: 'Möglichst niedrige Kosten', en: 'The lowest possible costs' } },
        { id: 'service', label: { de: 'Große Auswahl & Service', en: 'Wide selection & service' } }
      ]
    }
  ];

  var WEIGHTS = {
    q1: {
      sparplan: { 'scalable-capital': 3, 'trade-republic': 2 },
      einzelkauf: { 'trade-republic': 3, flatex: 2, comdirect: 1 },
      beides: { 'scalable-capital': 2, 'trade-republic': 2 }
    },
    q2: {
      selten: { 'trade-republic': 2, 'scalable-capital': 1 },
      oft: { 'scalable-capital': 3, flatex: 2 }
    },
    q3: {
      ja: { consorsbank: 3, comdirect: 3 },
      nein: { 'trade-republic': 2, 'scalable-capital': 2 }
    },
    q4: {
      kosten: { 'trade-republic': 2, 'scalable-capital': 2 },
      service: { consorsbank: 2, comdirect: 2 }
    }
  };

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function init() {
    var toggleBtn = document.getElementById('quiz-toggle');
    var quizBox = document.getElementById('broker-quiz');
    var area = document.getElementById('quiz-question-area');
    var progressBar = document.getElementById('quiz-progress-bar');
    if (!toggleBtn || !quizBox || !area) return;

    var answers = {};
    var step = 0;
    var brokerData = null;

    function fetchData(cb) {
      if (brokerData) return cb(brokerData);
      fetch(DATA_SRC)
        .then(function (res) { return res.json(); })
        .then(function (data) { brokerData = data; cb(data); })
        .catch(function () { area.innerHTML = '<p class="calc-disclaimer">' + STR.loading + ' — Error</p>'; });
    }

    function renderProgress() {
      var pct = Math.min(100, (step / QUESTIONS.length) * 100);
      progressBar.style.width = pct + '%';
    }

    function renderQuestion() {
      renderProgress();
      var q = QUESTIONS[step];
      var html = '<div class="quiz-step-label">' + STR.of.replace('{n}', step + 1).replace('{total}', QUESTIONS.length) + '</div>';
      html += '<h3 class="quiz-question">' + escapeHtml(q.text[LANG]) + '</h3>';
      html += '<div class="quiz-options">';
      q.options.forEach(function (opt) {
        html += '<button type="button" class="quiz-opt-btn" data-qid="' + q.id + '" data-oid="' + opt.id + '">' + escapeHtml(opt.label[LANG]) + '</button>';
      });
      html += '</div>';
      if (step > 0) {
        html += '<button type="button" class="quiz-back-btn" id="quiz-back">' + STR.back + '</button>';
      }
      area.innerHTML = html;

      area.querySelectorAll('.quiz-opt-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          answers[btn.getAttribute('data-qid')] = btn.getAttribute('data-oid');
          step++;
          if (step >= QUESTIONS.length) {
            renderResult();
          } else {
            renderQuestion();
          }
        });
      });
      var backBtn = document.getElementById('quiz-back');
      if (backBtn) {
        backBtn.addEventListener('click', function () {
          step--;
          renderQuestion();
        });
      }
    }

    function computeScores() {
      var scores = {};
      Object.keys(answers).forEach(function (qid) {
        var oid = answers[qid];
        var pointMap = (WEIGHTS[qid] && WEIGHTS[qid][oid]) || {};
        Object.keys(pointMap).forEach(function (brokerId) {
          scores[brokerId] = (scores[brokerId] || 0) + pointMap[brokerId];
        });
      });
      return scores;
    }

    function reasonsFor(brokerId) {
      var reasons = [];
      QUESTIONS.forEach(function (q) {
        var oid = answers[q.id];
        if (!oid) return;
        var pointMap = (WEIGHTS[q.id] && WEIGHTS[q.id][oid]) || {};
        if (pointMap[brokerId] && pointMap[brokerId] >= 2) {
          var opt = q.options.filter(function (o) { return o.id === oid; })[0];
          reasons.push(STR.reasonTemplate(q.text[LANG], opt.label[LANG]));
        }
      });
      return reasons;
    }

    function brokerCardHtml(item, reasons, isTop) {
      var markStyle = item.color ? ' style="background:' + item.color + ';"' : '';
      var cls = isTop ? 'result-card highlight quiz-result-card' : 'result-card quiz-result-card';
      var reasonsHtml = reasons.length
        ? '<ul class="quiz-reasons">' + reasons.map(function (r) { return '<li>' + escapeHtml(r) + '</li>'; }).join('') + '</ul>'
        : '';
      return '<div class="' + cls + '">' +
        '<div class="quiz-result-head">' +
          '<div class="broker-mark"' + markStyle + '>' + escapeHtml(item.initials) + '</div>' +
          '<div><div class="broker-name">' + escapeHtml(item.name) + '</div>' +
          '<div class="rating"><span class="stars">' + item.ratingStars + '</span><span class="score">' + (LANG === 'en' ? item.rating.toFixed(1) : item.rating.toFixed(1).replace('.', ',')) + '</span></div></div>' +
        '</div>' +
        '<div class="side-facts" style="margin:14px 0;">' +
          '<div class="sf-row"><span class="k">' + (LANG === 'en' ? 'Custody fee' : 'Depotgebühr') + '</span><span class="v">' + escapeHtml(item.depotfee) + '</span></div>' +
          '<div class="sf-row"><span class="k">' + (LANG === 'en' ? 'Order fee' : 'Ordergebühr') + '</span><span class="v">' + escapeHtml(item.orderfee) + '</span></div>' +
          '<div class="sf-row"><span class="k">' + (LANG === 'en' ? 'Savings plan from' : 'Sparplan ab') + '</span><span class="v">' + escapeHtml(item.sparplanAb) + '</span></div>' +
        '</div>' +
        reasonsHtml +
        '<a href="' + item.affiliateUrl + '" class="cta-btn2' + (isTop ? '' : ' secondary') + '" style="margin-top:10px;display:inline-block;" rel="sponsored nofollow">' + STR.cta + '</a>' +
        '</div>';
    }

    function renderResult() {
      progressBar.style.width = '100%';
      fetchData(function (data) {
        var byId = {};
        data.items.forEach(function (it) { byId[it.id] = it; });
        var scores = computeScores();
        var ranked = Object.keys(scores).sort(function (a, b) { return scores[b] - scores[a]; });
        if (!ranked.length) ranked = data.items.map(function (it) { return it.id; });
        var topId = ranked[0];
        var runnerUpId = ranked[1];
        var top = byId[topId];
        var runnerUp = runnerUpId ? byId[runnerUpId] : null;

        var html = '<h3 class="quiz-question">' + STR.resultTitle + '</h3>';
        html += brokerCardHtml(top, reasonsFor(topId), true);
        if (runnerUp) {
          html += '<div class="quiz-runner-label">' + STR.runnerUp + '</div>';
          html += brokerCardHtml(runnerUp, reasonsFor(runnerUpId), false);
        }
        html += '<div class="quiz-result-actions">' +
          '<button type="button" class="cta-btn2 secondary" id="quiz-restart">' + STR.restart + '</button>' +
          '<a href="#" class="quiz-see-all" id="quiz-see-all">' + STR.seeAll + '</a>' +
          '</div>';
        area.innerHTML = html;

        document.getElementById('quiz-restart').addEventListener('click', function () {
          answers = {};
          step = 0;
          renderQuestion();
        });
        document.getElementById('quiz-see-all').addEventListener('click', function (e) {
          e.preventDefault();
          quizBox.hidden = true;
          toggleBtn.textContent = STR.toggleOpen;
          var table = document.querySelector('table.compare');
          if (table) table.scrollIntoView({ behavior: 'smooth' });
        });
      });
    }

    toggleBtn.addEventListener('click', function () {
      var isHidden = quizBox.hidden;
      quizBox.hidden = !isHidden;
      toggleBtn.textContent = isHidden ? STR.toggleClose : STR.toggleOpen;
      if (isHidden && area.innerHTML === '') {
        renderQuestion();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
