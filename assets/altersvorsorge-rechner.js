(function () {
  var LANG = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0 ? 'en' : 'de';
  var LOCALE = LANG === 'en' ? 'en-IE' : 'de-DE';
  var STR = LANG === 'en'
    ? {
      age: function (n) { return 'Age ' + n; },
      years: function (n) { return n + ' ' + (n === 1 ? 'year' : 'years'); },
      pct: function (v) { return v.toFixed(1) + ' %'; }
    }
    : {
      age: function (n) { return 'Alter ' + n; },
      years: function (n) { return n + ' ' + (n === 1 ? 'Jahr' : 'Jahre'); },
      pct: function (v) { return v.toFixed(1).replace('.', ',') + ' %'; }
    };

  function formatEUR(n) {
    return Math.round(n).toLocaleString(LOCALE, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  }

  // Savings phase: monthly compounding, monthly contribution, starting lump sum.
  function calcGrowth(initial, monthly, years, annualRatePct, startAge) {
    var r = annualRatePct / 100 / 12;
    var balance = initial;
    var contributed = initial;
    var series = [];
    for (var y = 1; y <= years; y++) {
      for (var m = 0; m < 12; m++) {
        balance = balance * (1 + r) + monthly;
        contributed += monthly;
      }
      series.push({ age: startAge + y, balance: balance, contributed: contributed, interest: balance - contributed, phase: 'spar' });
    }
    return series;
  }

  // Payout phase: level monthly withdrawal that depletes the balance to
  // (approximately) zero over payoutYears, given a payout-phase return rate.
  function calcMonthlyPayout(startBalance, payoutRatePct, payoutYears) {
    var rp = payoutRatePct / 100 / 12;
    var months = payoutYears * 12;
    if (months <= 0) return 0;
    if (Math.abs(rp) < 1e-9) return startBalance / months;
    return (startBalance * rp) / (1 - Math.pow(1 + rp, -months));
  }

  function calcPayoutSeries(startBalance, payoutRatePct, payoutYears, startAge, monthlyPayout) {
    var rp = payoutRatePct / 100 / 12;
    var balance = startBalance;
    var series = [];
    for (var y = 1; y <= payoutYears; y++) {
      for (var m = 0; m < 12; m++) {
        balance = balance * (1 + rp) - monthlyPayout;
        if (balance < 0) balance = 0;
      }
      series.push({ age: startAge + y, balance: balance, phase: 'auszahlung' });
    }
    return series;
  }

  function renderChart(container, growthSeries, payoutSeries) {
    container.innerHTML = '';
    var full = growthSeries.concat(payoutSeries);
    var maxVal = growthSeries.length ? growthSeries[growthSeries.length - 1].balance : 1;
    maxVal = Math.max(maxVal, 1);
    var step = full.length > 24 ? Math.ceil(full.length / 24) : 1;

    full.forEach(function (point, idx) {
      var isLast = idx === full.length - 1;
      if (idx % step !== 0 && !isLast) return;
      var col = document.createElement('div');
      col.className = 'bar-col';
      col.title = STR.age(point.age) + ': ' + formatEUR(point.balance);

      if (point.phase === 'spar') {
        var contribPct = Math.max(2, (point.contributed / maxVal) * 100);
        var interestPct = Math.max(0, (point.interest / maxVal) * 100);
        var contribSeg = document.createElement('div');
        contribSeg.className = 'bar-seg-contrib';
        contribSeg.style.height = contribPct + '%';
        var interestSeg = document.createElement('div');
        interestSeg.className = 'bar-seg-interest';
        interestSeg.style.height = interestPct + '%';
        col.appendChild(interestSeg);
        col.appendChild(contribSeg);
      } else {
        var balPct = Math.max(2, (point.balance / maxVal) * 100);
        var payoutSeg = document.createElement('div');
        payoutSeg.className = 'bar-seg-payout';
        payoutSeg.style.height = balPct + '%';
        col.appendChild(payoutSeg);
      }
      container.appendChild(col);
    });
  }

  function init() {
    var ageEl = document.getElementById('av-age');
    var retireAgeEl = document.getElementById('av-retire-age');
    var initialEl = document.getElementById('av-initial');
    var monthlyEl = document.getElementById('av-monthly');
    var rateSparEl = document.getElementById('av-rate-spar');
    var ratePayoutEl = document.getElementById('av-rate-payout');
    var payoutYearsEl = document.getElementById('av-payout-years');
    if (!ageEl) return;

    var ageVal = document.getElementById('av-age-val');
    var retireAgeVal = document.getElementById('av-retire-age-val');
    var initialVal = document.getElementById('av-initial-val');
    var monthlyVal = document.getElementById('av-monthly-val');
    var rateSparVal = document.getElementById('av-rate-spar-val');
    var ratePayoutVal = document.getElementById('av-rate-payout-val');
    var payoutYearsVal = document.getElementById('av-payout-years-val');

    var resultFinal = document.getElementById('av-result-final');
    var resultContributed = document.getElementById('av-result-contributed');
    var resultInterest = document.getElementById('av-result-interest');
    var resultPension = document.getElementById('av-result-pension');
    var chartEl = document.getElementById('av-chart');

    function update() {
      var age = Number(ageEl.value);
      var retireAge = Math.max(Number(retireAgeEl.value), age + 1);
      var initial = Number(initialEl.value);
      var monthly = Number(monthlyEl.value);
      var rateSpar = Number(rateSparEl.value);
      var ratePayout = Number(ratePayoutEl.value);
      var payoutYears = Number(payoutYearsEl.value);
      var years = retireAge - age;

      ageVal.textContent = age;
      retireAgeVal.textContent = retireAge;
      initialVal.textContent = formatEUR(initial);
      monthlyVal.textContent = formatEUR(monthly);
      rateSparVal.textContent = STR.pct(rateSpar);
      ratePayoutVal.textContent = STR.pct(ratePayout);
      payoutYearsVal.textContent = STR.years(payoutYears);

      var growth = calcGrowth(initial, monthly, years, rateSpar, age);
      var last = growth[growth.length - 1];
      var monthlyPayout = calcMonthlyPayout(last.balance, ratePayout, payoutYears);
      var payout = calcPayoutSeries(last.balance, ratePayout, payoutYears, retireAge, monthlyPayout);

      resultFinal.textContent = formatEUR(last.balance);
      resultContributed.textContent = formatEUR(last.contributed);
      resultInterest.textContent = formatEUR(last.interest);
      resultPension.textContent = formatEUR(monthlyPayout);

      renderChart(chartEl, growth, payout);
    }

    [ageEl, retireAgeEl, initialEl, monthlyEl, rateSparEl, ratePayoutEl, payoutYearsEl].forEach(function (el) {
      el.addEventListener('input', update);
    });

    update();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
