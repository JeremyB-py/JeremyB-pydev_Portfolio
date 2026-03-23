# Portfolio site — maintainer operations (template)

**Tracked example.** Copy to `SITE_OPERATIONS.local.md` for a personal, gitignored copy (`SITE_OPERATIONS.local.md` is listed in `.gitignore`). Do not put secrets in either file if you commit the example.

---

## Stack (see `site/`)

Static portfolio built with **Vite** and **TypeScript**. Features:

- Single-page layout: hero, about, project constellation map, featured projects, GitHub activity chart, skills, contact
- **Per-project pages:** `prebuild` runs `scripts/build-shell-css.mjs` (concatenates `src/styles` into `public/assets/site-shell.css` for shared header/themes), `copy-docs-pdf.mjs` (copies resume PDF from repo `docs/` → `public/docs/JeremyB_Resume.pdf`), then `generate-project-pages.mjs`, which copies `media/` and emits `public/projects/<slug>/index.html` with the same shell + theme switcher as the home page (`theme` persists via `localStorage`)
- **Themes:** Nebula (default), Matrix (with optional digital rain), Terminal, Paper — persisted in `localStorage`
- Scroll-driven section reveals (respects `prefers-reduced-motion`)
- Canvas **constellation** linking to project pages

## Commands

```bash
cd site
npm install
npm run shell:css        # regenerate public/assets/site-shell.css (runs automatically before build/dev)
npm run generate:pages   # copy media + regenerate public/projects/**/index.html
npm run dev              # shell:css + copy-docs-pdf + generate:pages + Vite (base /)
npm run build            # generate:pages (prebuild) + production build to dist/
GITHUB_PAGES=true npm run build   # base /JeremyB-pydev_Portfolio/ for GitHub Pages
npm run preview          # preview production build
```

## Content

- Edit **`site/public/projects.json`** to add or change featured projects (`slug`, `sourceMarkdown`, titles, summaries, tech tags, `writeUpUrl` for “View on GitHub”).
- Markdown sources live in the repo root `projects/*.md`; images use `/media/...` after build (source files often use `../media/...`).
- **Resume:** Put your PDF in the repo root **`docs/`** folder (any `*.pdf` name is copied to `public/docs/JeremyB_Resume.pdf` on build). Header and contact link to **`docs/JeremyB_Resume.pdf`**. Markdown resumes can live in `docs/` but are gitignored via `docs/*.md` so only the PDF is required for the site.
- **GitHub “contribution graph”** on the home page uses a third-party SVG image URL (`ghchart.rshah.org`), not an official GitHub API.

## Deploy

On **every push to `main`**, the workflow runs `npm ci && npm run build` in `site/` (so **`prebuild` always runs** the page generator) and publishes `site/dist` to the **`gh-pages`** branch. You can also run it manually from **Actions → Deploy portfolio site to GitHub Pages → Run workflow**.

In the repo **Settings → Pages**, set the source to **`gh-pages`** branch, folder **`/` (root)** — **not** “GitHub Actions” unless you’ve switched to that model.

**Site URL (after Pages is enabled):** `https://jeremyb-py.github.io/JeremyB-pydev_Portfolio/`

**Project case studies:** `https://jeremyb-py.github.io/JeremyB-pydev_Portfolio/projects/<slug>/`

### If the live site looks stale

- **Assets:** Vite **content-hashes** `assets/*.js` and `*.css`, so new builds get new filenames (automatic cache busting for JS/CSS).
- **`index.html`** can be cached briefly. Try a **hard refresh** (Ctrl+Shift+R / Cmd+Shift+R) or an incognito window after a deploy finishes.
- Confirm **Actions** shows a green run for the latest commit and that **Settings → Pages** points at **`gh-pages`**.
- After changing only files **outside** this repo (or if the workflow was skipped before), push any commit to `main` or use **workflow_dispatch** to force a deploy.
