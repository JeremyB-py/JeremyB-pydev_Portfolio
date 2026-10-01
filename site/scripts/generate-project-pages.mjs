/**
 * Generates static HTML under site/public/projects/<slug>/index.html from repo projects/*.md
 * Run from repo: cd site && node scripts/generate-project-pages.mjs
 * Copies ../media -> public/media for deterministic asset paths.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { marked } from 'marked';
import { getBase, getSiteOrigin, siteHeaderHtml, themeBootScript } from './site-shared.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.join(__dirname, '..');
const repoRoot = path.join(siteDir, '..');
const publicDir = path.join(siteDir, 'public');

const base = getBase();
const siteOrigin = getSiteOrigin();

/** `../media/` and `../games/` (src, href, poster, or data-* such as the game player's) -> site base. */
function rewriteMediaUrls(html) {
  return html.replace(
    /(\s(?:src|href|poster|data-[\w-]+))="\.\.\/(media|games)\//g,
    (_, attr, dir) => `${attr}="${base}${dir}/`
  );
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

function layoutHtml({ title, bodyHtml, slug }) {
  const themeBoot = themeBootScript();
  const pageUrl = `${siteOrigin}${base}projects/${slug}/`;
  const desc = `${title} · case study · jeremyb.dev portfolio`;
  const ogImage = `${siteOrigin}${base}og-image.png`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#04070f" />
  <meta name="description" content="${escapeAttr(desc)}" />
  <link rel="canonical" href="${escapeAttr(pageUrl)}" />
  <meta property="og:type" content="article" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:url" content="${escapeAttr(pageUrl)}" />
  <meta property="og:title" content="${escapeAttr(title)} | Jeremy B." />
  <meta property="og:description" content="${escapeAttr(desc)}" />
  <meta property="og:image" content="${escapeAttr(ogImage)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeAttr(title)}, case study preview" />
  <!-- Open Graph: LinkedIn and others use these tags for link previews -->
  <title>${escapeAttr(title)} | Jeremy B.</title>
  ${themeBoot}
  <link rel="stylesheet" href="${base}assets/site-shell.css" />
  <link rel="stylesheet" href="${base}assets/project.css" />
  <link rel="icon" type="image/svg+xml" href="${base}favicon.svg" />
</head>
<body>
  <canvas id="theme-fx" aria-hidden="true"></canvas>
  <div class="site-wrap">
    ${siteHeaderHtml(base)}
    <main class="project-content">
      <p class="project-back-row">
        <a href="${base}">← Back to portfolio</a>
      </p>
    ${bodyHtml}
    </main>
  </div>
  <script type="module" src="${base}assets/site-shell.js"></script>
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
      slug,
    });
    fs.writeFileSync(path.join(outDir, 'index.html'), page, 'utf8');
    console.log(`Wrote projects/${slug}/index.html`);
  }
}

// Run only when executed directly (`node scripts/generate-project-pages.mjs`), not when imported.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
