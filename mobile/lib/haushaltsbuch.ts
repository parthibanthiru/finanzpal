// Budget tracker — same categories, entry format and totals as assets/haushaltsbuch.js.
// Like on the website, entries stay on this device only (AsyncStorage instead of localStorage);
// nothing is sent to Supabase or any server.
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Typ = 'einnahme' | 'ausgabe';
export type Buchung = {
  id: string;
  typ: Typ;
  kategorie: string;
  beschreibung: string;
  betrag: number;
  createdAt: number;
};

export const KATEGORIEN: Record<Typ, { id: string; label: string }[]> = {
  einnahme: [
    { id: 'gehalt', label: 'Gehalt' },
    { id: 'sonstige-einnahme', label: 'Sonstige Einnahme' },
  ],
  ausgabe: [
    { id: 'wohnen', label: 'Wohnen' },
    { id: 'lebensmittel', label: 'Lebensmittel' },
    { id: 'transport', label: 'Transport' },
    { id: 'versicherungen', label: 'Versicherungen' },
    { id: 'freizeit', label: 'Freizeit & Shopping' },
    { id: 'sonstiges', label: 'Sonstiges' },
  ],
};

export function katLabel(typ: Typ, katId: string) {
  return KATEGORIEN[typ].find((k) => k.id === katId)?.label ?? katId;
}

// Same key as the website, scoped per account so two people sharing a phone don't see each other's entries.
const keyFor = (userId: string) => `fp-haushaltsbuch-v1:${userId}`;

export async function loadBuchungen(userId: string): Promise<Buchung[]> {
  try {
    const raw = await AsyncStorage.getItem(keyFor(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveBuchungen(userId: string, items: Buchung[]) {
  try {
    await AsyncStorage.setItem(keyFor(userId), JSON.stringify(items));
  } catch {
    // storage full/unavailable: the screen keeps working for this session, like the website
  }
}

export async function deleteBuchungen(userId: string) {
  try {
    await AsyncStorage.removeItem(keyFor(userId));
  } catch {
    // ignore
  }
}

export function newBuchung(typ: Typ, kategorie: string, beschreibung: string, betrag: number): Buchung {
  return {
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    typ,
    kategorie,
    beschreibung: beschreibung.trim(),
    betrag,
    createdAt: Date.now(),
  };
}

/** Totals and per-category expense breakdown — same as renderSummary() on the website. */
export function summarize(items: Buchung[]) {
  let einnahmen = 0;
  let ausgaben = 0;
  const byKategorie: Record<string, number> = {};
  for (const tx of items) {
    if (tx.typ === 'einnahme') einnahmen += tx.betrag;
    else {
      ausgaben += tx.betrag;
      byKategorie[tx.kategorie] = (byKategorie[tx.kategorie] || 0) + tx.betrag;
    }
  }
  const breakdown = Object.keys(byKategorie)
    .map((katId) => ({ katId, betrag: byKategorie[katId], pct: ausgaben ? (byKategorie[katId] / ausgaben) * 100 : 0 }))
    .sort((a, b) => b.betrag - a.betrag);
  return { einnahmen, ausgaben, saldo: einnahmen - ausgaben, breakdown };
}
