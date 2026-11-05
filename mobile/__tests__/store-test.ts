// Store listing texts (store/listing.json): store length limits, both languages complete,
// and no rates/prices/ratings (data-integrity rule — store texts can't follow data updates).
import { describe, expect, it } from '@jest/globals';

import { strings } from '@/lib/i18n';

const listing = require('../store/listing.json');

const LIMITS: Record<string, number> = {
  name: 30,
  subtitle: 30,
  shortDescription: 80,
  promotionalText: 170,
  whatsNew: 500,
};

// UTF-8 byte length (Apple counts keyword bytes; umlauts take two).
const byteLength = (s: string) => encodeURIComponent(s).replace(/%[0-9A-F]{2}/g, 'x').length;

describe.each(['de', 'en'])('store listing (%s)', (lang) => {
  const l = listing[lang];
  const description: string = l.description.join('\n');

  it('has every field', () => {
    for (const key of [...Object.keys(LIMITS), 'keywords', 'description']) {
      expect(l[key]).toBeTruthy();
    }
  });

  it('stays within the store limits', () => {
    for (const [key, max] of Object.entries(LIMITS)) {
      expect([...l[key]].length).toBeLessThanOrEqual(max);
    }
    expect(description.length).toBeLessThanOrEqual(4000);
    expect(byteLength(l.keywords)).toBeLessThanOrEqual(100);
    expect(l.keywords).not.toMatch(/,\s/);
  });

  it('contains no rates, prices or ratings', () => {
    const all = [l.name, l.subtitle, l.shortDescription, l.promotionalText, l.whatsNew, description].join('\n');
    expect(all).not.toMatch(/\d\s*(%|€|EUR|Sterne|stars)/i);
    expect(all).not.toMatch(/\d[.,]\d\s*\/\s*5/);
  });

  it('uses the app wording for the partner-link label', () => {
    const t = strings(lang as 'de' | 'en');
    expect(description).toContain(t.card.ad);
  });
});

describe('store listing URLs', () => {
  it('has privacy, support and deletion URLs for both languages', () => {
    for (const key of ['privacyPolicy', 'support', 'accountDeletion']) {
      expect(listing.urls[key].de).toMatch(/^(\{SITE\}|https:\/\/)/);
      expect(listing.urls[key].en).toMatch(/^(\{SITE\}|https:\/\/)/);
    }
  });
});
