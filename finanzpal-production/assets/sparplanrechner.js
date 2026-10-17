(function () {
  function formatEUR(n) {
    return n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  }

  function calcSeries(initial, monthly, years, annualRatePct) {
    var r = annualRatePct / 100 / 12;
    var balance = initial;
    var contributed = initial;
    var series = [];
    for (var y = 1; y <= years; y++) {
      for (var m = 0; m < 12; m++) {
        balance = balance * (1 + r) + monthly;
        contributed += monthly;
      }
      series.push({ year: y, balance: balance, contributed: contributed, interest: balance - contributed });
    }
    return series;
  }

  function renderChart(container, series) {
    container.innerHTML = '';
    var maxVal = series[series.length - 1].balance || 1;
    // Thin out labels/bars if too many years
    var step = series.length > 20 ? Math.ceil(series.length / 20) : 1;
    series.forEach(function (point, idx) {
      if (idx % step !== 0 && idx !== series.length - 1) return;
      var col = document.createElement('div');
      col.className = 'bar-col';
      col.title = 'Jahr ' + point.year + ': ' + formatEUR(point.balance);

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
      container.appendChild(col);
    });
  }

  function init() {
    var initialEl = document.getElementById('initial');
    var monthlyEl = document.getElementById('monthly');
    var yearsEl = document.getElementById('years');
    var rateEl = document.getElementById('rate');

    var initialVal = document.getElementById('initial-val');
    var monthlyVal = document.getElementById('monthly-val');
    var yearsVal = document.getElementById('years-val');
    var rateVal = document.getElementById('rate-val');

    var resultFinal = document.getElementById('result-final');
    var resultContributed = document.getElementById('result-contributed');
    var resultInterest = document.getElementById('result-interest');
    var chartEl = document.getElementById('bar-chart');

    function update() {
      var initial = Number(initialEl.value);
      var monthly = Number(monthlyEl.value);
      var years = Number(yearsEl.value);
      var rate = Number(rateEl.value);

      initialVal.textContent = formatEUR(initial);
      monthlyVal.textContent = formatEUR(monthly);
      yearsVal.textContent = years + ' Jahre';
      rateVal.textContent = rate.toFixed(1).replace('.', ',') + ' %';

      var series = calcSeries(initial, monthly, years, rate);
      var last = series[series.length - 1];

      resultFinal.textContent = formatEUR(last.balance);
      resultContributed.textContent = formatEUR(last.contributed);
      resultInterest.textContent = formatEUR(last.interest);

      renderChart(chartEl, series);
    }

    [initialEl, monthlyEl, yearsEl, rateEl].forEach(function (el) {
      el.addEventListener('input', update);
    });

    update();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
