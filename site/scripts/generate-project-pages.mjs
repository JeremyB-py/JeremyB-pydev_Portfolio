/**
 * Generates static HTML under site/public/projects/<slug>/index.html from repo projects/*.md
 * Run from repo: cd site && node scripts/generate-project-pages.mjs
 * Copies ../media -> public/media for deterministic asset paths.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.join(__dirname, '..');
const repoRoot = path.join(siteDir, '..');
const publicDir = path.join(siteDir, 'public');

const base =
  process.env.GITHUB_PAGES === 'true' ? '/JeremyB-pydev_Portfolio/' : '/';

function rewriteMediaUrls(html) {
  let out = html;
  out = out.replace(/src="\.\.\/media\//g, `src="${base}media/`);
  out = out.replace(/href="\.\.\/media\//g, `href="${base}media/`);
  return out;
}

/** Split marked HTML on `<h2` boundaries; each block becomes a scroll-reveal section. */
function wrapMarkdownSections(html) {
  const trimmed = html.trim();
  if (!trimmed) return '';
  const chunks = trimmed.split(/(?=<h2\b)/i);
  return chunks
    .map((c) => c.trim())
    .filter(Boolean)
    .map((chunk) => `<section class="section">\n${chunk}\n</section>`)
    .join('\n');
}

function layoutHtml({ title, bodyHtml, githubUrl }) {
  const gh = githubUrl
    ? `<a href="${escapeAttr(githubUrl)}" target="_blank" rel="noopener noreferrer">View on GitHub</a>`
    : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${escapeAttr(title)} — case study" />
  <title>${escapeAttr(title)} | Jeremy B.</title>
  <link rel="stylesheet" href="${base}assets/project.css" />
  <link rel="icon" type="image/svg+xml" href="${base}favicon.svg" />
</head>
<body>
  <header class="project-page-header">
    <a href="${base}">← Back to portfolio</a>
    ${gh}
  </header>
  <main class="project-content">
    ${bodyHtml}
  </main>
  <script type="module" src="${base}assets/project-reveal.js"></script>
</body>
</html>
`;
}

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function main() {
  const manifestPath = path.join(publicDir, 'projects.json');
  const raw = fs.readFileSync(manifestPath, 'utf8');
  const projects = JSON.parse(raw);

  const mediaSrc = path.join(repoRoot, 'media');
  const mediaDest = path.join(publicDir, 'media');
  if (fs.existsSync(mediaSrc)) {
    fs.rmSync(mediaDest, { recursive: true, force: true });
    fs.cpSync(mediaSrc, mediaDest, { recursive: true });
    console.log('Copied media/ -> public/media/');
  } else {
    console.warn('WARN: repo media/ not found; skipping copy');
  }

  marked.setOptions({ gfm: true, breaks: false });

  for (const p of projects) {
    const slug = p.slug ?? p.id;
    const sourceMd = p.sourceMarkdown;
    if (!sourceMd) {
      console.warn(`skip ${slug}: no sourceMarkdown`);
      continue;
    }
    const mdPath = path.join(repoRoot, sourceMd);
    if (!fs.existsSync(mdPath)) {
      console.warn(`skip ${slug}: missing ${mdPath}`);
      continue;
    }
    const md = fs.readFileSync(mdPath, 'utf8');
    let html = marked.parse(md);
    html = rewriteMediaUrls(html);
    html = wrapMarkdownSections(html);

    const outDir = path.join(publicDir, 'projects', slug);
    fs.mkdirSync(outDir, { recursive: true });
    const page = layoutHtml({
      title: p.title,
      bodyHtml: html,
      githubUrl: p.writeUpUrl,
    });
    fs.writeFileSync(path.join(outDir, 'index.html'), page, 'utf8');
    console.log(`Wrote projects/${slug}/index.html`);
  }
}

try {
  main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
