// Keeps the app in sync with the website (single source of truth = the website):
//  1. copies ../data/*.json (German files, not *.en.json) into mobile/data/
//  2. extracts the German disclosure texts ("Werbung: … Stand …") from the website's
//     comparison pages, assets/insurance-tabs.js and the calculator pages into
//     mobile/data/disclosures.json
//  3. extracts the Finanz-Check quiz (questions + weights) from assets/finanz-check.js
//     into mobile/data/finanz-check.json
// Runs automatically before `npm start` (prestart). The copies are committed, so cloud
// builds (EAS) work without the website folder next to them.
import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
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

// calculator disclaimers: first <p class="calc-disclaimer"> without an id on each calculator page
// (the one with an id, e.g. bf-payoff-note, is filled in by JavaScript at runtime)
const RECHNER = [
  'sparplanrechner', 'zinseszinsrechner', 'kreditrechner', 'baufinanzierungsrechner',
  'nettolohnrechner', 'altersvorsorge-rechner', 'haushaltsbuch',
];
for (const page of RECHNER) {
  const html = readFileSync(join(site, `${page}.html`), 'utf8');
  const m = html.match(/<p class="calc-disclaimer"(?![^>]*\bid=)[^>]*>([\s\S]*?)<\/p>/);
  if (m) disclosures[`rechner:${page}`] = decode(m[1]);
  else missing.push(`${page}.html (calc-disclaimer)`);
}

writeFileSync(join(dest, 'disclosures.json'), JSON.stringify(disclosures, null, 2) + '\n');

// 3. Finanz-Check quiz: QUESTIONS, WEIGHTS and CATEGORY_KEYS from assets/finanz-check.js
//    (plain data literals inside the script — evaluated in an empty sandbox, nothing else runs)
function extractLiteral(src, name) {
  const start = src.indexOf(`var ${name} =`);
  if (start < 0) return undefined;
  let i = src.indexOf('=', start) + 1;
  while (/\s/.test(src[i])) i++;
  const open = src[i];
  const close = open === '[' ? ']' : open === '{' ? '}' : null;
  if (!close) return undefined;
  let depth = 0, inStr = null;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (inStr) {
      if (c === '\\') j++;
      else if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'") inStr = c;
    else if (c === open) depth++;
    else if (c === close && --depth === 0) {
      return vm.runInNewContext(`(${src.slice(i, j + 1)})`, Object.create(null), { timeout: 1000 });
    }
  }
  return undefined;
}
const fc = readFileSync(join(site, 'assets', 'finanz-check.js'), 'utf8');
const quiz = {
  questions: extractLiteral(fc, 'QUESTIONS'),
  weights: extractLiteral(fc, 'WEIGHTS'),
  categoryKeys: extractLiteral(fc, 'CATEGORY_KEYS'),
};
if (!Array.isArray(quiz.questions) || !quiz.weights || !Array.isArray(quiz.categoryKeys)) {
  missing.push('assets/finanz-check.js (QUESTIONS/WEIGHTS/CATEGORY_KEYS)');
} else {
  writeFileSync(join(dest, 'finanz-check.json'), JSON.stringify(quiz, null, 2) + '\n');
  console.log(`[sync-data] Finanz-Check: ${quiz.questions.length} Fragen, ${quiz.categoryKeys.length} Kategorien übernommen.`);
}

console.log(`[sync-data] ${n} Datendateien + ${Object.keys(disclosures).length} Hinweistexte übernommen.`);
if (missing.length) {
  console.warn(`[sync-data] WARNUNG: nicht gefunden: ${missing.join(', ')}`);
  process.exitCode = 1;
}
