// Keeps the app in sync with the website (single source of truth = the website), in German and English:
//  1. copies ../data/*.json and ../data/*.en.json into mobile/data/
//  2. extracts the disclosure texts ("Werbung: … Stand …") from the website's comparison pages,
//     assets/insurance-tabs.js and the calculator pages into mobile/data/disclosures.json (German,
//     from the root pages) and mobile/data/disclosures.en.json (English, from en/)
//  3. extracts the Finanz-Check quiz (questions + weights) from assets/finanz-check.js
//     into mobile/data/finanz-check.json (questions carry de + en labels)
//  4. extracts the Ratgeber article list (category, title, teaser) from ratgeber.html and
//     en/ratgeber.html into mobile/data/ratgeber.json
//  5. extracts the Finanzpal-Score factor labels (DE + EN) from the compare scripts into
//     mobile/data/score-labels.json
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
const missing = [];
const LANGS = { de: '', en: 'en/' }; // language -> folder of the website pages

// 1. data files (German + English)
let n = 0;
for (const f of readdirSync(join(site, 'data'))) {
  if (!f.endsWith('.json')) continue;
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
// calculator disclaimers: first <p class="calc-disclaimer"> without an id on each calculator page
// (the one with an id, e.g. bf-payoff-note, is filled in by JavaScript at runtime)
const RECHNER = [
  'sparplanrechner', 'zinseszinsrechner', 'kreditrechner', 'baufinanzierungsrechner',
  'nettolohnrechner', 'altersvorsorge-rechner', 'haushaltsbuch',
];
const INSURANCE = ['versicherungen', 'hausrat', 'bu', 'rechtsschutz', 'autoversicherung'];
const tabs = readFileSync(join(site, 'assets', 'insurance-tabs.js'), 'utf8');
const counts = {};

for (const [lang, dir] of Object.entries(LANGS)) {
  const disclosures = {};
  for (const [key, page] of Object.entries(PAGES)) {
    const html = readFileSync(join(site, dir, page), 'utf8');
    const m = html.match(/class="disclosure-note"[^>]*>([\s\S]*?)<\/(?:p|div)>/);
    if (m) disclosures[key] = decode(m[1]);
    else missing.push(`${dir}${page}`);
  }
  // insurance types: TYPES[].key + disclosure.{de,en} in assets/insurance-tabs.js
  const typeRe = new RegExp(
    String.raw`key:\s*'([a-z]+)'[\s\S]*?disclosure:\s*\{\s*de:\s*'((?:[^'\\]|\\.)*)',\s*en:\s*'((?:[^'\\]|\\.)*)'`,
    'g'
  );
  let t;
  while ((t = typeRe.exec(tabs))) disclosures[t[1]] = decode(lang === 'de' ? t[2] : t[3]);
  for (const k of INSURANCE) if (!disclosures[k]) missing.push(`insurance-tabs.js:${k} (${lang})`);
  for (const page of RECHNER) {
    const html = readFileSync(join(site, dir, `${page}.html`), 'utf8');
    const m = html.match(/<p class="calc-disclaimer"(?![^>]*\bid=)[^>]*>([\s\S]*?)<\/p>/);
    if (m) disclosures[`rechner:${page}`] = decode(m[1]);
    else missing.push(`${dir}${page}.html (calc-disclaimer)`);
  }
  const file = lang === 'de' ? 'disclosures.json' : `disclosures.${lang}.json`;
  writeFileSync(join(dest, file), JSON.stringify(disclosures, null, 2) + '\n');
  counts[lang] = Object.keys(disclosures).length;
}

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
  const noEn = quiz.questions.filter((q) => !q.text.en || q.options.some((o) => !o.label.en));
  if (noEn.length) missing.push(`finanz-check.js: English text missing for ${noEn.map((q) => q.id).join(', ')}`);
  writeFileSync(join(dest, 'finanz-check.json'), JSON.stringify(quiz, null, 2) + '\n');
  console.log(`[sync-data] Finanz-Check: ${quiz.questions.length} Fragen, ${quiz.categoryKeys.length} Kategorien übernommen.`);
}

