// node build.mjs <repoDir> [base]
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const require = createRequire('/home/claude/mm/tools/');
const { minify } = require('terser'); const csso = require('csso');
const SRC = path.dirname(new URL(import.meta.url).pathname);
const OUT = process.argv[2]; const BASE = process.argv[3] || '/FWTIADOU/';
const css = csso.minify(fs.readFileSync(SRC + '/style.css', 'utf8')).css;
const js = (await minify(fs.readFileSync(SRC + '/site.js', 'utf8'))).code;
const hjs = (await minify(fs.readFileSync(SRC + '/headjs.js', 'utf8'))).code;
fs.writeFileSync(SRC + '/inline.mjs', `export const CSS=${JSON.stringify(css)};\nexport const JS=${JSON.stringify(js)};\nexport const HEADJS=${JSON.stringify(hjs)};\n`);
fs.mkdirSync(OUT + '/assets/js', { recursive: true });
for (const f of ['render.mjs', 'logo.mjs', 'inline.mjs']) fs.copyFileSync(SRC + '/' + f, OUT + '/assets/js/' + f);
const { render, routes, sitemap } = await import(SRC + '/render.mjs?' + Date.now());
const state = JSON.parse(fs.readFileSync(OUT + '/content.json', 'utf8'));
// remove old built pages (only folders we own)
for (const dir of ['en', 'me', 'synedries', 'blog', 'aporrito']) fs.rmSync(OUT + '/' + dir, { recursive: true, force: true });
let n = 0;
for (const r of routes(state)) {
  const html = render(state, r, { base: BASE });
  const dir = OUT + '/' + r.path; fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(dir + 'index.html', html); n++;
}
const dom = state.settings.domain;
fs.writeFileSync(OUT + '/robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin/\n${dom ? `Sitemap: https://${dom}/sitemap.xml\n` : ''}`);
if (dom) fs.writeFileSync(OUT + '/sitemap.xml', sitemap(state, dom));
console.log('pages', n, 'css', css.length, 'js', js.length, 'home', fs.statSync(OUT + '/index.html').size);
