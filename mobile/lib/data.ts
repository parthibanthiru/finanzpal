// Comparison data = the website's own data/*.json (copied in by tools/sync-data.mjs).
// One source of truth: when a rate changes on the website, run `npm run sync-data` and rebuild.
//
// Optional live mode: if EXPO_PUBLIC_DATA_LIVE=1, the app first tries
// {SITE_URL}/data/<file>.json so numbers update without a new app release, and falls back to
// the bundled copy when offline or while the site is still behind the Netlify SSO gate.
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

const BUNDLED: Record<string, DataFile> = {
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
};

const LIVE = process.env.EXPO_PUBLIC_DATA_LIVE === '1';
const cache: Record<string, DataFile> = {};

export function getBundled(file: string): DataFile {
  return BUNDLED[file] ?? { items: [] };
}

export async function loadData(file: string): Promise<DataFile> {
  if (cache[file]) return cache[file];
  if (LIVE) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch(`${SITE_URL}/data/${file}.json`, { signal: ctrl.signal });
      clearTimeout(t);
      const type = res.headers.get('content-type') ?? '';
      if (res.ok && type.includes('json')) {
        const json = (await res.json()) as DataFile;
        if (Array.isArray(json.items)) return (cache[file] = json);
      }
    } catch {
      // offline / SSO gate -> bundled copy below
    }
  }
  return (cache[file] = getBundled(file));
}

/** "2026-10" -> "Oktober 2026" */
export function formatUpdated(updated?: string) {
  if (!updated) return null;
  const [y, m] = updated.split('-').map(Number);
  if (!y || !m) return updated;
  return new Date(y, m - 1, 1).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
}
