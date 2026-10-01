/**
 * Post-build for the static project pages, which load fixed-name assets that Vite does not hash:
 * minify the dist copies of the CSS, then append `?v=<content hash>` to each asset URL in
 * dist/projects/<slug>/index.html so browsers pick up changes immediately.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';
import { getBase } from './site-shared.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '../dist');
const assetsDir = path.join(distDir, 'assets');
const base = getBase();

const MINIFY_CSS = ['site-shell.css', 'project.css'];
const STAMPED = ['site-shell.css', 'project.css', 'site-shell.js', 'project-reveal.js'];

for (const name of MINIFY_CSS) {
  const file = path.join(assetsDir, name);
  const { code } = await transform(fs.readFileSync(file, 'utf8'), { loader: 'css', minify: true });
  fs.writeFileSync(file, code);
}

const versions = Object.fromEntries(
  STAMPED.map((name) => {
    const hash = crypto.createHash('sha256').update(fs.readFileSync(path.join(assetsDir, name))).digest('hex');
    return [name, hash.slice(0, 8)];
  })
);

const projectsDir = path.join(distDir, 'projects');
let pages = 0;
for (const slug of fs.readdirSync(projectsDir)) {
  const page = path.join(projectsDir, slug, 'index.html');
  if (!fs.existsSync(page)) continue;
  let html = fs.readFileSync(page, 'utf8');
  for (const [name, v] of Object.entries(versions)) {
    html = html.replaceAll(`"${base}assets/${name}"`, `"${base}assets/${name}?v=${v}"`);
  }
  fs.writeFileSync(page, html);
  pages++;
}
console.log(`Minified ${MINIFY_CSS.join(', ')}; stamped ${STAMPED.length} assets in ${pages} project pages`);
