// Disclosure and disclaimer texts extracted from the website by tools/sync-data.mjs.
// Keys: data file name (e.g. "girokonto") or "rechner:<page>" (e.g. "rechner:kreditrechner").
const DISCLOSURES: Record<string, string> = require('../data/disclosures.json');

export function disclosure(key: string): string | null {
  return DISCLOSURES[key] ?? null;
}
