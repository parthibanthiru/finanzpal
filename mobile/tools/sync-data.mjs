// Keeps the app in sync with the website (single source of truth = the website):
//  1. copies ../data/*.json (German files, not *.en.json) into mobile/data/
//  2. extracts the German disclosure texts ("Werbung: … Stand …") from the website's
//     comparison pages and assets/insurance-tabs.js into mobile/data/disclosures.json
// Runs automatically before `npm start` (prestart). The copies are committed, so cloud
// builds (EAS) work without the website folder next to them.
import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, '..', '..');
const dest = join(here, '..', 'data');
mkdirSync(dest, { recursive: true });

// 1. data files
let n = 0;
for (const f of readdirSync(join(site, 'data'))) {
  if (!f.endsWith('.json') || f.endsWith('.en.json')) continue;
  copyFileSync(join(site, 'data', f), join(dest, f));
  n++;
}

// 2. disclosures
const decode = (s) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\\'/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

// data file -> website page holding its disclosure-note
const PAGES = {
  girokonto: 'girokonto.html',
  tagesgeld: 'tagesgeld.html',
  kreditkarte: 'kreditkarte.html',
  broker: 'broker.html',
  kinderdepot: 'kinderdepot.html',
  kredite: 'kredite.html',
  baufinanzierung: 'baufinanzierung.html',
  steuerprogramm: 'steuerprogramm.html',
  etf: 'etf-suche.html',
};
const disclosures = {};
const missing = [];
for (const [key, page] of Object.entries(PAGES)) {
  const html = readFileSync(join(site, page), 'utf8');
  const m = html.match(/class="disclosure-note"[^>]*>([\s\S]*?)<\/(?:p|div)>/);
  if (m) disclosures[key] = decode(m[1]);
  else missing.push(page);
}

// insurance types: TYPES[].key + disclosure.de in assets/insurance-tabs.js
const tabs = readFileSync(join(site, 'assets', 'insurance-tabs.js'), 'utf8');
const typeRe = /key:\s*'([a-z]+)'[\s\S]*?disclosure:\s*\{\s*de:\s*'((?:[^'\\]|\\.)*)'/g;
let t;
while ((t = typeRe.exec(tabs))) disclosures[t[1]] = decode(t[2]);
for (const k of ['versicherungen', 'hausrat', 'bu', 'rechtsschutz', 'autoversicherung']) {
  if (!disclosures[k]) missing.push(`insurance-tabs.js:${k}`);
}

writeFileSync(join(dest, 'disclosures.json'), JSON.stringify(disclosures, null, 2) + '\n');
console.log(`[sync-data] ${n} Datendateien + ${Object.keys(disclosures).length} Hinweistexte übernommen.`);
if (missing.length) {
  console.warn(`[sync-data] WARNUNG: kein Hinweistext gefunden für: ${missing.join(', ')}`);
  process.exitCode = 1;
}
