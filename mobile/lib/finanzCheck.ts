// Finanz-Check: the website's quiz (finanz-check.html / assets/finanz-check.js).
// Questions and weights come from data/finanz-check.json, extracted from the website by
// tools/sync-data.mjs; the scoring below is a direct port of scoreCategory()/renderResult().
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Item } from './data';
import { formatPct } from './format';

type Label = { de: string; en?: string };
export type Question = { id: string; text: Label; options: { id: string; label: Label }[] };
type Weights = Record<string, Record<string, Record<string, Record<string, number>>>>;
export type Answers = Record<string, string>;

const QUIZ: { questions: Question[]; weights: Weights; categoryKeys: string[] } = require('../data/finanz-check.json');

export const QUESTIONS = QUIZ.questions;
export const CATEGORY_KEYS = QUIZ.categoryKeys;

/** Quiz category -> app comparison (route id + data file) and display name. */
export const CATEGORY_META: Record<string, { routeId: string; file: string; title: string }> = {
  girokonto: { routeId: 'girokonto', file: 'girokonto', title: 'Girokonto' },
  depot: { routeId: 'broker', file: 'broker', title: 'Depot' },
  kreditkarte: { routeId: 'kreditkarte', file: 'kreditkarte', title: 'Kreditkarte' },
  tagesgeld: { routeId: 'tagesgeld', file: 'tagesgeld', title: 'Tagesgeld' },
};

/** Points per provider id for one category — same as scoreCategory() on the website. */
export function scoreCategory(cat: string, answers: Answers): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const qid of Object.keys(answers)) {
    const oid = answers[qid];
    const pointMap = QUIZ.weights[cat]?.[qid]?.[oid] ?? {};
    for (const id of Object.keys(pointMap)) scores[id] = (scores[id] || 0) + pointMap[id];
  }
  return scores;
}

/** Top pick for a category — same ranking and fallback as renderResult() on the website. */
export function topPick(cat: string, answers: Answers, items: Item[]): Item | undefined {
  const byId: Record<string, Item> = {};
  for (const it of items) byId[it.id] = it;
  const scores = scoreCategory(cat, answers);
  let ranked = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
  if (!ranked.length) ranked = items.map((it) => it.id);
  return byId[ranked[0]];
}

/** The three facts shown on each result card — same as factRows() on the website. */
export function factRows(cat: string, item: Item): [string, string][] {
  const s = (v: unknown) => (v == null || v === '' ? '–' : String(v));
  if (cat === 'girokonto') {
    return [
      ['Kontoführung', s(item.kontofuehrung)],
      ['Dispozins', item.dispozins != null ? formatPct(item.dispozins) : 'Kein Dispo'],
      ['Karte', s(item.karteNetzwerk)],
    ];
  }
  if (cat === 'depot') {
    return [
      ['Depotgebühr', s(item.depotgebuehrText)],
      ['Mind. Sparrate', item.mindestsparrate != null ? `${item.mindestsparrate} €` : '–'],
      ['Guthabenzins', item.guthabenzins ? formatPct(item.guthabenzins) : '–'],
    ];
  }
  if (cat === 'kreditkarte') {
    return [
      ['Jahresgebühr', s(item.jahresgebuehr)],
      ['Kartentyp', s(item.kartentyp)],
      ['Fremdwährung', s(item.fremdwaehrung)],
    ];
  }
  return [
    ['Zins', s(item.rate)],
    ['Garantie', s(item.guarantee)],
    ['Einlagensicherung', s(item.protection)],
  ];
}

// Answers are kept on the device per account, so the home screen can show "Deine Empfehlungen".
const keyFor = (userId: string) => `fp-finanz-check-v1:${userId}`;

export async function loadAnswers(userId: string): Promise<Answers | null> {
  try {
    const raw = await AsyncStorage.getItem(keyFor(userId));
    const parsed = raw ? JSON.parse(raw) : null;
    // Only a complete set counts — if the website adds a question, the user simply retakes the check.
    return parsed && QUESTIONS.every((q) => typeof parsed[q.id] === 'string') ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveAnswers(userId: string, answers: Answers) {
  try {
    await AsyncStorage.setItem(keyFor(userId), JSON.stringify(answers));
  } catch {
    // ignore — the result is still shown for this session
  }
}

export async function clearAnswers(userId: string) {
  try {
    await AsyncStorage.removeItem(keyFor(userId));
  } catch {
    // ignore
  }
}
