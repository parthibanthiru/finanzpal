// Same math as the website (assets/sparplanrechner.js, assets/kreditrechner.js),
// so app and website always show identical results.

export type SavingsPoint = { year: number; balance: number; contributed: number; interest: number };

/** Monthly compounding, contribution at month end — identical to calcSeries() on the website. */
export function calcSavings(initial: number, monthly: number, years: number, annualRatePct: number): SavingsPoint[] {
  const r = annualRatePct / 100 / 12;
  let balance = initial;
  let contributed = initial;
  const series: SavingsPoint[] = [];
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + r) + monthly;
      contributed += monthly;
    }
    series.push({ year: y, balance, contributed, interest: balance - contributed });
  }
  return series;
}

export type LoanResult = {
  payment: number;
  totalInterest: number;
  totalCost: number;
  series: { year: number; balance: number; cumInterest: number }[];
};

/** Standard annuity loan — identical to calcLoan() on the website. */
export function calcLoan(amount: number, annualRatePct: number, termMonths: number): LoanResult {
  const r = annualRatePct / 100 / 12;
  const payment = r === 0 ? amount / termMonths : (amount * r) / (1 - Math.pow(1 + r, -termMonths));
  let balance = amount;
  let totalInterest = 0;
  const series: LoanResult['series'] = [];
  for (let m = 1; m <= termMonths; m++) {
    const interestPortion = balance * r;
    const principalPortion = payment - interestPortion;
    balance = Math.max(0, balance - principalPortion);
    totalInterest += interestPortion;
    if (m % 12 === 0 || m === termMonths) series.push({ year: Math.ceil(m / 12), balance, cumInterest: totalInterest });
  }
  return { payment, totalInterest, totalCost: amount + totalInterest, series };
}

// ── Baufinanzierungsrechner (assets/baufinanzierungsrechner.js) ─────────────

export type BaufiResult = {
  monthlyRate: number;
  restschuld: number;
  totalInterest: number;
  series: { year: number; balance: number; interestPaid: number; principalPaid: number }[];
};

/** Annuity mortgage over the fixed-rate period — identical to calcSeries() on the website. */
export function calcBaufi(darlehen: number, zinsPct: number, tilgungPct: number, zinsbindungJahre: number): BaufiResult {
  const monthlyRate = (darlehen * (zinsPct + tilgungPct)) / 100 / 12;
  const r = zinsPct / 100 / 12;
  let balance = darlehen;
  const series: BaufiResult['series'] = [];
  let yearInterest = 0;
  let yearPrincipal = 0;
  for (let m = 1; m <= zinsbindungJahre * 12; m++) {
    const interestPart = balance * r;
    const principalPart = Math.min(monthlyRate - interestPart, balance);
    balance = Math.max(0, balance - principalPart);
    yearInterest += interestPart;
    yearPrincipal += principalPart;
    if (m % 12 === 0) {
      series.push({ year: m / 12, balance, interestPaid: yearInterest, principalPaid: yearPrincipal });
      yearInterest = 0;
      yearPrincipal = 0;
    }
    if (balance <= 0) break;
  }
  const totalInterest = series.reduce((s, p) => s + p.interestPaid, 0);
  return { monthlyRate, restschuld: balance, totalInterest, series };
}

/** Years until fully repaid at a constant rate; null if the rate doesn't cover the interest. */
export function estimateFullPayoffYears(darlehen: number, zinsPct: number, tilgungPct: number): number | null {
  const monthlyRate = (darlehen * (zinsPct + tilgungPct)) / 100 / 12;
  const r = zinsPct / 100 / 12;
  if (r <= 0) return darlehen / monthlyRate / 12;
  if (monthlyRate <= darlehen * r) return null;
  const months = -Math.log(1 - (darlehen * r) / monthlyRate) / Math.log(1 + r);
  return months / 12;
}

// ── Brutto-Netto-Rechner (assets/nettolohnrechner.js), Steuerklassen I–IV
// (inkl. Faktorverfahren), 2026. Steuerklasse V/VI bewusst nicht berechnet —
// siehe die Begründung im Website-Rechner (das offizielle §39b-Verfahren für
// V/VI ließ sich nicht mit ausreichender Sicherheit rekonstruieren). ──

