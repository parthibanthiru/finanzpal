#!/usr/bin/env node
// Store screenshots from the web preview build (roadmap item 6).
//
//   git fetch origin web-preview && mkdir -p /tmp/wp && git archive origin/web-preview | tar -x -C /tmp/wp
//   node mobile/tools/store-screenshots.mjs /tmp/wp
//
// Needs Playwright with Chromium (not an app dependency — it's preinstalled in the agent's
// workspace; elsewhere `npm i -g playwright && npx playwright install chromium`).
// Serves the build itself, opens it in DE and EN at two phone sizes, light mode, and writes
// mobile/store/screenshots/<device>/<lang>/<n>-<screen>.png. The preview-only "Vorschau ohne
// Konto" note is hidden, because the real app doesn't show it. Everything else is the app as it is.
// The shots contain the comparison data of the day they're taken ("Stand …" is visible), so
// re-run this before a store submission.
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = path.resolve(process.argv[2] || '');
if (!process.argv[2] || !existsSync(path.join(ROOT, 'index.html'))) {
  console.error('usage: node mobile/tools/store-screenshots.mjs <web-preview build dir>');
  process.exit(1);
}
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'store', 'screenshots');

// Store sizes: Apple 6.7"/6.9" display 1290×2796; Google Play phone 1080×2160 (ratio ≤ 2:1).
const DEVICES = [
  { id: 'iphone-6.7', viewport: { width: 430, height: 932 }, scale: 3 },
  { id: 'android-phone', viewport: { width: 360, height: 720 }, scale: 3 },
];
const LANGS = {
  de: { locale: 'de-DE', badge: 'Vorschau ohne Konto', start: 'Jetzt starten ›', tagesgeld: 'Tagesgeld', calcTab: 'Rechner', calc: 'Zinseszinsrechner', scoreLabel: 'Finanzpal-Score' },
  en: { locale: 'en-US', badge: 'Preview without an account', start: 'Start now ›', tagesgeld: 'Instant savings account', calcTab: 'Calculators', calc: 'Compound Interest Calculator', scoreLabel: 'Finanzpal Score' },
};

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json', '.ttf': 'font/ttf', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = path.join(ROOT, url);
  if (!file.startsWith(ROOT) || !existsSync(file) || url.endsWith('/')) file = path.join(ROOT, 'index.html');
  try {
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, r));
const BASE = `http://localhost:${server.address().port}/`;

const settle = (p, ms = 1200) => p.waitForTimeout(ms);
const visible = (p, text) => p.getByText(text, { exact: true }).locator('visible=true').first();

async function hidePreviewNote(p, L) {
  await p.evaluate((badge) => {
    for (const el of document.querySelectorAll('div')) {
      if (el.childElementCount === 0 && el.textContent.trim().toLowerCase() === badge.toLowerCase()) {
        el.parentElement.style.display = 'none';
      }
    }
  }, L.badge);
}

async function openHome(p, L) {
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await settle(p, 2000);
  await hidePreviewNote(p, L);
}

const SHOTS = [
  ['1-vergleiche', async (p, L) => openHome(p, L)],
  ['2-vergleich', async (p, L) => {
    await openHome(p, L);
    await visible(p, L.tagesgeld).click();
    await settle(p);
  }],
  ['3-score', async (p, L) => {
    await openHome(p, L);
    await visible(p, L.tagesgeld).click();
    await settle(p);
    await p.locator(`[aria-label^="${L.scoreLabel}"]`).first().click();
    await settle(p);
  }],
  ['4-finanz-check', async (p, L) => {
    await openHome(p, L);
    await visible(p, L.start).click();
    for (let i = 0; i < 12; i++) {
      await settle(p, 700);
      // answer buttons of the current question (the first visible one each time)
      const answer = p.locator('[role=button] >> visible=true').filter({ hasNotText: /^←|›$/ });
      const body = await p.innerText('body');
      if (!/(Frage|Question) \d+ (von|of) \d+/.test(body)) break;
      await answer.first().click();
    }
    await settle(p);
  }],
  ['5-rechner', async (p, L) => {
    await openHome(p, L);
    await visible(p, L.calcTab).click();
    await settle(p);
    await visible(p, L.calc).click();
    await settle(p);
  }],
];

const browser = await chromium.launch();
let n = 0;
for (const d of DEVICES) {
  for (const [lang, L] of Object.entries(LANGS)) {
    const dir = path.join(OUT, d.id, lang);
    await mkdir(dir, { recursive: true });
    for (const [name, go] of SHOTS) {
      const ctx = await browser.newContext({ viewport: d.viewport, deviceScaleFactor: d.scale, locale: L.locale, colorScheme: 'light', isMobile: true, hasTouch: true });
      const p = await ctx.newPage();
      await go(p, L);
      await p.screenshot({ path: path.join(dir, `${name}.png`) });
      await ctx.close();
      n++;
    }
  }
}
await browser.close();
server.close();
console.log(`[store-screenshots] ${n} screenshots → ${path.relative(process.cwd(), OUT)}`);
