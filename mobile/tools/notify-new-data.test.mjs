// node --test tools/*.test.mjs  (also run by .github/workflows/mobile-app.yml)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CATEGORIES, MAX_PER_DEVICE, buildMessages, findNews, joinNames } from './notify-new-data.mjs';

const real = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));

// "before" = the real data minus some entries, "after" = the real data
function fakeRead(removed = {}, removedGuides = []) {
  return (rev, path) => {
    const d = real(path);
    if (rev === 'after') return d;
    if (path === 'data/ratgeber.json') {
      const drop = (l) => ({ ...d[l], articles: d[l].articles.filter((a) => !removedGuides.includes(a.page)) });
      return { de: drop('de'), en: drop('en') };
    }
    const file = path.replace(/^data\/|\.en\.json$|\.json$/g, '');
    return removed[file] ? { ...d, items: d.items.filter((i) => !removed[file].includes(i.id)) } : d;
  };
}

test('every data file in the map exists, in both languages', () => {
  for (const file of Object.keys(CATEGORIES)) {
    assert.ok(real(`data/${file}.json`).items.length, file);
    assert.ok(real(`data/${file}.en.json`).items.length, `${file}.en`);
  }
});

test('nothing new → no messages', () => {
  const news = findNews(fakeRead(), 'before', 'after');
  assert.deepEqual(news, { providers: [], guides: [] });
  assert.deepEqual(buildMessages(news, 'de'), []);
});

test('a new provider → one message per language with names only, opening the provider', () => {
  const item = real('data/tagesgeld.json').items[0];
  const en = real('data/tagesgeld.en.json').items.find((i) => i.id === item.id);
  const news = findNews(fakeRead({ tagesgeld: [item.id] }), 'before', 'after');
  const [de] = buildMessages(news, 'de');
  assert.equal(de.title, 'Neu im Vergleich: Tagesgeld');
  assert.equal(de.body, `${item.name} ist jetzt dabei.`);
  assert.deepEqual(de.data, { type: 'compare', id: 'tagesgeld', focus: item.id });
  const [e] = buildMessages(news, 'en');
  assert.equal(e.title, 'New in Instant savings account');
  assert.equal(e.body, `${en.name} has been added.`);
  assert.doesNotMatch(de.body + e.body, /\d+[,.]\d+\s*%|€/); // no rates or prices in messages
});

test('the insurance file maps to its app screen id', () => {
  const id = real('data/versicherungen.json').items[0].id;
  const [m] = buildMessages(findNews(fakeRead({ versicherungen: [id] }), 'before', 'after'), 'de');
  assert.equal(m.data.id, 'haftpflicht');
});

test('a new guide → "Neuer Ratgeber" with its title, opening the page', () => {
  const g = real('data/ratgeber.json');
  const page = g.de.articles[0].page;
  const news = findNews(fakeRead({}, [page]), 'before', 'after');
  assert.deepEqual(buildMessages(news, 'de'), [{ title: 'Neuer Ratgeber', body: g.de.articles[0].title, data: { type: 'site', page } }]);
  assert.equal(buildMessages(news, 'en')[0].body, g.en.articles.find((a) => a.page === page).title);
});

test('lots of news → a single summary', () => {
  const first = (f) => [real(`data/${f}.json`).items[0].id];
  const pages = real('data/ratgeber.json').de.articles.slice(0, 2).map((a) => a.page);
  const news = findNews(fakeRead({ girokonto: first('girokonto'), broker: first('broker'), bu: first('bu') }, pages), 'before', 'after');
  const msgs = buildMessages(news, 'de');
  assert.ok(msgs.length <= MAX_PER_DEVICE);
  assert.equal(msgs.length, 1);
  assert.equal(msgs[0].body, 'Neue Anbieter: Girokonto, Broker & Depot, Berufsunfähigkeit · 2 neue Ratgeber.');
});

test('name lists', () => {
  assert.equal(joinNames(['A'], 'de'), 'A');
  assert.equal(joinNames(['A', 'B'], 'en'), 'A and B');
  assert.equal(joinNames(['A', 'B', 'C', 'D'], 'de'), 'A, B und 2 weitere');
});

test('channel id matches the app (lib/push.ts)', () => {
  const src = readFileSync(new URL('./notify-new-data.mjs', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../lib/push.ts', import.meta.url), 'utf8');
  const ch = app.match(/ANDROID_CHANNEL = '([^']+)'/)[1];
  assert.match(src, new RegExp(`channelId: '${ch}'`));
});
