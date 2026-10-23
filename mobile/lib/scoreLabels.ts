// Finanzpal-Score breakdown rows: factor labels from the website's compare scripts
// (synced into data/score-labels.json), in the same order as the score's breakdown object.
import type { Score } from './data';
import { getLang, type Lang } from './i18n';

const LABELS: Record<Lang, Record<string, Record<string, string>>> = require('../data/score-labels.json');

export type ScoreRow = { key: string; label: string; value: number };

export function scoreRows(file: string, score: Score, lang: Lang = getLang()): ScoreRow[] {
  const labels = LABELS[lang][file] ?? {};
  return Object.entries(score.breakdown ?? {}).map(([key, value]) => ({ key, label: labels[key] ?? key, value }));
}