const RV_SATZ = 0.093;
const ALV_SATZ = 0.013;
const KV_GRUNDSATZ = 0.073;
const PV_SATZ = 0.018;
const PV_SATZ_SACHSEN = 0.023;
const PV_ZUSCHLAG_KINDERLOS = 0.006;
const BBG_RV_ALV_MONAT = 8450;
const BBG_KV_PV_MONAT = 5812.5;
const DURCHSCHNITTL_ZUSATZBEITRAG = 2.9;
const GRUNDFREIBETRAG = 12348;
const WERBUNGSKOSTENPAUSCHALE = 1230;
const SONDERAUSGABENPAUSCHALE = 36;
const EFA_ALLEINERZIEHEND = 4260;
const EFA_ALLEINERZIEHEND_WEITERES_KIND = 240;
const KINDERFREIBETRAG_PRO_KIND = 9756;
const SOLI_FREIGRENZE = 20350;

export type Steuerklasse = '1' | '2' | '3' | '4' | '4f' | '5' | '6';
export type KvTyp = 'gesetzlich' | 'privat';

export const BUNDESLAENDER: Record<string, { kist: number; pvSachsen?: boolean }> = {
  bw: { kist: 8 }, by: { kist: 8 }, be: { kist: 9 }, bb: { kist: 9 },
  hb: { kist: 9 }, hh: { kist: 9 }, he: { kist: 9 }, mv: { kist: 9 },
  ni: { kist: 9 }, nw: { kist: 9 }, rp: { kist: 9 }, sl: { kist: 9 },
  sn: { kist: 9, pvSachsen: true }, st: { kist: 9 }, sh: { kist: 9 }, th: { kist: 9 },
};

/** §32a EStG Grundtarif 2026 — identical to estTariff() on the website. kztab=2 doubles (Splitting, Steuerklasse III). */
export function estTariff(zvE: number, kztab: number = 1): number {
  const x = Math.max(0, zvE) / kztab;
  let st: number;
  if (x <= GRUNDFREIBETRAG) {
    st = 0;
  } else if (x <= 17799) {
    const y = (x - GRUNDFREIBETRAG) / 10000;
    st = (914.51 * y + 1400) * y;
  } else if (x <= 69878) {
    const z = (x - 17799) / 10000;
    st = (173.1 * z + 2397) * z + 1034.87;
  } else if (x <= 277825) {
    st = 0.42 * x - 11135.63;
  } else {
    st = 0.45 * x - 19470.38;
  }
  return Math.floor(st * kztab);
}

function soliTarif(bemessung: number, kztab: number = 1): number {
  const freigrenze = SOLI_FREIGRENZE * kztab;
  if (bemessung <= freigrenze) return 0;
  return Math.min(bemessung * 0.055, (bemessung - freigrenze) * 0.119);
}

export type NettoResult = {
  bruttoMonat: number;
  rv: number; alv: number; kv: number; pv: number; svMonat: number;
  agZuschussPkv: number;
  estMonat: number; soliMonat: number; kistMonat: number;
  nettoMonat: number;
  zvEJahr: number;
};

export type NettoParams = {
  bruttoMonat: number;
  steuerklasse: Steuerklasse;
  faktor: number;
  zkf: number; // Kinderfreibeträge, 0.5er-Schritte
  bundesland: string;
  kirchensteuerpflichtig: boolean;
  kvTyp: KvTyp;
  zusatzbeitragPct: number;
  pkvPraemieMonat: number;
  kinderlos: boolean;
};

