// The app's comparison categories = the website's comparison pages (same grouping as the
// site nav: Konten / Broker / Kredite / Versicherungen / Steuerprogramm).
// Each category says which fields of its data/*.json item to show, in website wording.
import type { Item } from './data';
import { formatPct } from './format';

export type Field = { label: string; value: string; note?: string };

export type Category = {
  id: string;          // route id
  file: string;        // data/<file>.json + key in disclosures.json
  title: string;
  subtitle: string;
  group: 'Konten' | 'Broker' | 'Kredite' | 'Versicherungen' | 'Steuern';
  icon: string;
  page: string;        // website page for "Auf finanzpal.de ansehen"
  fields: (item: Item) => Field[];
  topNote?: string;    // shown above the list (e.g. "no single price")
};

const yesNo = (b?: boolean | null) => (b == null ? '–' : b ? 'Ja' : 'Nein');
const txt = (v: unknown) => (v == null || v === '' ? null : String(v).replace(/<br\s*\/?>/gi, '\n'));
const num = (n?: number | null) => (n == null ? null : n.toLocaleString('de-DE'));

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

const insurance = (beitragLabel: string, deckungLabel: string) => (i: Item) =>
  rows([beitragLabel, txt(i.beitrag)], [deckungLabel, txt(i.deckung)], ['Leistungen', txt(i.leistungen)]);

