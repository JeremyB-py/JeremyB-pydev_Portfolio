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

/** Same header as index.html; nav links point back to portfolio anchors. */
function siteHeaderHtml(b) {
  return `<header class="site-header">
        <div class="container site-header__inner">
          <a class="site-logo" href="${b}#hero">JeremyB.py</a>
          <button type="button" class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="site-nav">
            Menu
          </button>
          <nav id="site-nav" class="site-nav" aria-label="Primary">
            <a href="${b}#about">About</a>
            <a href="${b}#map">Projects</a>
            <a href="${b}#skills">Skills</a>
            <a href="${b}#contact">Contact</a>
          </nav>
          <div class="site-header__actions">
            <div class="social-links" aria-label="Social and resume">
              <a
                href="mailto:JeremyB.pydev@gmail.com"
                title="Email"
                aria-label="Email JeremyB.pydev@gmail.com"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path
                    d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                  />
                </svg>
              </a>
              <a
                href="https://github.com/JeremyB-py"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
                aria-label="GitHub profile"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path
                    d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                  />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/jeremyb-pydev/"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
                aria-label="LinkedIn profile"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path
                    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                  />
                </svg>
              </a>
              <a
                id="resume-link"
                href="${b}docs/JeremyB_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                title="Resume"
                aria-label="Resume (PDF)"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path
                    d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
                  />
                </svg>
              </a>
            </div>
            <div
              class="theme-switcher"
              role="group"
              aria-label="Visual theme"
              title="Themes: deliberate UI exercise—same structure, different presentation."
            >
              <p class="theme-switcher__hint">
                Themes: deliberate UI exercise—same structure, different presentation.
              </p>
              <div class="theme-buttons" id="theme-buttons"></div>
            </div>
          </div>
        </div>
      </header>`;
}

function layoutHtml({ title, bodyHtml }) {
  const themeBoot = `<script>(function(){try{var t=localStorage.getItem('portfolio-theme');if(t&&['nebula','matrix','terminal','paper'].indexOf(t)>=0)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();</script>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${escapeAttr(title)} — case study" />
  <title>${escapeAttr(title)} | Jeremy B.</title>
  ${themeBoot}
  <link rel="stylesheet" href="${base}assets/site-shell.css" />
  <link rel="stylesheet" href="${base}assets/project.css" />
  <link rel="icon" type="image/svg+xml" href="${base}favicon.svg" />
</head>
<body>
  <canvas id="matrix-rain" aria-hidden="true"></canvas>
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
