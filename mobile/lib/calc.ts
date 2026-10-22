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
