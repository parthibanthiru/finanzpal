(function () {
  var LANG = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0 ? 'en' : 'de';
  var LOCALE = LANG === 'en' ? 'en-IE' : 'de-DE';
  var STR = LANG === 'en'
    ? { year: 'Year', years: function (n) { return n + ' ' + (n === 1 ? 'year' : 'years'); }, months: function (n) { return n + ' ' + (n === 1 ? 'month' : 'months'); }, pct: function (v) { return v.toFixed(2) + ' %'; } }
    : { year: 'Jahr', years: function (n) { return n + ' ' + (n === 1 ? 'Jahr' : 'Jahre'); }, months: function (n) { return n + ' Monate'; }, pct: function (v) { return v.toFixed(2).replace('.', ',') + ' %'; } };

  function formatEUR(n) {
    return n.toLocaleString(LOCALE, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  }
  function formatEURCents(n) {
    return n.toLocaleString(LOCALE, { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
  }

  // Standard annuity loan: fixed monthly payment, declining balance.
  function calcLoan(amount, annualRatePct, termMonths) {
    var r = annualRatePct / 100 / 12;
    var payment;
    if (r === 0) {
      payment = amount / termMonths;
    } else {
      payment = amount * r / (1 - Math.pow(1 + r, -termMonths));
    }
    var balance = amount;
    var totalInterest = 0;
    var series = []; // per-year snapshot
    var cumInterest = 0;
    for (var m = 1; m <= termMonths; m++) {
      var interestPortion = balance * r;
      var principalPortion = payment - interestPortion;
      balance = Math.max(0, balance - principalPortion);
      totalInterest += interestPortion;
      cumInterest += interestPortion;
      if (m % 12 === 0 || m === termMonths) {
        series.push({ year: Math.ceil(m / 12), balance: balance, cumInterest: cumInterest });
      }
    }
    return { payment: payment, totalInterest: totalInterest, totalCost: amount + totalInterest, series: series };
  }

  function renderChart(container, series, amount) {
    container.innerHTML = '';
    var maxVal = amount || 1;
    series.forEach(function (point) {
      var col = document.createElement('div');
      col.className = 'bar-col';
      col.title = STR.year + ' ' + point.year + ': ' + formatEUR(point.balance) + ' Restschuld';

      var balancePct = Math.max(2, (point.balance / maxVal) * 100);
      var paidPct = Math.max(0, 100 - balancePct);

      var paidSeg = document.createElement('div');
      paidSeg.className = 'bar-seg-interest';
      paidSeg.style.height = paidPct + '%';

      var balanceSeg = document.createElement('div');
      balanceSeg.className = 'bar-seg-contrib';
      balanceSeg.style.height = balancePct + '%';

      col.appendChild(paidSeg);
      col.appendChild(balanceSeg);
      container.appendChild(col);
    });
  }

  function init() {
    var amountEl = document.getElementById('amount');
    var rateEl = document.getElementById('rate');
    var termEl = document.getElementById('term');

    var amountVal = document.getElementById('amount-val');
    var rateVal = document.getElementById('rate-val');
    var termVal = document.getElementById('term-val');

    var resultPayment = document.getElementById('result-payment');
    var resultInterest = document.getElementById('result-interest');
    var resultTotal = document.getElementById('result-total');
    var chartEl = document.getElementById('bar-chart');

    function update() {
      var amount = Number(amountEl.value);
      var rate = Number(rateEl.value);
      var term = Number(termEl.value);

      amountVal.textContent = formatEUR(amount);
      rateVal.textContent = STR.pct(rate);
      termVal.textContent = STR.months(term);

      var result = calcLoan(amount, rate, term);

      resultPayment.textContent = formatEURCents(result.payment);
      resultInterest.textContent = formatEUR(result.totalInterest);
      resultTotal.textContent = formatEUR(result.totalCost);

      renderChart(chartEl, result.series, amount);
    }

    [amountEl, rateEl, termEl].forEach(function (el) {
      el.addEventListener('input', update);
    });

    update();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
