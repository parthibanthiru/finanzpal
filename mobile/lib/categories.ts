// The app's comparison categories = the website's comparison pages (same grouping as the
// site nav: Konten / Broker / Kredite / Versicherungen / Steuerprogramm).
// Each category says which fields of its data item to show. Labels come from the strings
// (lib/strings/*.ts, website wording); values come from data/<file>.json or <file>.en.json,
// so they are already in the current language.
import type { Item } from './data';
import { formatEUR, formatNumber, formatPct } from './format';
import { strings, type Strings } from './i18n';

export type Field = { label: string; value: string; note?: string };

export type CategoryId = keyof Strings['categories'];
export type Group = keyof Strings['groups'];

export type Category = {
  id: CategoryId;      // route id + key in strings.categories
  file: string;        // data/<file>.json + key in disclosures.json
  group: Group;
  icon: string;
  page: string;        // website page for "Auf finanzpal.de ansehen" (en/ prefix added for English)
  fields: (item: Item, t: Strings) => Field[];
};

const txt = (v: unknown) => (v == null || v === '' ? null : String(v).replace(/<br\s*\/?>/gi, '\n'));
const yesNo = (t: Strings, b?: boolean | null) => (b == null ? '–' : b ? t.common.yes : t.common.no);

/** Builds a field list, dropping rows whose value is null/empty. */
function rows(...list: (Field | [string, string | null | undefined, string?] | null | false)[]): Field[] {
  const out: Field[] = [];
  for (const r of list) {
    if (!r) continue;
    if (Array.isArray(r)) {
      const [label, value, note] = r;
      if (value != null && value !== '') out.push({ label, value, note: note || undefined });
    } else out.push(r);
  }
  return out;
}

const insurance =
  (beitrag: keyof Strings['fields'], deckung: keyof Strings['fields']) =>
  (i: Item, t: Strings) =>
    rows(
      [t.fields[beitrag] as string, txt(i.beitrag)],
      [t.fields[deckung] as string, txt(i.deckung)],
      [t.fields.leistungen, txt(i.leistungen)]
    );

