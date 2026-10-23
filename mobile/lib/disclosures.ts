// Disclosure and disclaimer texts extracted from the website by tools/sync-data.mjs
// (German from the root pages, English from en/).
// Keys: data file name (e.g. "girokonto") or "rechner:<page>" (e.g. "rechner:kreditrechner").
import { getLang } from './i18n';

const DISCLOSURES: Record<'de' | 'en', Record<string, string>> = {
  de: require('../data/disclosures.json'),
  en: require('../data/disclosures.en.json'),
};

export function disclosure(key: string): string | null {
  return DISCLOSURES[getLang()][key] ?? null;
}
