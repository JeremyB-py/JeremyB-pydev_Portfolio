/**
 * Copies resume PDF from repo root docs/ into site/public/docs/JeremyB_Resume.pdf
 * so Vite serves it at /docs/JeremyB_Resume.pdf (stable URL even if the source file is versioned).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.join(__dirname, '..');
const repoRoot = path.join(siteDir, '..');
const srcDir = path.join(repoRoot, 'docs');
const destDir = path.join(siteDir, 'public', 'docs');
const destFile = path.join(destDir, 'JeremyB_Resume.pdf');

function main() {
  fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(srcDir)) {
    console.warn('copy-docs-pdf: repo docs/ not found; skip');
    return;
  }
  const pdfs = fs
    .readdirSync(srcDir)
    .filter((f) => f.toLowerCase().endsWith('.pdf'));
  if (pdfs.length === 0) {
    console.warn('copy-docs-pdf: no PDF in docs/; skip');
    return;
  }
  const preferred =
    pdfs.find((f) => /^JeremyB_Resume\.pdf$/i.test(f)) ?? pdfs.sort()[0];
  fs.copyFileSync(path.join(srcDir, preferred), destFile);
  console.log(`copy-docs-pdf: docs/${preferred} -> public/docs/JeremyB_Resume.pdf`);
}

main();
