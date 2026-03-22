# Portfolio website

Static portfolio built with **Vite** and **TypeScript**. Features:

- Single-page layout: hero, about, constellation map, projects (from `public/projects.json`), skills, contact
- **Per-project pages:** `npm run build` runs `prebuild`, which copies repo `media/` into `public/media/` and generates static case-study HTML at `public/projects/<slug>/index.html` from markdown paths in `projects.json` (see `scripts/generate-project-pages.mjs`)
- **Themes:** Nebula (default), Matrix (with optional digital rain), Terminal, Paper — persisted in `localStorage`
- Scroll-driven section reveals (respects `prefers-reduced-motion`)
- Canvas **constellation** (rotating “galaxy” + hover reveal) linking to project pages; accessible list mirror

## Commands

```bash
npm install
npm run generate:pages   # copy media + regenerate public/projects/**/index.html (runs automatically before build)
npm run dev              # runs generate:pages, then Vite (base /)
npm run build            # generate:pages (prebuild) + production build to dist/
GITHUB_PAGES=true npm run build   # base /JeremyB-pydev_Portfolio/ for GitHub Pages
npm run preview          # preview production build
```

## Content

- Edit **`public/projects.json`** to add or change featured projects (`slug`, `sourceMarkdown`, titles, summaries, tech tags, `writeUpUrl` for “View on GitHub”).
- Markdown sources live in the repo root `projects/*.md`; images use `/media/...` after build (source files often use `../media/...`).
- **Resume:** Header and contact link to the markdown resume on GitHub by default. To serve a PDF, add `public/resume.pdf` and update the resume `href` values in `index.html`.

## Deploy

On **every push to `main`**, the workflow runs `npm ci && npm run build` in `site/` (so **`prebuild` always runs** the page generator) and publishes `site/dist` to the **`gh-pages`** branch. You can also run it manually from **Actions → Deploy portfolio site to GitHub Pages → Run workflow**.

In the repo **Settings → Pages**, set the source to **`gh-pages`** branch, folder **`/` (root)** — **not** “GitHub Actions” unless you’ve switched to that model.

Site URL (after Pages is enabled): `https://<user>.github.io/JeremyB-pydev_Portfolio/`

Project case studies: `https://<user>.github.io/JeremyB-pydev_Portfolio/projects/<slug>/`

### If the live site looks stale

- **Assets:** Vite already **content-hashes** `assets/*.js` and `*.css`, so new builds get new filenames (automatic cache busting for JS/CSS).
- **`index.html`** can be cached by the browser or CDN for a short time. Try a **hard refresh** (Ctrl+Shift+R / Cmd+Shift+R) or an incognito window after a deploy finishes.
- Confirm **Actions** shows a green run for the latest commit and that **Settings → Pages** points at **`gh-pages`**.
- After changing only files **outside** this repo (or if the workflow was skipped before), push any commit to `main` or use **workflow_dispatch** to force a deploy.
