(function () {
  var LANG = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0 ? 'en' : 'de';
  var LOCALE = LANG === 'en' ? 'en-IE' : 'de-DE';
  var STR = LANG === 'en'
    ? { year: 'Year', years: function (n) { return n + ' ' + (n === 1 ? 'year' : 'years'); }, pct: function (v) { return v.toFixed(2) + ' %'; } }
    : { year: 'Jahr', years: function (n) { return n + ' ' + (n === 1 ? 'Jahr' : 'Jahre'); }, pct: function (v) { return v.toFixed(2).replace('.', ',') + ' %'; } };

  function formatEUR(n) {
    return n.toLocaleString(LOCALE, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  }

  // Standard German Annuitätendarlehen: a fixed monthly payment (Rate) made up
  // of interest + principal (Tilgung); the interest share shrinks and the
  // principal share grows every month as the remaining balance falls.
  function calcSeries(darlehen, zinsPct, tilgungPct, zinsbindungJahre) {
    var monthlyRate = darlehen * (zinsPct + tilgungPct) / 100 / 12;
    var r = zinsPct / 100 / 12;
    var balance = darlehen;
    var series = [];
    var yearInterest = 0;
    var yearPrincipal = 0;

    for (var m = 1; m <= zinsbindungJahre * 12; m++) {
      var interestPart = balance * r;
      var principalPart = Math.min(monthlyRate - interestPart, balance);
      balance = Math.max(0, balance - principalPart);
      yearInterest += interestPart;
      yearPrincipal += principalPart;

      if (m % 12 === 0) {
        series.push({ year: m / 12, balance: balance, interestPaid: yearInterest, principalPaid: yearPrincipal });
        yearInterest = 0;
        yearPrincipal = 0;
      }
      if (balance <= 0) break;
    }
    return { monthlyRate: monthlyRate, series: series, restschuld: balance };
  }

  // Rough estimate: how many more years it would take to pay off the
  // remaining balance if the current rate (Zins + Tilgung) stayed exactly
  // the same for the whole term. Real mortgages renegotiate the rate after
  // the Zinsbindung ends (Anschlussfinanzierung), so this is illustrative
  // only, not a forecast.
  function estimateFullPayoffYears(darlehen, zinsPct, tilgungPct) {
    var monthlyRate = darlehen * (zinsPct + tilgungPct) / 100 / 12;
    var r = zinsPct / 100 / 12;
    if (r <= 0) return darlehen / monthlyRate / 12;
    if (monthlyRate <= darlehen * r) return null; // Rate doesn't even cover the interest — balance never shrinks
    var months = -Math.log(1 - (darlehen * r) / monthlyRate) / Math.log(1 + r);
    return months / 12;
  }

  function renderChart(container, series) {
    container.innerHTML = '';
    var maxVal = 0;
    series.forEach(function (p) { maxVal = Math.max(maxVal, p.interestPaid + p.principalPaid); });
    if (!maxVal) maxVal = 1;
    var step = series.length > 20 ? Math.ceil(series.length / 20) : 1;
    series.forEach(function (point, idx) {
      if (idx % step !== 0 && idx !== series.length - 1) return;
      var col = document.createElement('div');
      col.className = 'bar-col';
      col.title = STR.year + ' ' + point.year + ': ' + formatEUR(point.principalPaid) + ' Tilgung, ' + formatEUR(point.interestPaid) + ' Zinsen';

      var principalPct = Math.max(2, (point.principalPaid / maxVal) * 100);
      var interestPct = Math.max(0, (point.interestPaid / maxVal) * 100);

      var interestSeg = document.createElement('div');
      interestSeg.className = 'bar-seg-interest';
      interestSeg.style.height = interestPct + '%';

      var principalSeg = document.createElement('div');
      principalSeg.className = 'bar-seg-contrib';
      principalSeg.style.height = principalPct + '%';

      col.appendChild(interestSeg);
      col.appendChild(principalSeg);
      container.appendChild(col);
    });
  }

  function init() {
    var darlehenEl = document.getElementById('bf-darlehen');
    var zinsEl = document.getElementById('bf-zins');
    var tilgungEl = document.getElementById('bf-tilgung');
    var zinsbindungEl = document.getElementById('bf-zinsbindung');

    var darlehenVal = document.getElementById('bf-darlehen-val');
    var zinsVal = document.getElementById('bf-zins-val');
    var tilgungVal = document.getElementById('bf-tilgung-val');
    var zinsbindungVal = document.getElementById('bf-zinsbindung-val');

    var resultRate = document.getElementById('bf-result-rate');
    var resultRestschuld = document.getElementById('bf-result-restschuld');
    var resultZinsen = document.getElementById('bf-result-zinsen');
    var payoffNote = document.getElementById('bf-payoff-note');
    var chartEl = document.getElementById('bf-bar-chart');

    function update() {
      var darlehen = Number(darlehenEl.value);
      var zins = Number(zinsEl.value);
      var tilgung = Number(tilgungEl.value);
      var zinsbindung = Number(zinsbindungEl.value);

      darlehenVal.textContent = formatEUR(darlehen);
      zinsVal.textContent = STR.pct(zins);
      tilgungVal.textContent = STR.pct(tilgung);
      zinsbindungVal.textContent = STR.years(zinsbindung);

      var result = calcSeries(darlehen, zins, tilgung, zinsbindung);
      var totalInterest = result.series.reduce(function (sum, p) { return sum + p.interestPaid; }, 0);

      resultRate.textContent = formatEUR(result.monthlyRate) + (LANG === 'en' ? '/mo' : '/Monat');
      resultRestschuld.textContent = formatEUR(result.restschuld);
      resultZinsen.textContent = formatEUR(totalInterest);

      var payoffYears = estimateFullPayoffYears(darlehen, zins, tilgung);
      if (payoffNote) {
        if (payoffYears === null) {
          payoffNote.textContent = LANG === 'en'
            ? 'At this rate, the monthly payment doesn’t even cover the interest — the balance would grow, not shrink. Increase the repayment rate.'
            : 'Bei diesem Zins deckt die Monatsrate nicht einmal die Zinsen — die Restschuld würde wachsen statt sinken. Erhöhe die Tilgungsrate.';
        } else {
          payoffNote.textContent = (LANG === 'en'
            ? 'If the interest rate stayed exactly as entered above for the whole term (illustrative only — real mortgages renegotiate the rate after the fixed period), you would be debt-free after about '
            : 'Bliebe der Zinssatz über die gesamte Laufzeit exakt wie oben eingegeben (nur zur Orientierung — bei einer echten Finanzierung wird der Zins nach der Zinsbindung neu verhandelt), wärst du nach rund ')
            + (LANG === 'en'
              ? STR.years(Math.round(payoffYears)) + '.'
              // dative after "nach": "nach rund 29 Jahren"
              : Math.round(payoffYears) + ' ' + (Math.round(payoffYears) === 1 ? 'Jahr' : 'Jahren') + ' schuldenfrei.');
        }
      }

      renderChart(chartEl, result.series);
    }

    [darlehenEl, zinsEl, tilgungEl, zinsbindungEl].forEach(function (el) {
      el.addEventListener('input', update);
    });

    update();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
