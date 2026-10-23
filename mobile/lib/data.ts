// Comparison data = the website's own data/*.json and data/*.en.json (copied in by
// tools/sync-data.mjs); the current app language picks the file.
// One source of truth: when a rate changes on the website, run `npm run sync-data` and rebuild.
//
// Optional live mode: if EXPO_PUBLIC_DATA_LIVE=1, the app first tries
// {SITE_URL}/data/<file>.json (or <file>.en.json) so numbers update without a new app release, and falls back to
// the bundled copy when offline or while the site is still behind the Netlify SSO gate.
import { getLang, locale, type Lang } from './i18n';
import { SITE_URL } from './site';

export type Score = { value: number; band: 'A' | 'B' | 'C' | 'D'; breakdown?: Record<string, number>; computedFrom?: string };
export type Item = Record<string, any> & {
  id: string;
  name: string;
  initials?: string;
  color?: string;
  recommended?: boolean;
  affiliateUrl?: string;
  rating?: number | null;
  ratingStars?: string | null;
  score?: Score;
};
export type DataFile = { updated?: string; profileNote?: string; items: Item[] };

const BUNDLED: Record<Lang, Record<string, DataFile>> = {
  de: {
    autoversicherung: require('../data/autoversicherung.json'),
    baufinanzierung: require('../data/baufinanzierung.json'),
    broker: require('../data/broker.json'),
    bu: require('../data/bu.json'),
    etf: require('../data/etf.json'),
    girokonto: require('../data/girokonto.json'),
    hausrat: require('../data/hausrat.json'),
    kinderdepot: require('../data/kinderdepot.json'),
    kredite: require('../data/kredite.json'),
    kreditkarte: require('../data/kreditkarte.json'),
    rechtsschutz: require('../data/rechtsschutz.json'),
    steuerprogramm: require('../data/steuerprogramm.json'),
    tagesgeld: require('../data/tagesgeld.json'),
    versicherungen: require('../data/versicherungen.json'),
  },
  en: {
    autoversicherung: require('../data/autoversicherung.en.json'),
    baufinanzierung: require('../data/baufinanzierung.en.json'),
    broker: require('../data/broker.en.json'),
    bu: require('../data/bu.en.json'),
    etf: require('../data/etf.en.json'),
    girokonto: require('../data/girokonto.en.json'),
    hausrat: require('../data/hausrat.en.json'),
    kinderdepot: require('../data/kinderdepot.en.json'),
    kredite: require('../data/kredite.en.json'),
    kreditkarte: require('../data/kreditkarte.en.json'),
    rechtsschutz: require('../data/rechtsschutz.en.json'),
    steuerprogramm: require('../data/steuerprogramm.en.json'),
    tagesgeld: require('../data/tagesgeld.en.json'),
    versicherungen: require('../data/versicherungen.en.json'),
  },
};

const LIVE = process.env.EXPO_PUBLIC_DATA_LIVE === '1';
const cache: Record<string, DataFile> = {};

export function getBundled(file: string, lang: Lang = getLang()): DataFile {
  return BUNDLED[lang][file] ?? { items: [] };
}

export async function loadData(file: string, lang: Lang = getLang()): Promise<DataFile> {
  const key = `${lang}:${file}`;
  if (cache[key]) return cache[key];
  if (LIVE) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch(`${SITE_URL}/data/${file}${lang === 'en' ? '.en' : ''}.json`, { signal: ctrl.signal });
      clearTimeout(t);
      const type = res.headers.get('content-type') ?? '';
      if (res.ok && type.includes('json')) {
        const json = (await res.json()) as DataFile;
        if (Array.isArray(json.items)) return (cache[key] = json);
      }
    } catch {
      // offline / SSO gate -> bundled copy below
    }
  }
  return (cache[key] = getBundled(file, lang));
}

/** "2026-10" -> "Oktober 2026" / "October 2026" */
export function formatUpdated(updated?: string) {
  if (!updated) return null;
  const [y, m] = updated.split('-').map(Number);
  if (!y || !m) return updated;
  return new Date(y, m - 1, 1).toLocaleDateString(locale(), { month: 'long', year: 'numeric' });
}
