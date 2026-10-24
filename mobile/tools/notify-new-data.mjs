#!/usr/bin/env node
// Sends the app's "Neue Anbieter und Ratgeber" push notifications.
//
//   node mobile/tools/notify-new-data.mjs --before <commit> --after <commit> [--dry-run]
//
// Compares the app's synced data (mobile/data/, written by sync-data.mjs) between two commits:
//   • a provider id that is new in a comparison's data file  → "Neu im Vergleich: Tagesgeld"
//   • a guide page that is new in ratgeber.json              → "Neuer Ratgeber: …"
// Only additions count — changed rates, fees or ratings never trigger a message, and the
// messages contain names only, no numbers. Each device gets at most 3 messages per run (more
// news → one summary), in the language it registered with.
//
// Recipients come from Supabase (table push_tokens, see mobile/supabase/schema.sql), messages go
// out through Expo's push service. Without SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (or with
// --dry-run) it only prints what it would send. Optional: EXPO_ACCESS_TOKEN (if "enhanced push
// security" is switched on for the Expo project).
import { execFileSync } from 'node:child_process';
import { readFileSync, appendFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const CATEGORIES = Object.fromEntries(
  Object.entries(JSON.parse(readFileSync(join(here, 'push-categories.json'), 'utf8'))).filter(([k]) => !k.startsWith('_'))
);
export const MAX_PER_DEVICE = 3;
const LANGS = ['de', 'en'];

const T = {
  de: {
    providerTitle: (cat) => `Neu im Vergleich: ${cat}`,
    providerBody: (names, n) => `${names} ${n === 1 ? 'ist' : 'sind'} jetzt dabei.`,
    and: 'und',
    more: (n) => `${n} weitere`,
    guideTitle: 'Neuer Ratgeber',
    summaryTitle: 'Neu bei Finanzpal',
    summaryBody: (cats, guides) =>
      [cats.length ? `Neue Anbieter: ${cats.join(', ')}` : '', guides ? `${guides} ${guides === 1 ? 'neuer Ratgeber' : 'neue Ratgeber'}` : '']
        .filter(Boolean).join(' · ') + '.',
  },
  en: {
    providerTitle: (cat) => `New in ${cat}`,
    providerBody: (names, n) => `${names} ${n === 1 ? 'has' : 'have'} been added.`,
    and: 'and',
    more: (n) => `${n} more`,
    guideTitle: 'New guide',
    summaryTitle: 'New on Finanzpal',
    summaryBody: (cats, guides) =>
      [cats.length ? `New providers: ${cats.join(', ')}` : '', guides ? `${guides} new ${guides === 1 ? 'guide' : 'guides'}` : '']
        .filter(Boolean).join(' · ') + '.',
  },
};

/** "A", "A und B", "A, B und 3 weitere" */
export function joinNames(names, lang) {
  const t = T[lang];
  if (names.length <= 2) return names.join(` ${t.and} `);
  return `${names.slice(0, 2).join(', ')} ${t.and} ${t.more(names.length - 2)}`;
}

/**
 * What's new between two versions. `read(rev, path)` returns the parsed JSON of mobile/<path>
 * at that commit, or null if it didn't exist.
 * → { providers: [{ file, id, items: [{ id, name: {de, en} }] }], guides: [{ page, title: {de, en} }] }
 */
export function findNews(read, before, after) {
  const news = { providers: [], guides: [] };
  for (const [file, cat] of Object.entries(CATEGORIES)) {
    const old = read(before, `data/${file}.json`);
    const now = read(after, `data/${file}.json`);
    if (!old || !now) continue; // a brand-new comparison needs an app update anyway
    const oldIds = new Set(old.items.map((i) => i.id));
    const nowEn = read(after, `data/${file}.en.json`);
    const enName = (id) => nowEn?.items.find((i) => i.id === id)?.name;
    const added = now.items
      .filter((i) => i.id && !oldIds.has(i.id))
      .map((i) => ({ id: i.id, name: { de: i.name, en: enName(i.id) ?? i.name } }));
    if (added.length) news.providers.push({ file, id: cat.id, items: added });
  }
  const oldG = read(before, 'data/ratgeber.json');
  const nowG = read(after, 'data/ratgeber.json');
  if (oldG && nowG) {
    const known = new Set(oldG.de.articles.map((a) => a.page));
    for (const a of nowG.de.articles) {
      if (known.has(a.page)) continue;
      const en = nowG.en?.articles.find((x) => x.page === a.page);
      news.guides.push({ page: a.page, title: { de: a.title, en: en?.title ?? a.title } });
    }
  }
  return news;
}

/** The notifications for one language: [{ title, body, data }] (at most MAX_PER_DEVICE). */
export function buildMessages(news, lang) {
  const t = T[lang];
  const msgs = [];
  for (const p of news.providers) {
    const names = p.items.map((i) => i.name[lang]);
    msgs.push({
      title: t.providerTitle(CATEGORIES[p.file][lang]),
      body: t.providerBody(joinNames(names, lang), names.length),
      data: { type: 'compare', id: p.id, focus: p.items[0].id },
    });
  }
  for (const g of news.guides) {
    msgs.push({ title: t.guideTitle, body: g.title[lang], data: { type: 'site', page: g.page } });
  }
  if (msgs.length <= MAX_PER_DEVICE) return msgs;
  const first = news.providers[0];
  return [
    {
      title: t.summaryTitle,
      body: t.summaryBody(news.providers.map((p) => CATEGORIES[p.file][lang]), news.guides.length),
      data: first ? { type: 'compare', id: first.id, focus: first.items[0].id } : { type: 'site', page: news.guides[0].page },
    },
  ];
}

// ── sending ──────────────────────────────────────────────────────────────────

async function supabaseTokens(url, key) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const res = await fetch(`${url}/rest/v1/push_tokens?select=token,lang&order=token`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Range: `${from}-${from + 999}` },
    });
    if (!res.ok) throw new Error(`Supabase push_tokens: HTTP ${res.status} ${await res.text()}`);
    const rows = await res.json();
    out.push(...rows);
    if (rows.length < 1000) return out;
  }
}

