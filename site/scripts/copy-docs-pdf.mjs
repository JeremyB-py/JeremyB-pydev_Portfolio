/**
 * Copies the resume PDF from repo root docs/ into site/public/docs/ with a
 * stable name so Vite serves it at a predictable URL.
 *
 * docs/JeremyB_Full-Stack_Engineer_Resume.pdf → public/docs/JeremyB_Resume.pdf
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.join(__dirname, '..');
const repoRoot = path.join(siteDir, '..');
const srcDir = path.join(repoRoot, 'docs');
const destDir = path.join(siteDir, 'public', 'docs');

/** Explicit source → public filename (avoids lex-sort accidentally promoting a variant). */
const COPIES = [
  {
    src: 'JeremyB_Full-Stack_Engineer_Resume.pdf',
    dest: 'JeremyB_Resume.pdf',
  },
];

function main() {
  fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(srcDir)) {
    console.warn('copy-docs-pdf: repo docs/ not found; skip');
    return;
  }

  let copied = 0;
  for (const { src, dest } of COPIES) {
    const srcFile = path.join(srcDir, src);
    if (!fs.existsSync(srcFile)) {
      console.warn(`copy-docs-pdf: missing docs/${src}; skip`);
      continue;
    }
    const destFile = path.join(destDir, dest);
    fs.copyFileSync(srcFile, destFile);
    console.log(`copy-docs-pdf: docs/${src} -> public/docs/${dest}`);
    copied += 1;
  }

  if (copied === 0) {
    console.warn('copy-docs-pdf: no configured PDFs found in docs/; skip');
  }
}

main();
