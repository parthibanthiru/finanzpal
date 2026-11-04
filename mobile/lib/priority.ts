// "Was ist dir wichtig?" personal match, mirrors assets/priority-match.js on the website:
// weighted average of the item's real Finanzpal-Score factor values (0-100) using the
// user's weights (0-4 steps -> 0..100). Never changes the Finanzpal-Score itself.
import type { Score } from './data';

export const PRIO_STEPS = 4; // weights are 0..4

export type Weights = Record<string, number>;

export function prioActive(weights: Weights): boolean {
  return Object.values(weights).some((w) => w > 0);
}

/** 0-100 match, or null when the item has no score breakdown or no slider is set. */
export function matchValue(score: Score | undefined, weights: Weights): number | null {
  const b = score?.breakdown;
  if (!b) return null;
  let sum = 0;
  let tot = 0;
  for (const [key, w] of Object.entries(weights)) {
    if (w > 0 && typeof b[key] === 'number') {
      sum += w * b[key];
      tot += w;
    }
  }
  return tot > 0 ? sum / tot : null;
}

/** Sort comparator: higher match first, items without a match last. */
export function byMatch<T extends { score?: Score }>(weights: Weights) {
  return (a: T, b: T) => (matchValue(b.score, weights) ?? -1) - (matchValue(a.score, weights) ?? -1);
}
