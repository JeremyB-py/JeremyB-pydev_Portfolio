/**
 * Concatenate shared styles for static project pages (no Vite hash).
 * Run before generate-project-pages / vite build.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stylesDir = path.join(__dirname, '../src/styles');
const outPath = path.join(__dirname, '../public/assets/site-shell.css');

const parts = ['base.css', 'themes.css', 'sections.css'].map((f) =>
  fs.readFileSync(path.join(stylesDir, f), 'utf8')
);
fs.writeFileSync(outPath, `/* Auto-generated: do not edit. Source: src/styles/{base,themes,sections}.css */\n${parts.join('\n')}\n`);
console.log('Wrote public/assets/site-shell.css');