// 5. Finanzpal-Score factor labels (for the score breakdown), DE + EN, from the website's
//    compare scripts. Each script's `var STR = …` is evaluated with LANG = 'de' / 'en' in an empty
//    sandbox (only the object literal is built, no function in it runs); compare.js keeps the
//    shared ones in SCORE_FACTOR_LABELS.
function evalVar(src, name, sandbox) {
  const start = src.indexOf(`var ${name} =`);
  if (start < 0) return undefined;
  let i = src.indexOf('=', start) + 1;
  let depth = 0, inStr = null;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (inStr) {
      if (c === '\\') j++;
      else if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') inStr = c;
    else if (c === '{' || c === '(' || c === '[') depth++;
    else if (c === '}' || c === ')' || c === ']') depth--;
    else if (c === ';' && depth === 0) {
      return vm.runInNewContext(`(${src.slice(i, j)})`, Object.assign(Object.create(null), sandbox), { timeout: 1000 });
    }
  }
  return undefined;
}
const SCORE_LABEL_SCRIPTS = {
  girokonto: 'girokonto-compare.js',
  broker: 'broker-compare.js',
  kinderdepot: 'kinderdepot-compare.js',
  kreditkarte: 'kreditkarte-compare.js',
  steuerprogramm: 'steuer-compare.js',
};
const scoreLabels = { de: {}, en: {} };
for (const [file, script] of Object.entries(SCORE_LABEL_SCRIPTS)) {
  const src = readFileSync(join(site, 'assets', script), 'utf8');
  for (const lang of ['de', 'en']) {
    try {
      const str = evalVar(src, 'STR', { LANG: lang });
      if (str?.scoreLabels) scoreLabels[lang][file] = str.scoreLabels;
    } catch (e) {
      missing.push(`${script}: STR (${lang}) — ${e.message}`);
    }
  }
}
const shared = extractLiteral(readFileSync(join(site, 'assets', 'compare.js'), 'utf8'), 'SCORE_FACTOR_LABELS') || {};
for (const [file, byLang] of Object.entries(shared)) {
  for (const lang of ['de', 'en']) if (byLang[lang]) scoreLabels[lang][file] = byLang[lang];
}
// every factor that appears in a score breakdown must have a label in both languages
for (const f of readdirSync(join(site, 'data'))) {
  if (!f.endsWith('.json') || f.endsWith('.en.json')) continue;
  const file = f.replace('.json', '');
  const items = JSON.parse(readFileSync(join(site, 'data', f), 'utf8')).items || [];
  const keys = new Set(items.flatMap((it) => Object.keys(it.score?.breakdown || {})));
  for (const k of keys) {
    for (const lang of ['de', 'en']) {
      if (!scoreLabels[lang][file]?.[k]) missing.push(`score label "${k}" for ${file} (${lang})`);
    }
  }
}
writeFileSync(join(dest, 'score-labels.json'), JSON.stringify(scoreLabels, null, 2) + '\n');

// 4. Ratgeber: articles and topic chips from ratgeber.html (+ en/). Articles are paired by
//    page so each one has a German and an English title; `cat` = index of its topic chip
//    (same order in both languages), so colors don't depend on the translated chip text.
const ratgeber = {};
for (const [lang, dir] of Object.entries(LANGS)) {
  const html = readFileSync(join(site, dir, 'ratgeber.html'), 'utf8');
  const chips = [...html.matchAll(/<button[^>]*class="chip[^"]*"[^>]*data-filter="([^"]*)"[^>]*>([\s\S]*?)<\/button>/g)]
    .map((m) => ({ filter: decode(m[1]), label: decode(m[2]) }))
    .filter((c) => c.filter);
  const articles = [...html.matchAll(/<a href="(ratgeber-[^"]+\.html)" class="guide-card">([\s\S]*?)<\/a>/g)].map((m) => {
    const body = m[2];
    const cat = decode((body.match(/<span class="guide-cat">([\s\S]*?)<\/span>/) || [])[1] || '');
    return {
      page: m[1],
      cat: chips.findIndex((c) => c.filter === cat),
      catLabel: cat,
      title: decode((body.match(/<h3>([\s\S]*?)<\/h3>/) || [])[1] || ''),
      teaser: decode((body.match(/<p>([\s\S]*?)<\/p>/) || [])[1] || ''),
    };
  });
  if (!chips.length || !articles.length || articles.some((a) => a.cat < 0 || !a.title)) {
    missing.push(`${dir}ratgeber.html (topic chips / guide cards)`);
  }
  ratgeber[lang] = { topics: chips.map((c) => c.label), articles };
}
if (ratgeber.de && ratgeber.en && ratgeber.de.articles.map((a) => a.page).join() !== ratgeber.en.articles.map((a) => a.page).join()) {
  missing.push('ratgeber.html vs en/ratgeber.html: different article lists');
}
writeFileSync(join(dest, 'ratgeber.json'), JSON.stringify(ratgeber, null, 2) + '\n');

console.log(
  `[sync-data] ${n} Datendateien (DE + EN), ${counts.de} + ${counts.en} Hinweistexte (DE + EN), ` +
    `${ratgeber.de?.articles.length ?? 0} Ratgeber-Artikel übernommen.`
);
if (missing.length) {
  console.warn(`[sync-data] WARNUNG: nicht gefunden: ${missing.join(', ')}`);
  process.exitCode = 1;
}