export const CATEGORIES: Category[] = [
  // ── Konten
  {
    id: 'girokonto', file: 'girokonto', group: 'Konten', icon: '🏦', page: 'girokonto.html',
    title: 'Girokonto', subtitle: 'Kontoführung, Dispo, Karte',
    fields: (i) =>
      rows(
        ['Kontoführung', txt(i.kontofuehrung), i.bedingungslos ? undefined : txt(i.bedingung) ?? undefined],
        ['Karte', txt(i.karteText)],
        ['Dispozins', i.dispozins != null ? formatPct(i.dispozins) : null],
        ['Bargeld abheben', txt(i.abhebung)],
        ['Fremdwährung', txt(i.fremdwaehrung)],
        ['Guthabenzins', i.guthabenzins != null ? formatPct(i.guthabenzins) : null],
        ['Einlagensicherung', txt(i.einlagensicherung)]
      ),
  },
  {
    id: 'tagesgeld', file: 'tagesgeld', group: 'Konten', icon: '💶', page: 'tagesgeld.html',
    title: 'Tagesgeld', subtitle: 'Zins, Zinsgarantie, Einlagensicherung',
    fields: (i) =>
      rows(['Zins p. a.', txt(i.rate)], ['Zinsgarantie', txt(i.guarantee)], ['Mindesteinlage', txt(i.minDeposit)], ['Einlagensicherung', txt(i.protection)]),
  },
  {
    id: 'kreditkarte', file: 'kreditkarte', group: 'Konten', icon: '💳', page: 'kreditkarte.html',
    title: 'Kreditkarte', subtitle: 'Jahresgebühr, Ausland, Bedingungen',
    fields: (i) =>
      rows(
        ['Jahresgebühr', txt(i.jahresgebuehr), i.ohneBedingungen ? undefined : txt(i.bedingung) ?? undefined],
        ['Kartentyp', [txt(i.kartentyp), txt(i.netzwerk)].filter(Boolean).join(' · ') || null],
        ['Fremdwährung', txt(i.fremdwaehrung)],
        ['Bargeld abheben', txt(i.abhebung)],
        ['Zinsfreie Tage', txt(i.zinsfreieText)],
        ['Apple Pay / Google Pay', `${yesNo(i.applePay)} / ${yesNo(i.googlePay)}`]
      ),
  },
  // ── Broker
  {
    id: 'broker', file: 'broker', group: 'Broker', icon: '📈', page: 'broker.html',
    title: 'Broker & Depot', subtitle: 'Depot- und Ordergebühr, ETF-Sparpläne',
    fields: (i) =>
      rows(
        ['Depotgebühr', txt(i.depotgebuehrText ?? i.brokerDepotfee)],
        ['Ordergebühr', txt(i.orderfee)],
        ['ETF-Sparpläne', i.etfSparplaeneAnzahl != null ? `${num(i.etfSparplaeneAnzahl)}${i.etfSparplaeneKostenlos ? ' kostenlos' : ''}` : null, txt(i.etfSparplaeneCaveat) ?? undefined],
        ['Sparplan', txt(i.sparplanAb)],
        ['Guthabenzins', i.guthabenzins != null ? formatPct(i.guthabenzins) : null, txt(i.guthabenzinsCaveat) ?? undefined],
        ['Verwahrentgelt', txt(i.verwahrentgeltText)]
      ),
  },
  {
    id: 'kinderdepot', file: 'kinderdepot', group: 'Broker', icon: '🧒', page: 'kinderdepot.html',
    title: 'Kinderdepot', subtitle: 'Junior-Depots im Vergleich',
    fields: (i) =>
      rows(
        ['Depotgebühr', txt(i.depotgebuehrText)],
        ['Mindestsparrate', i.mindestsparrate != null ? `${num(i.mindestsparrate)} €` : null],
        ['ETF-Sparpläne', num(i.etfSparplaeneAnzahl), txt(i.etfSparplaeneCaveat) ?? undefined],
        ['Guthabenzins', i.guthabenzins != null ? formatPct(i.guthabenzins) : null, txt(i.guthabenzinsCaveat) ?? undefined],
        ['Eigenes Elterndepot nötig', yesNo(i.parentDepotRequired)],
        ['Alter', txt(i.ageLimitText)],
        ['Besonderheiten', txt(i.besonderheitenText)]
      ),
  },
  // ── Kredite
  {
    id: 'kredite', file: 'kredite', group: 'Kredite', icon: '💰', page: 'kredite.html',
    title: 'Ratenkredit', subtitle: 'Zins, Kreditrahmen, Sondertilgung',
    topNote: 'Der „ab“-Zins ist der beworbene Mindestzins. Dein tatsächlicher Zins hängt von deiner Bonität ab.',
    fields: (i) =>
      rows(['Effektiver Jahreszins', txt(i.rate)], ['Kreditbetrag', txt(i.amount)], ['Laufzeit', txt(i.term)], ['Sondertilgung', txt(i.sondertilgung)]),
  },
  {
    id: 'baufinanzierung', file: 'baufinanzierung', group: 'Kredite', icon: '🏠', page: 'baufinanzierung.html',
    title: 'Baufinanzierung', subtitle: 'Vermittler im Vergleich',
    topNote: 'Bewusst ohne Zinssatz: Bei einer Baufinanzierung ist der Zins so individuell, dass eine pauschale Zahl irreführend wäre.',
    fields: (i) =>
      rows(['Partnerbanken', txt(i.partnerbankenText)], ['Standorte', txt(i.standorteText)], ['Beratung', txt(i.beratungText)], ['Besonderheiten', txt(i.besonderheitenText)]),
  },
  // ── Versicherungen (same 5 tabs as versicherungen.html)
  {
    id: 'haftpflicht', file: 'versicherungen', group: 'Versicherungen', icon: '🛡️', page: 'versicherungen.html',
    title: 'Privathaftpflicht', subtitle: 'Beitrag, Deckungssumme',
    fields: insurance('Jahresbeitrag', 'Deckungssumme'),
  },
  {
    id: 'hausrat', file: 'hausrat', group: 'Versicherungen', icon: '🛋️', page: 'versicherungen.html#hausrat',
    title: 'Hausrat', subtitle: 'Beitrag für einen Modellhaushalt',
    fields: insurance('Jahresbeitrag', 'Versicherungssumme'),
  },
  {
    id: 'bu', file: 'bu', group: 'Versicherungen', icon: '🩺', page: 'versicherungen.html#berufsunfaehigkeit',
    title: 'Berufsunfähigkeit', subtitle: 'Fachratings statt Pauschalpreis',
    fields: insurance('Beitrag', 'BU-Rente'),
  },
  {
    id: 'rechtsschutz', file: 'rechtsschutz', group: 'Versicherungen', icon: '⚖️', page: 'versicherungen.html#rechtsschutz',
    title: 'Rechtsschutz', subtitle: 'Leistungspakete',
    fields: insurance('Jahresbeitrag', 'Umfang'),
  },
  {
    id: 'kfz', file: 'autoversicherung', group: 'Versicherungen', icon: '🚗', page: 'versicherungen.html#kfz',
    title: 'Kfz-Versicherung', subtitle: 'Leistungen und Deckung',
    fields: insurance('Beitrag', 'Deckungssumme'),
  },
  // ── Steuern
  {
    id: 'steuerprogramm', file: 'steuerprogramm', group: 'Steuern', icon: '🧾', page: 'steuerprogramm.html',
    title: 'Steuerprogramm', subtitle: 'Steuersoftware im Vergleich',
    fields: (i) => {
      const plattform = i.plattform
        ? Object.entries(i.plattform as Record<string, boolean>)
            .filter(([, v]) => v)
            .map(([k]) => ({ web: 'Browser', app: 'App', desktop: 'Desktop' } as Record<string, string>)[k] ?? k)
            .join(', ')
        : null;
      const ZG: Record<string, string> = {
        angestellte: 'Angestellte', selbststaendige: 'Selbstständige', vermietung: 'Vermietung',
        kapitalertraege: 'Kapitalerträge', rente: 'Rentner',
      };
      const zielgruppen = i.zielgruppen
        ? Object.entries(i.zielgruppen as Record<string, boolean>).filter(([, v]) => v).map(([k]) => ZG[k] ?? k).join(', ')
        : null;
      return rows(
        ['Preis', txt(i.preis)],
        ['Plattform', plattform],
        ['Geeignet für', zielgruppen],
        ['Vorjahresdaten-Import', yesNo(i.vorjahresImport)],
        ['ELSTER-Zertifikat', txt(i.elsterZertifikat)]
      );
    },
  },
];

export const GROUPS: Category['group'][] = ['Konten', 'Broker', 'Kredite', 'Versicherungen', 'Steuern'];

export function getCategory(id: string) {
  return CATEGORIES.find((c) => c.id === id);
}
