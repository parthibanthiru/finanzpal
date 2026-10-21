(function () {
  var LANG = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0 ? 'en' : 'de';
  var LOCALE = LANG === 'en' ? 'en-IE' : 'de-DE';

  function formatEUR(n) {
    return n.toLocaleString(LOCALE, { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
  }
  function formatEURRound(n) {
    return n.toLocaleString(LOCALE, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  }
  function formatPct(v) {
    return LANG === 'en' ? v.toFixed(2) + ' %' : v.toFixed(2).replace('.', ',') + ' %';
  }

  // ---- 2026 parameters (see page disclaimer for sources) ----
  var RV_SATZ = 0.093;        // Rentenversicherung, Arbeitnehmeranteil
  var ALV_SATZ = 0.013;       // Arbeitslosenversicherung, Arbeitnehmeranteil
  var KV_GRUNDSATZ = 0.073;   // Krankenversicherung, Arbeitnehmer-Grundanteil (ohne Zusatzbeitrag)
  var PV_SATZ = 0.018;        // Pflegeversicherung, Arbeitnehmeranteil (mit Kind)
  var PV_ZUSCHLAG_KINDERLOS = 0.006; // Zuschlag für Kinderlose ab 23, allein vom Arbeitnehmer getragen

  var BBG_RV_ALV_MONAT = 8450;   // Beitragsbemessungsgrenze Renten-/Arbeitslosenversicherung
  var BBG_KV_PV_MONAT = 5812.50; // Beitragsbemessungsgrenze Kranken-/Pflegeversicherung

  var GRUNDFREIBETRAG = 12348;
  var WERBUNGSKOSTENPAUSCHALE = 1230;
  var SONDERAUSGABENPAUSCHALE = 36;

  var SOLI_FREIGRENZE = 20350;

  function estTariff(zvE) {
    // §32a EStG, Grundtabelle (Steuerklasse I), Stand 2026
    var x = Math.floor(Math.max(0, zvE));
    if (x <= GRUNDFREIBETRAG) return 0;
    if (x <= 17799) {
      var y = (x - GRUNDFREIBETRAG) / 10000;
      return (914.51 * y + 1400) * y;
    }
    if (x <= 69878) {
      var z = (x - 17799) / 10000;
      return (173.10 * z + 2397) * z + 1034.87;
    }
    if (x <= 277825) {
      return 0.42 * x - 11135.63;
    }
    return 0.45 * x - 19470.38;
  }

  function soliTarif(est) {
    if (est <= SOLI_FREIGRENZE) return 0;
    var voll = est * 0.055;
    var milderung = (est - SOLI_FREIGRENZE) * 0.119;
    return Math.min(voll, milderung);
  }

  function calc(bruttoMonat, zusatzbeitragPct, kinderlos, kirchensteuerSatz) {
    var bruttoJahr = bruttoMonat * 12;

    var svBasisRvAlv = Math.min(bruttoMonat, BBG_RV_ALV_MONAT);
    var svBasisKvPv = Math.min(bruttoMonat, BBG_KV_PV_MONAT);

    var rv = svBasisRvAlv * RV_SATZ;
    var alv = svBasisRvAlv * ALV_SATZ;
    var kv = svBasisKvPv * (KV_GRUNDSATZ + zusatzbeitragPct / 100 / 2);
    var pvSatz = PV_SATZ + (kinderlos ? PV_ZUSCHLAG_KINDERLOS : 0);
    var pv = svBasisKvPv * pvSatz;

    var svMonat = rv + alv + kv + pv;
    var svJahr = svMonat * 12;

    // Vereinfachte Vorsorgepauschale: Näherung über die tatsächlich gezahlten
    // SV-Beiträge statt der amtlichen Formel (siehe Disclaimer auf der Seite).
    var zvE = bruttoJahr - svJahr - WERBUNGSKOSTENPAUSCHALE - SONDERAUSGABENPAUSCHALE;
    if (zvE < 0) zvE = 0;

    var estJahr = estTariff(zvE);
    var soliJahr = soliTarif(estJahr);
    var kistJahr = estJahr * (kirchensteuerSatz / 100);

    var estMonat = estJahr / 12;
    var soliMonat = soliJahr / 12;
    var kistMonat = kistJahr / 12;

    var nettoMonat = bruttoMonat - svMonat - estMonat - soliMonat - kistMonat;

    return {
      bruttoMonat: bruttoMonat,
      rv: rv, alv: alv, kv: kv, pv: pv, svMonat: svMonat,
      estMonat: estMonat, soliMonat: soliMonat, kistMonat: kistMonat,
      nettoMonat: nettoMonat,
      zvEJahr: zvE
    };
  }

  function init() {
    var bruttoEl = document.getElementById('nl-brutto');
    var zusatzbeitragEl = document.getElementById('nl-zusatzbeitrag');
    var kinderlosEl = document.getElementById('nl-kinderlos');
    var kirchensteuerEl = document.getElementById('nl-kirchensteuer');

    var bruttoVal = document.getElementById('nl-brutto-val');
    var zusatzbeitragVal = document.getElementById('nl-zusatzbeitrag-val');

    var resultNetto = document.getElementById('nl-result-netto');
    var resultSv = document.getElementById('nl-result-sv');
    var resultSteuer = document.getElementById('nl-result-steuer');

    var rowRv = document.getElementById('nl-row-rv');
    var rowAlv = document.getElementById('nl-row-alv');
    var rowKv = document.getElementById('nl-row-kv');
    var rowPv = document.getElementById('nl-row-pv');
    var rowEst = document.getElementById('nl-row-est');
    var rowSoli = document.getElementById('nl-row-soli');
    var rowKist = document.getElementById('nl-row-kist');
    var rowNetto = document.getElementById('nl-row-netto');

    function update() {
      var brutto = Number(bruttoEl.value);
      var zusatzbeitrag = Number(zusatzbeitragEl.value);
      var kinderlos = kinderlosEl.checked;
      var kist = Number(kirchensteuerEl.value);

      bruttoVal.textContent = formatEURRound(brutto);
      zusatzbeitragVal.textContent = formatPct(zusatzbeitrag);

      var r = calc(brutto, zusatzbeitrag, kinderlos, kist);

      resultNetto.textContent = formatEUR(r.nettoMonat);
      resultSv.textContent = formatEUR(r.svMonat);
      resultSteuer.textContent = formatEUR(r.estMonat + r.soliMonat + r.kistMonat);

      rowRv.textContent = formatEUR(r.rv);
      rowAlv.textContent = formatEUR(r.alv);
      rowKv.textContent = formatEUR(r.kv);
      rowPv.textContent = formatEUR(r.pv);
      rowEst.textContent = formatEUR(r.estMonat);
      rowSoli.textContent = formatEUR(r.soliMonat);
      rowKist.textContent = formatEUR(r.kistMonat);
      rowNetto.textContent = formatEUR(r.nettoMonat);
    }

    [bruttoEl, zusatzbeitragEl, kirchensteuerEl].forEach(function (el) {
      el.addEventListener('input', update);
      el.addEventListener('change', update);
    });
    kinderlosEl.addEventListener('change', update);

    update();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