export const CATEGORIES: Category[] = [
  // ── Konten
  {
    id: 'girokonto', file: 'girokonto', group: 'Konten', icon: '🏦', page: 'girokonto.html',
    fields: (i, t) =>
      rows(
        [t.fields.kontofuehrung, txt(i.kontofuehrung), i.bedingungslos ? undefined : txt(i.bedingung) ?? undefined],
        [t.fields.karte, txt(i.karteText)],
        [t.fields.dispozins, i.dispozins != null ? formatPct(i.dispozins) : null],
        [t.fields.abhebung, txt(i.abhebung)],
        [t.fields.fremdwaehrung, txt(i.fremdwaehrung)],
        [t.fields.guthabenzins, i.guthabenzins != null ? formatPct(i.guthabenzins) : null],
        [t.fields.einlagensicherung, txt(i.einlagensicherung)]
      ),
  },
  {
    id: 'tagesgeld', file: 'tagesgeld', group: 'Konten', icon: '💶', page: 'tagesgeld.html',
    fields: (i, t) =>
      rows(
        [t.fields.zins, txt(i.rate)],
        [t.fields.zinsgarantie, txt(i.guarantee)],
        [t.fields.mindesteinlage, txt(i.minDeposit)],
        [t.fields.einlagensicherung, txt(i.protection)]
      ),
  },
  {
    id: 'kreditkarte', file: 'kreditkarte', group: 'Konten', icon: '💳', page: 'kreditkarte.html',
    fields: (i, t) =>
      rows(
        [t.fields.jahresgebuehr, txt(i.jahresgebuehr), i.ohneBedingungen ? undefined : txt(i.bedingung) ?? undefined],
        [t.fields.kartentyp, [txt(i.kartentyp), txt(i.netzwerk)].filter(Boolean).join(' · ') || null],
        [t.fields.fremdwaehrung, txt(i.fremdwaehrung)],
        [t.fields.abhebung, txt(i.abhebung)],
        [t.fields.zinsfreieTage, txt(i.zinsfreieText)],
        [t.fields.mobilePay, `${yesNo(t, i.applePay)} / ${yesNo(t, i.googlePay)}`]
      ),
  },
  // ── Broker
  {
    id: 'broker', file: 'broker', group: 'Broker', icon: '📈', page: 'broker.html',
    fields: (i, t) =>
      rows(
        [t.fields.depotgebuehr, txt(i.depotgebuehrText ?? i.brokerDepotfee)],
        [t.fields.ordergebuehr, txt(i.orderfee)],
        [
          t.fields.etfSparplaene,
          i.etfSparplaeneAnzahl != null
            ? i.etfSparplaeneKostenlos
              ? t.fields.etfFree(formatNumber(i.etfSparplaeneAnzahl))
              : formatNumber(i.etfSparplaeneAnzahl)
            : null,
          txt(i.etfSparplaeneCaveat) ?? undefined,
        ],
        [t.fields.sparplan, txt(i.sparplanAb)],
        [t.fields.guthabenzins, i.guthabenzins != null ? formatPct(i.guthabenzins) : null, txt(i.guthabenzinsCaveat) ?? undefined],
        [t.fields.verwahrentgelt, txt(i.verwahrentgeltText)]
      ),
  },
  {
    id: 'kinderdepot', file: 'kinderdepot', group: 'Broker', icon: '🧒', page: 'kinderdepot.html',
    fields: (i, t) =>
      rows(
        [t.fields.depotgebuehr, txt(i.depotgebuehrText)],
        [t.fields.mindestsparrate, i.mindestsparrate != null ? formatEUR(i.mindestsparrate) : null],
        [t.fields.etfSparplaene, i.etfSparplaeneAnzahl != null ? formatNumber(i.etfSparplaeneAnzahl) : null, txt(i.etfSparplaeneCaveat) ?? undefined],
        [t.fields.guthabenzins, i.guthabenzins != null ? formatPct(i.guthabenzins) : null, txt(i.guthabenzinsCaveat) ?? undefined],
        [t.fields.elterndepot, yesNo(t, i.parentDepotRequired)],
        [t.fields.alter, txt(i.ageLimitText)],
        [t.fields.besonderheiten, txt(i.besonderheitenText)]
      ),
  },
  // ── Kredite
  {
    id: 'kredite', file: 'kredite', group: 'Kredite', icon: '💰', page: 'kredite.html',
    fields: (i, t) =>
      rows(
        [t.fields.effJahreszins, txt(i.rate)],
        [t.fields.kreditbetrag, txt(i.amount)],
        [t.fields.laufzeit, txt(i.term)],
        [t.fields.sondertilgung, txt(i.sondertilgung)]
      ),
  },
  {
    id: 'baufinanzierung', file: 'baufinanzierung', group: 'Kredite', icon: '🏠', page: 'baufinanzierung.html',
    fields: (i, t) =>
      rows(
        [t.fields.partnerbanken, txt(i.partnerbankenText)],
        [t.fields.standorte, txt(i.standorteText)],
        [t.fields.beratung, txt(i.beratungText)],
        [t.fields.besonderheiten, txt(i.besonderheitenText)]
      ),
  },
  // ── Versicherungen (same 5 tabs as versicherungen.html)
  {
    id: 'haftpflicht', file: 'versicherungen', group: 'Versicherungen', icon: '🛡️', page: 'versicherungen.html',
    fields: insurance('phvBeitrag', 'phvDeckung'),
  },
  {
    id: 'hausrat', file: 'hausrat', group: 'Versicherungen', icon: '🛋️', page: 'versicherungen.html#hausrat',
    fields: insurance('hausratBeitrag', 'hausratDeckung'),
  },
  {
    id: 'bu', file: 'bu', group: 'Versicherungen', icon: '🩺', page: 'versicherungen.html#berufsunfaehigkeit',
    fields: insurance('buBeitrag', 'buDeckung'),
  },
  {
    id: 'rechtsschutz', file: 'rechtsschutz', group: 'Versicherungen', icon: '⚖️', page: 'versicherungen.html#rechtsschutz',
    fields: insurance('rsBeitrag', 'rsDeckung'),
  },
  {
    id: 'kfz', file: 'autoversicherung', group: 'Versicherungen', icon: '🚗', page: 'versicherungen.html#kfz',
    fields: insurance('kfzBeitrag', 'kfzDeckung'),
  },
  // ── Steuern
  {
    id: 'steuerprogramm', file: 'steuerprogramm', group: 'Steuern', icon: '🧾', page: 'steuerprogramm.html',
    fields: (i, t) => {
      const plattform = i.plattform
        ? Object.entries(i.plattform as Record<string, boolean>)
            .filter(([, v]) => v)
            .map(([k]) => t.fields.platformNames[k] ?? k)
            .join(', ')
        : null;
      const zielgruppen = i.zielgruppen
        ? Object.entries(i.zielgruppen as Record<string, boolean>)
            .filter(([, v]) => v)
            .map(([k]) => t.fields.zielgruppen[k] ?? k)
            .join(', ')
        : null;
      return rows(
        [t.fields.preis, txt(i.preis)],
        [t.fields.plattform, plattform],
        [t.fields.geeignetFuer, zielgruppen],
        [t.fields.vorjahresImport, yesNo(t, i.vorjahresImport)],
        [t.fields.elster, txt(i.elsterZertifikat)]
      );
    },
  },
];

export const GROUPS: Group[] = ['Konten', 'Broker', 'Kredite', 'Versicherungen', 'Steuern'];

export function getCategory(id: string) {
  return CATEGORIES.find((c) => c.id === id);
}

/** Title / subtitle / note of a category in the given (default: current) language. */
export function categoryText(id: CategoryId, t: Strings = strings()) {
  return t.categories[id];
}
