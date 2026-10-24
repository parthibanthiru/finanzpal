// Rewrites the absolute "/_expo/…" and "/assets/…" URLs of a single-page `expo export --platform web`
// build to relative ones, so the preview also works when it isn't served from the domain root.
//   node tools/relative-web-paths.mjs dist-web
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2] || 'dist-web';
let changed = 0;
function walk(d) {
  for (const name of readdirSync(d)) {
    const p = join(d, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(html|js|css)$/.test(name)) {
      const src = readFileSync(p, 'utf8');
      const out = src
        .replace(/(["'(=]\s*)\/(_expo|assets)\//g, '$1./$2/')
        .replace(/(httpServerLocation:\s*")\/assets/g, '$1./assets');
      if (out !== src) {
        writeFileSync(p, out);
        changed++;
      }
    }
  }
}
walk(dir);
console.log(`[relative-web-paths] ${changed} files updated in ${dir}`);
