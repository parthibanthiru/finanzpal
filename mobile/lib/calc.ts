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

// ── Brutto-Netto-Rechner (assets/nettolohnrechner.js), Steuerklasse I, 2026 ──

const RV_SATZ = 0.093;
const ALV_SATZ = 0.013;
const KV_GRUNDSATZ = 0.073;
const PV_SATZ = 0.018;
const PV_ZUSCHLAG_KINDERLOS = 0.006;
const BBG_RV_ALV_MONAT = 8450;
const BBG_KV_PV_MONAT = 5812.5;
const GRUNDFREIBETRAG = 12348;
const WERBUNGSKOSTENPAUSCHALE = 1230;
const SONDERAUSGABENPAUSCHALE = 36;
const SOLI_FREIGRENZE = 20350;

/** §32a EStG Grundtabelle 2026 — identical to estTariff() on the website. */
export function estTariff(zvE: number): number {
  const x = Math.floor(Math.max(0, zvE));
  if (x <= GRUNDFREIBETRAG) return 0;
  if (x <= 17799) {
    const y = (x - GRUNDFREIBETRAG) / 10000;
    return (914.51 * y + 1400) * y;
  }
  if (x <= 69878) {
    const z = (x - 17799) / 10000;
    return (173.1 * z + 2397) * z + 1034.87;
  }
  if (x <= 277825) return 0.42 * x - 11135.63;
  return 0.45 * x - 19470.38;
}

function soliTarif(est: number): number {
  if (est <= SOLI_FREIGRENZE) return 0;
  return Math.min(est * 0.055, (est - SOLI_FREIGRENZE) * 0.119);
}

export type NettoResult = {
  bruttoMonat: number;
  rv: number; alv: number; kv: number; pv: number; svMonat: number;
  estMonat: number; soliMonat: number; kistMonat: number;
  nettoMonat: number;
  zvEJahr: number;
};

/** Identical to calc() in assets/nettolohnrechner.js. */
export function calcNetto(bruttoMonat: number, zusatzbeitragPct: number, kinderlos: boolean, kirchensteuerSatz: number): NettoResult {
  const bruttoJahr = bruttoMonat * 12;
  const svBasisRvAlv = Math.min(bruttoMonat, BBG_RV_ALV_MONAT);
  const svBasisKvPv = Math.min(bruttoMonat, BBG_KV_PV_MONAT);
  const rv = svBasisRvAlv * RV_SATZ;
  const alv = svBasisRvAlv * ALV_SATZ;
  const kv = svBasisKvPv * (KV_GRUNDSATZ + zusatzbeitragPct / 100 / 2);
  const pv = svBasisKvPv * (PV_SATZ + (kinderlos ? PV_ZUSCHLAG_KINDERLOS : 0));
  const svMonat = rv + alv + kv + pv;
  let zvE = bruttoJahr - svMonat * 12 - WERBUNGSKOSTENPAUSCHALE - SONDERAUSGABENPAUSCHALE;
  if (zvE < 0) zvE = 0;
  const estJahr = estTariff(zvE);
  const soliJahr = soliTarif(estJahr);
  const kistJahr = estJahr * (kirchensteuerSatz / 100);
  const estMonat = estJahr / 12;
  const soliMonat = soliJahr / 12;
  const kistMonat = kistJahr / 12;
  return {
    bruttoMonat, rv, alv, kv, pv, svMonat, estMonat, soliMonat, kistMonat,
    nettoMonat: bruttoMonat - svMonat - estMonat - soliMonat - kistMonat,
    zvEJahr: zvE,
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
