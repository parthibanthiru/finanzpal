// ETF-Suche: same data (data/etf.json / etf.en.json), filters and sorting as the website's
// etf-suche.html (assets/etf-search.js), plus a free-text search for name, ISIN or index.
import type { Item } from './data';
import { getBundled } from './data';
import type { Lang } from './i18n';

export type Etf = Item & {
  isin: string;
  provider: string;
  providerInitials: string;
  anlageklasse: string;
  region: string;
  index: string;
  ter: number;
  replikation: string;
  replikationDetail: string;
  ausschuettung: string;
  fondsgroesse: 'klein' | 'mittel' | 'gross' | 'sehrgross';
  fondsalter: 'lt5' | '5bis10' | 'gt10';
  domizil: string;
  waehrung: string;
  auflagejahr: number;
};

export const GROESSE_ORDER = { klein: 0, mittel: 1, gross: 2, sehrgross: 3 } as const;
// Asset-class chip order on the website: Aktien · Anleihen · Geldmarkt · Rohstoffe · Immobilien
const KLASSE_ORDER_DE = ['Aktien', 'Anleihen', 'Geldmarkt', 'Rohstoffe', 'Immobilien'];

export type EtfFilters = {
  query: string;
  klasse: string | null;                    // value in the current language, null = all
  anbieter: string[];
  replikation: string[];
  ausschuettung: string[];
  maxTer: number | null;
  minGroesse: keyof typeof GROESSE_ORDER | null;
  alter: Etf['fondsalter'] | null;
  sort: 'ter' | 'name' | 'groesse';
};

export const NO_FILTERS: EtfFilters = {
  query: '', klasse: null, anbieter: [], replikation: [], ausschuettung: [],
  maxTer: null, minGroesse: null, alter: null, sort: 'ter',
};

export const etfs = (lang: Lang) => getBundled('etf', lang).items as Etf[];

/** Distinct values of a field in the current language, in a stable order. */
export function options(lang: Lang, field: 'anlageklasse' | 'provider' | 'replikation' | 'ausschuettung'): string[] {
  const items = etfs(lang);
  const values = [...new Set(items.map((e) => e[field]))];
  if (field !== 'anlageklasse') return values.sort((a, b) => a.localeCompare(b));
  // asset classes follow the website's chip order, matched through the German data by position
  const de = etfs('de');
  const rank = (v: string) => {
    const i = items.findIndex((e) => e.anlageklasse === v);
    const r = KLASSE_ORDER_DE.indexOf(de[i]?.anlageklasse);
    return r < 0 ? 99 : r;
  };
  return values.sort((a, b) => rank(a) - rank(b));
}

/** Same rules as applyFilters()/sortItems() in assets/etf-search.js, plus the text search. */
export function filterEtfs(items: Etf[], f: EtfFilters): Etf[] {
  const q = f.query.trim().toLowerCase();
  const out = items.filter((it) => {
    if (q && ![it.name, it.isin, it.index, it.provider].some((s) => s.toLowerCase().includes(q))) return false;
    if (f.klasse && it.anlageklasse !== f.klasse) return false;
    if (f.anbieter.length && !f.anbieter.includes(it.provider)) return false;
    if (f.replikation.length && !f.replikation.includes(it.replikation)) return false;
    if (f.ausschuettung.length && !f.ausschuettung.includes(it.ausschuettung)) return false;
    if (f.maxTer != null && it.ter > f.maxTer) return false;
    if (f.minGroesse && GROESSE_ORDER[it.fondsgroesse] < GROESSE_ORDER[f.minGroesse]) return false;
    if (f.alter && it.fondsalter !== f.alter) return false;
    return true;
  });
  if (f.sort === 'ter') out.sort((a, b) => a.ter - b.ter);
  else if (f.sort === 'name') out.sort((a, b) => a.name.localeCompare(b.name));
  else out.sort((a, b) => GROESSE_ORDER[b.fondsgroesse] - GROESSE_ORDER[a.fondsgroesse]);
  return out;
}

/** Number of filters set (for the "Weitere Filter (2)" label); text search and sort excluded. */
export function activeFilterCount(f: EtfFilters) {
  return (
    (f.klasse ? 1 : 0) + f.anbieter.length + f.replikation.length + f.ausschuettung.length +
    (f.maxTer != null ? 1 : 0) + (f.minGroesse ? 1 : 0) + (f.alter ? 1 : 0)
  );
}