/** Identical to calc() in assets/nettolohnrechner.js. Returns null for Steuerklasse V/VI (not computed). */
export function calcNetto(p: NettoParams): NettoResult | null {
  if (p.steuerklasse === '5' || p.steuerklasse === '6') return null;

  const bl = BUNDESLAENDER[p.bundesland] ?? BUNDESLAENDER.be;
  const kirchensteuerSatz = p.kirchensteuerpflichtig ? bl.kist : 0;

  const bruttoMonat = p.bruttoMonat;
  const bruttoJahr = bruttoMonat * 12;

  const svBasisRvAlv = Math.min(bruttoMonat, BBG_RV_ALV_MONAT);
  const svBasisKvPv = Math.min(bruttoMonat, BBG_KV_PV_MONAT);

  const rv = svBasisRvAlv * RV_SATZ;
  const alv = svBasisRvAlv * ALV_SATZ;

  let kv: number, pv: number, agZuschussPkv = 0;
  if (p.kvTyp === 'privat') {
    const praemie = Math.max(0, p.pkvPraemieMonat || 0);
    const hoechstzuschuss = 0.5 * (0.146 + DURCHSCHNITTL_ZUSATZBEITRAG / 100 + 0.036) * BBG_KV_PV_MONAT;
    agZuschussPkv = Math.min(0.5 * praemie, hoechstzuschuss);
    kv = Math.max(0, praemie - agZuschussPkv);
    pv = 0;
  } else {
    kv = svBasisKvPv * (KV_GRUNDSATZ + p.zusatzbeitragPct / 100 / 2);
    const pvSatz = (bl.pvSachsen ? PV_SATZ_SACHSEN : PV_SATZ) + (p.kinderlos ? PV_ZUSCHLAG_KINDERLOS : 0);
    pv = svBasisKvPv * pvSatz;
  }

  const svMonat = rv + alv + kv + pv;
  const svJahr = svMonat * 12;

  const stkl = p.steuerklasse;
  const kztab = stkl === '3' ? 2 : 1;
  let efa = 0;
  if (stkl === '2') {
    const anzahlKinder = Math.max(1, Math.round(p.zkf || 0));
    efa = EFA_ALLEINERZIEHEND + (anzahlKinder - 1) * EFA_ALLEINERZIEHEND_WEITERES_KIND;
  }
  const ztabfb = WERBUNGSKOSTENPAUSCHALE + SONDERAUSGABENPAUSCHALE + efa;

  const zvELst = Math.max(0, bruttoJahr - svJahr - ztabfb);

  const estJahrUnfaktoriert = estTariff(zvELst, kztab);
  const estJahr = stkl === '4f' ? Math.floor(estJahrUnfaktoriert * (p.faktor || 1)) : estJahrUnfaktoriert;

  // Kinderfreibeträge mindern im echten Lohnsteuerabzug nur Soli/Kirchensteuer,
  // nicht die Lohnsteuer selbst. Beim Faktorverfahren dient die bereits
  // faktorisierte Lohnsteuer direkt als Bemessungsgrundlage.
  const kfbJahr = (p.zkf || 0) * KINDERFREIBETRAG_PRO_KIND;
  let jbmg: number;
  if (stkl === '4f') {
    jbmg = estJahr;
  } else {
    const zvESoli = Math.max(0, zvELst - kfbJahr);
    jbmg = estTariff(zvESoli, kztab);
  }

  const soliJahr = soliTarif(jbmg, kztab);
  const kistJahr = jbmg * (kirchensteuerSatz / 100);

  const estMonat = estJahr / 12;
  const soliMonat = soliJahr / 12;
  const kistMonat = kistJahr / 12;

  return {
    bruttoMonat, rv, alv, kv, pv, svMonat, agZuschussPkv, estMonat, soliMonat, kistMonat,
    nettoMonat: bruttoMonat - svMonat - estMonat - soliMonat - kistMonat,
    zvEJahr: zvELst,
  };
}

// ── Altersvorsorge-Rechner (assets/altersvorsorge-rechner.js) ───────────────

/** Level monthly withdrawal that empties the balance over payoutYears — identical to the website. */
export function calcMonthlyPayout(startBalance: number, payoutRatePct: number, payoutYears: number): number {
  const rp = payoutRatePct / 100 / 12;
  const months = payoutYears * 12;
  if (months <= 0) return 0;
  if (Math.abs(rp) < 1e-9) return startBalance / months;
  return (startBalance * rp) / (1 - Math.pow(1 + rp, -months));
}

export function calcPayoutSeries(startBalance: number, payoutRatePct: number, payoutYears: number, startAge: number, monthlyPayout: number) {
  const rp = payoutRatePct / 100 / 12;
  let balance = startBalance;
  const series: { age: number; balance: number }[] = [];
  for (let y = 1; y <= payoutYears; y++) {
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + rp) - monthlyPayout;
      if (balance < 0) balance = 0;
    }
    series.push({ age: startAge + y, balance });
  }
  return series;
}
