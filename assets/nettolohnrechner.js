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
  function formatNum1(v) {
    return LANG === 'en' ? v.toFixed(1) : v.toFixed(1).replace('.', ',');
  }

  // ---- 2026 parameters (see page disclaimer for sources; official BMF
  // Programmablaufplan für die Lohnsteuer 2026, Stand 12.11.2025) ----
  var RV_SATZ = 0.093;        // Rentenversicherung, Arbeitnehmeranteil
  var ALV_SATZ = 0.013;       // Arbeitslosenversicherung, Arbeitnehmeranteil
  var KV_GRUNDSATZ = 0.073;   // Krankenversicherung, Arbeitnehmer-Grundanteil (ohne Zusatzbeitrag)
  var PV_SATZ = 0.018;        // Pflegeversicherung, Arbeitnehmeranteil (mit Kind, außer Sachsen)
  var PV_SATZ_SACHSEN = 0.023; // Pflegeversicherung AN-Anteil in Sachsen (kein gesetzlicher Feiertagsausgleich)
  var PV_ZUSCHLAG_KINDERLOS = 0.006; // Zuschlag für Kinderlose ab 23, allein vom Arbeitnehmer getragen

  var BBG_RV_ALV_MONAT = 8450;   // Beitragsbemessungsgrenze Renten-/Arbeitslosenversicherung
  var BBG_KV_PV_MONAT = 5812.50; // Beitragsbemessungsgrenze Kranken-/Pflegeversicherung

  var DURCHSCHNITTL_ZUSATZBEITRAG = 2.9; // amtlicher Durchschnittswert 2026, auch Basis des PKV-Arbeitgeberzuschusses

  var GRUNDFREIBETRAG = 12348;
  var WERBUNGSKOSTENPAUSCHALE = 1230;
  var SONDERAUSGABENPAUSCHALE = 36;
  var EFA_ALLEINERZIEHEND = 4260;          // Entlastungsbetrag für Alleinerziehende (Steuerklasse II), 1. Kind
  var EFA_ALLEINERZIEHEND_WEITERES_KIND = 240; // Zuschlag je weiterem Kind
  var KINDERFREIBETRAG_PRO_KIND = 9756;    // Kinderfreibetrag + BEA, beide Elternteile zusammen

  var SOLI_FREIGRENZE = 20350;

  var BUNDESLAENDER = {
    bw: { kist: 8 }, by: { kist: 8 }, be: { kist: 9 }, bb: { kist: 9 },
    hb: { kist: 9 }, hh: { kist: 9 }, he: { kist: 9 }, mv: { kist: 9 },
    ni: { kist: 9 }, nw: { kist: 9 }, rp: { kist: 9 }, sl: { kist: 9 },
    sn: { kist: 9, pvSachsen: true }, st: { kist: 9 }, sh: { kist: 9 }, th: { kist: 9 }
  };

  // §32a EStG Grundtarif 2026. kztab=2 verdoppelt (Splittingverfahren,
  // Steuerklasse III) — amtlich: X = zvE/kztab, Tarif auf X, Ergebnis * kztab.
  function estTariff(zvE, kztab) {
    kztab = kztab || 1;
    var x = Math.max(0, zvE) / kztab;
    var st;
    if (x <= GRUNDFREIBETRAG) {
      st = 0;
    } else if (x <= 17799) {
      var y = (x - GRUNDFREIBETRAG) / 10000;
      st = (914.51 * y + 1400) * y;
    } else if (x <= 69878) {
      var z = (x - 17799) / 10000;
      st = (173.10 * z + 2397) * z + 1034.87;
    } else if (x <= 277825) {
      st = 0.42 * x - 11135.63;
    } else {
      st = 0.45 * x - 19470.38;
    }
    return Math.floor(st * kztab);
  }

  function soliTarif(bemessung, kztab) {
    kztab = kztab || 1;
    var freigrenze = SOLI_FREIGRENZE * kztab;
    if (bemessung <= freigrenze) return 0;
    var voll = bemessung * 0.055;
    var milderung = (bemessung - freigrenze) * 0.119;
    return Math.min(voll, milderung);
  }

  // params: { bruttoMonat, steuerklasse: '1'|'2'|'3'|'4'|'4f'|'5'|'6', faktor,
  //   zkf (Kinderfreibeträge, 0.5er-Schritte), bundesland, kirchensteuerpflichtig,
  //   kvTyp: 'gesetzlich'|'privat', zusatzbeitragPct, pkvPraemieMonat, kinderlos }
  function calc(p) {
    var bl = BUNDESLAENDER[p.bundesland] || BUNDESLAENDER.be;
    var kirchensteuerSatz = p.kirchensteuerpflichtig ? bl.kist : 0;

    var bruttoMonat = p.bruttoMonat;
    var bruttoJahr = bruttoMonat * 12;

    var svBasisRvAlv = Math.min(bruttoMonat, BBG_RV_ALV_MONAT);
    var svBasisKvPv = Math.min(bruttoMonat, BBG_KV_PV_MONAT);

    var rv = svBasisRvAlv * RV_SATZ;
    var alv = svBasisRvAlv * ALV_SATZ;

    var kv, pv, agZuschussPkv = 0;
    if (p.kvTyp === 'privat') {
      var praemie = Math.max(0, p.pkvPraemieMonat || 0);
      var hoechstzuschuss = 0.5 * (0.146 + DURCHSCHNITTL_ZUSATZBEITRAG / 100 + 0.036) * BBG_KV_PV_MONAT;
      agZuschussPkv = Math.min(0.5 * praemie, hoechstzuschuss);
      kv = Math.max(0, praemie - agZuschussPkv);
      pv = 0;
    } else {
      kv = svBasisKvPv * (KV_GRUNDSATZ + p.zusatzbeitragPct / 100 / 2);
      var pvSatz = (bl.pvSachsen ? PV_SATZ_SACHSEN : PV_SATZ) + (p.kinderlos ? PV_ZUSCHLAG_KINDERLOS : 0);
      pv = svBasisKvPv * pvSatz;
    }

    var svMonat = rv + alv + kv + pv;
    var svJahr = svMonat * 12;

    var stkl = p.steuerklasse;
    var kztab = stkl === '3' ? 2 : 1;
    var efa = 0;
    if (stkl === '2') {
      var anzahlKinder = Math.max(1, Math.round(p.zkf || 0));
      efa = EFA_ALLEINERZIEHEND + (anzahlKinder - 1) * EFA_ALLEINERZIEHEND_WEITERES_KIND;
    }
    var ztabfb = WERBUNGSKOSTENPAUSCHALE + SONDERAUSGABENPAUSCHALE + efa;

    // Vereinfachte Vorsorgepauschale: Näherung über die tatsächlich gezahlten
    // Beiträge statt der amtlichen Formel (siehe Disclaimer auf der Seite).
    var zvELst = Math.max(0, bruttoJahr - svJahr - ztabfb);

    var estJahrUnfaktoriert = estTariff(zvELst, kztab);
    var estJahr = stkl === '4f' ? Math.floor(estJahrUnfaktoriert * (p.faktor || 1)) : estJahrUnfaktoriert;

    // Kinderfreibeträge mindern im echten Lohnsteuerabzug nur die
    // Bemessungsgrundlage für Soli/Kirchensteuer, nicht die Lohnsteuer
    // selbst. Beim Faktorverfahren dient die bereits faktorisierte
    // Lohnsteuer direkt als Bemessungsgrundlage (keine zusätzliche KFB-
    // Berücksichtigung, um die Entlastung nicht doppelt anzusetzen).
    var kfbJahr = (p.zkf || 0) * KINDERFREIBETRAG_PRO_KIND;
    var jbmg;
    if (stkl === '4f') {
      jbmg = estJahr;
    } else {
      var zvESoli = Math.max(0, zvELst - kfbJahr);
      jbmg = estTariff(zvESoli, kztab);
    }

    var soliJahr = soliTarif(jbmg, kztab);
    var kistJahr = jbmg * (kirchensteuerSatz / 100);

    var estMonat = estJahr / 12;
    var soliMonat = soliJahr / 12;
    var kistMonat = kistJahr / 12;

    var nettoMonat = bruttoMonat - svMonat - estMonat - soliMonat - kistMonat;

    return {
      bruttoMonat: bruttoMonat,
      rv: rv, alv: alv, kv: kv, pv: pv, svMonat: svMonat,
      agZuschussPkv: agZuschussPkv,
      estMonat: estMonat, soliMonat: soliMonat, kistMonat: kistMonat,
      nettoMonat: nettoMonat,
      zvEJahr: zvELst
    };
  }

  function init() {
    var zeitraumEl = document.getElementById('nl-zeitraum');
    var bruttoEl = document.getElementById('nl-brutto');
    var steuerklasseEl = document.getElementById('nl-steuerklasse');
    var faktorGroup = document.getElementById('nl-faktor-group');
    var faktorEl = document.getElementById('nl-faktor');
    var kinderfreibetragEl = document.getElementById('nl-kinderfreibetrag');
    var bundeslandEl = document.getElementById('nl-bundesland');
    var kirchensteuerpflichtigEl = document.getElementById('nl-kirchensteuerpflichtig');
    var kvtypEl = document.getElementById('nl-kvtyp');
    var zusatzbeitragGroup = document.getElementById('nl-zusatzbeitrag-group');
    var zusatzbeitragEl = document.getElementById('nl-zusatzbeitrag');
    var pkvGroup = document.getElementById('nl-pkv-group');
    var pkvEl = document.getElementById('nl-pkv-praemie');
    var kinderlosEl = document.getElementById('nl-kinderlos');
    var kinderlosRow = document.getElementById('nl-kinderlos-row');

    var bruttoVal = document.getElementById('nl-brutto-val');
    var kinderfreibetragVal = document.getElementById('nl-kinderfreibetrag-val');
    var zusatzbeitragVal = document.getElementById('nl-zusatzbeitrag-val');
    var nettoLabel = document.getElementById('nl-netto-label');

    var resultNormal = document.getElementById('nl-result-normal');
    var result56 = document.getElementById('nl-result-56');

    var resultNetto = document.getElementById('nl-result-netto');
    var resultSv = document.getElementById('nl-result-sv');
    var resultSteuer = document.getElementById('nl-result-steuer');

    var rowRv = document.getElementById('nl-row-rv');
    var rowAlv = document.getElementById('nl-row-alv');
    var rowKvLabel = document.getElementById('nl-row-kv-label');
    var rowKv = document.getElementById('nl-row-kv');
    var rowPvWrap = document.getElementById('nl-row-pv-wrap');
    var rowPv = document.getElementById('nl-row-pv');
    var rowEst = document.getElementById('nl-row-est');
    var rowSoli = document.getElementById('nl-row-soli');
    var rowKist = document.getElementById('nl-row-kist');
    var rowNetto = document.getElementById('nl-row-netto');

    var STR = LANG === 'en' ? {
      nettoMonat: 'Net per month', nettoJahr: 'Net per year',
      kvLabel: 'Health insurance', pkvLabel: 'Private health insurance (your share)'
    } : {
      nettoMonat: 'Netto pro Monat', nettoJahr: 'Netto pro Jahr',
      kvLabel: 'Krankenversicherung', pkvLabel: 'Private Krankenversicherung (dein Anteil)'
    };

    function isJahr() { return zeitraumEl.value === 'jahr'; }

    function syncBruttoRange() {
      if (isJahr()) {
        bruttoEl.min = 12000; bruttoEl.max = 180000; bruttoEl.step = 600;
        if (Number(bruttoEl.value) < 20000) bruttoEl.value = 48000;
      } else {
        bruttoEl.min = 1000; bruttoEl.max = 15000; bruttoEl.step = 50;
        if (Number(bruttoEl.value) > 16000) bruttoEl.value = 4000;
      }
    }

    function update() {
      var stkl = steuerklasseEl.value;
      faktorGroup.hidden = stkl !== '4f';

      var isPrivat = kvtypEl.value === 'privat';
      zusatzbeitragGroup.hidden = isPrivat;
      pkvGroup.hidden = !isPrivat;
      rowPvWrap.hidden = isPrivat;
      rowKvLabel.textContent = isPrivat ? STR.pkvLabel : STR.kvLabel;
      kinderlosRow.hidden = isPrivat;

      var zkf = Number(kinderfreibetragEl.value);
      if (zkf > 0 && kinderlosEl.checked) kinderlosEl.checked = false;
      kinderlosEl.disabled = zkf > 0;

      var bruttoInput = Number(bruttoEl.value);
      var bruttoMonat = isJahr() ? bruttoInput / 12 : bruttoInput;

      bruttoVal.textContent = isJahr() ? formatEURRound(bruttoInput) : formatEURRound(bruttoInput);
      kinderfreibetragVal.textContent = formatNum1(zkf);
      zusatzbeitragVal.textContent = formatPct(Number(zusatzbeitragEl.value));
      nettoLabel.textContent = isJahr() ? STR.nettoJahr : STR.nettoMonat;

      if (stkl === '5' || stkl === '6') {
        resultNormal.hidden = true;
        result56.hidden = false;
        return;
      }
      resultNormal.hidden = false;
      result56.hidden = true;

      var r = calc({
        bruttoMonat: bruttoMonat,
        steuerklasse: stkl,
        faktor: Number(faktorEl.value),
        zkf: zkf,
        bundesland: bundeslandEl.value,
        kirchensteuerpflichtig: kirchensteuerpflichtigEl.checked,
        kvTyp: kvtypEl.value,
        zusatzbeitragPct: Number(zusatzbeitragEl.value),
        pkvPraemieMonat: Number(pkvEl.value),
        kinderlos: kinderlosEl.checked
      });

      var mult = isJahr() ? 12 : 1;
      var fmt = isJahr() ? formatEURRound : formatEUR;

      resultNetto.textContent = fmt(r.nettoMonat * mult);
      resultSv.textContent = fmt(r.svMonat * mult);
      resultSteuer.textContent = fmt((r.estMonat + r.soliMonat + r.kistMonat) * mult);

      rowRv.textContent = fmt(r.rv * mult);
      rowAlv.textContent = fmt(r.alv * mult);
      rowKv.textContent = fmt(r.kv * mult);
      rowPv.textContent = fmt(r.pv * mult);
      rowEst.textContent = fmt(r.estMonat * mult);
      rowSoli.textContent = fmt(r.soliMonat * mult);
      rowKist.textContent = fmt(r.kistMonat * mult);
      rowNetto.textContent = fmt(r.nettoMonat * mult);
    }

    zeitraumEl.addEventListener('change', function () { syncBruttoRange(); update(); });
    [bruttoEl, steuerklasseEl, faktorEl, kinderfreibetragEl, bundeslandEl, kvtypEl, zusatzbeitragEl, pkvEl].forEach(function (el) {
      el.addEventListener('input', update);
      el.addEventListener('change', update);
    });
    kirchensteuerpflichtigEl.addEventListener('change', update);
    kinderlosEl.addEventListener('change', update);

    update();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
