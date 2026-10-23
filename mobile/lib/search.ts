// Search across everything the app compares: providers in all comparisons, ETFs, and the
// comparisons / calculators / guides themselves — in the current language.
import { CATEGORIES } from './categories';
import { getBundled } from './data';
import { formatPct } from './format';
import type { Lang, Strings } from './i18n';
import type { Etf } from './etf';

export type Hit =
  | { kind: 'provider'; key: string; title: string; sub: string; categoryId: string; itemId: string; color?: string; initials?: string }
  | { kind: 'etf'; key: string; title: string; sub: string; isin: string; color?: string; initials?: string }
  | { kind: 'page'; key: string; title: string; sub: string; route?: string; sitePage?: string; icon: string };

/** Lowercase, umlauts/accents folded ("Kontoführung" ≈ "kontofuhrung" ≈ "kontofuehrung"). */
export function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9%.,+&]+/g, ' ')
    .trim();
}
// "fuhrung" should still find "fuehrung": also compare with the plain-vowel spelling
const loose = (s: string) => s.replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u');

type Entry = { hit: Hit; title: string; text: string };

const RATGEBER: Record<Lang, { articles: { page: string; title: string; teaser: string; catLabel: string }[] }> =
  require('../data/ratgeber.json');

const CALC_ROUTES: Record<string, string> = {
  sparplan: '/rechner/sparplan', zinseszins: '/rechner/zinseszins', kredit: '/rechner/kredit',
  baufinanzierung: '/rechner/baufinanzierung', nettolohn: '/rechner/nettolohn',
  altersvorsorge: '/rechner/altersvorsorge', haushaltsbuch: '/rechner/haushaltsbuch',
};

const indexCache: Partial<Record<Lang, Entry[]>> = {};

function buildIndex(lang: Lang, t: Strings): Entry[] {
  const out: Entry[] = [];
  const add = (hit: Hit, ...fields: (string | undefined)[]) => {
    const text = normalize(fields.filter(Boolean).join(' '));
    out.push({ hit, title: normalize(hit.title), text: `${text} ${loose(text)}` });
  };
  for (const c of CATEGORIES) {
    const cat = t.categories[c.id];
    for (const it of getBundled(c.file, lang).items) {
      add(
        { kind: 'provider', key: `${c.id}:${it.id}`, title: it.name, sub: cat.title, categoryId: c.id, itemId: it.id, color: it.color, initials: it.initials },
        it.name, it.anbieter, it.initials, it.id.replace(/-/g, ' '), cat.title
      );
    }
    add({ kind: 'page', key: `cat:${c.id}`, title: cat.title, sub: cat.subtitle, route: `/vergleiche/${c.id}`, icon: c.icon }, cat.title, cat.subtitle, c.id);
  }
  for (const e of getBundled('etf', lang).items as Etf[]) {
    add(
      { kind: 'etf', key: `etf:${e.id}`, title: e.name, sub: `${e.isin} · TER ${formatPct(e.ter)}`, isin: e.isin, color: e.color, initials: e.providerInitials },
      e.name, e.isin, e.index, e.provider, e.anlageklasse, e.region
    );
  }
  add({ kind: 'page', key: 'etf', title: t.etf.title, sub: t.etf.homeSub(getBundled('etf', lang).items.length), route: '/vergleiche/etf', icon: '🔎' }, t.etf.title, 'etf');
  add({ kind: 'page', key: 'check', title: t.check.title, sub: t.home.fcTitle, route: '/vergleiche/finanz-check', icon: '✅' }, t.check.title, t.home.fcTitle);
  for (const [k, v] of Object.entries(t.calc.list)) {
    add({ kind: 'page', key: `calc:${k}`, title: v.title, sub: v.sub, route: CALC_ROUTES[k], icon: '🧮' }, v.title, v.sub);
  }
  for (const a of RATGEBER[lang].articles) {
    add({ kind: 'page', key: `guide:${a.page}`, title: a.title, sub: `${t.tabs.guides} · ${a.catLabel}`, sitePage: a.page, icon: '📚' }, a.title, a.teaser, a.catLabel);
  }
  return out;
}

/**
 * All words of the query must appear (in any field). Ranking: title starts with the query,
 * then a title word starts with it, then any match; providers before ETFs before pages.
 */
export function search(query: string, lang: Lang, t: Strings, limit = 40): Hit[] {
  const q = normalize(query);
  if (q.length < 2) return [];
  const words = q.split(' ').filter(Boolean);
  const index = (indexCache[lang] ??= buildIndex(lang, t));
  const kindRank = { provider: 0, etf: 1, page: 2 };
  return index
    .filter((e) => words.every((w) => e.text.includes(w) || e.text.includes(loose(w))))
    .map((e) => {
      const rank = e.title.startsWith(q) ? 0 : (' ' + e.title).includes(' ' + words[0]) ? 1 : 2;
      return { e, score: rank * 10 + kindRank[e.hit.kind] };
    })
    .sort((a, b) => a.score - b.score || a.e.hit.title.localeCompare(b.e.hit.title))
    .slice(0, limit)
    .map((x) => x.e.hit);
}
