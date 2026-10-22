const eur0 = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const eur2 = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatEUR = (n: number) => eur0.format(n);
export const formatEURCents = (n: number) => eur2.format(n);

/** 9.66 -> "9,66 %" */
export function formatPct(n: number, digits = 2) {
  return `${n.toFixed(digits).replace('.', ',')} %`;
}

/** Parses German-formatted input like "1.000,50" or "250" -> number (NaN if empty). */
export function parseDE(input: string): number {
  const cleaned = input.replace(/\s|€|%/g, '').replace(/\./g, '').replace(',', '.');
  return cleaned === '' ? NaN : Number(cleaned);
}