async function supabaseDelete(url, key, tokens) {
  for (let i = 0; i < tokens.length; i += 100) {
    const list = tokens.slice(i, i + 100).map((t) => `"${t.replace(/"/g, '')}"`).join(',');
    await fetch(`${url}/rest/v1/push_tokens?token=in.(${encodeURIComponent(list)})`, {
      method: 'DELETE',
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
  }
}

/** Sends to Expo in batches of 100 recipients; returns the tokens Expo says are gone. */
async function expoSend(messages, accessToken) {
  const dead = [];
  for (let i = 0; i < messages.length; i += 100) {
    const batch = messages.slice(i, i + 100);
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(batch),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`Expo push: HTTP ${res.status} ${JSON.stringify(json)}`);
    (json.data ?? []).forEach((ticket, j) => {
      if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') dead.push(batch[j].to);
    });
  }
  return dead;
}

function gitRead(rev, path) {
  try {
    return JSON.parse(execFileSync('git', ['show', `${rev}:mobile/${path}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
  } catch {
    return null;
  }
}

function summary(line) {
  console.log(line);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, line + '\n');
}

async function main() {
  const args = process.argv.slice(2);
  const arg = (name) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const before = arg('before');
  const after = arg('after') || 'HEAD';
  if (!before || /^0+$/.test(before)) {
    summary('No previous commit to compare with — nothing to send.');
    return;
  }
  const news = findNews(gitRead, before, after);
  const perLang = Object.fromEntries(LANGS.map((l) => [l, buildMessages(news, l)]));
  if (!perLang.de.length) {
    summary('No new providers or guides — nothing to send.');
    return;
  }
  summary(`### Push notifications (${before.slice(0, 7)} → ${after.slice(0, 7)})`);
  for (const l of LANGS) for (const m of perLang[l]) summary(`- **${l}** ${m.title} — ${m.body} \`${JSON.stringify(m.data)}\``);

  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (args.includes('--dry-run') || !url || !key) {
    summary(`\nDry run — ${!url || !key ? 'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set' : '--dry-run'}; nothing sent.`);
    return;
  }
  const rows = await supabaseTokens(url, key);
  const messages = [];
  for (const row of rows) {
    for (const m of perLang[row.lang === 'en' ? 'en' : 'de']) {
      messages.push({ to: row.token, title: m.title, body: m.body, data: m.data, channelId: 'updates' });
    }
  }
  const dead = await expoSend(messages, process.env.EXPO_ACCESS_TOKEN);
  if (dead.length) await supabaseDelete(url, key, dead);
  summary(`\nSent ${messages.length} notifications to ${rows.length} devices; removed ${dead.length} unregistered devices.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
