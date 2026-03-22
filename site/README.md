# Portfolio website

Static portfolio built with **Vite** and **TypeScript**. Features:

- Single-page layout: hero, about, constellation map, projects (from `public/projects.json`), skills, contact
- **Themes:** Nebula (default), Matrix (with optional digital rain), Terminal, Paper — persisted in `localStorage`
- Scroll-driven section reveals (respects `prefers-reduced-motion`)
- Canvas **constellation** linking to project cards; accessible list mirror

## Commands

```bash
npm install
npm run dev          # local dev (base /)
npm run build        # production build to dist/ (base /)
GITHUB_PAGES=true npm run build   # base /JeremyB-pydev_Portfolio/ for GitHub Pages
npm run preview      # preview production build
```

## Content

- Edit **`public/projects.json`** to add or change featured projects (titles, summaries, tech tags, write-up URLs).
- **Resume:** Header and contact link to the markdown resume on GitHub by default. To serve a PDF, add `public/resume.pdf` and update the resume `href` values in `index.html`.

## Deploy

On push to `main` (when `site/` changes), the workflow publishes `site/dist` to the **`gh-pages`** branch. In the repo **Settings → Pages**, set the source to **`gh-pages`** (root).

Site URL (after Pages is enabled): `https://<user>.github.io/JeremyB-pydev_Portfolio/`
