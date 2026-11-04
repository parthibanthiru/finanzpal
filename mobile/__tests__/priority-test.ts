import { expect, it } from '@jest/globals';

import { byMatch, matchValue, prioActive } from '@/lib/priority';

const score = (breakdown: Record<string, number>) => ({ value: 50, band: 'C' as const, breakdown });

it('match is the weighted average of the chosen factors', () => {
  const s = score({ a: 100, b: 0, c: 50 });
  expect(matchValue(s, { a: 1, b: 1, c: 0 })).toBe(50);
  expect(matchValue(s, { a: 3, b: 1 })).toBe(75);
  expect(matchValue(s, { a: 0, b: 0 })).toBeNull();
  expect(matchValue(undefined, { a: 4 })).toBeNull();
  expect(matchValue({ value: 1, band: 'D' }, { a: 4 })).toBeNull();
});

it('prioActive and sorting put unscored items last', () => {
  expect(prioActive({ a: 0, b: 0 })).toBe(false);
  expect(prioActive({ a: 0, b: 2 })).toBe(true);
  const items = [{ id: 'x' }, { id: 'hi', score: score({ a: 90 }) }, { id: 'lo', score: score({ a: 10 }) }];
  expect([...items].sort(byMatch({ a: 2 })).map((i) => i.id)).toEqual(['hi', 'lo', 'x']);
});
