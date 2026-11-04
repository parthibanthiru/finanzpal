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

export function factorLabel(file: string, key: string, lang: Lang = getLang()): string {
  return LABELS[lang][file]?.[key] ?? key;
}

/**
 * Scores are stored 0-100 (data/*.json) but shown out of 5, like on the website
 * (assets/compare.js toFive()): value / 20, one decimal, locale separator, and never
 * a perfect "5,0" for a score below 100.
 */
export function toFive(value: number, lang: Lang = getLang()): string {
  let v = Math.round((value / 20) * 10) / 10;
  if (value < 100 && v > 4.9) v = 4.9;
  const s = v.toFixed(1);
  return lang === 'en' ? s : s.replace('.', ',');
}
