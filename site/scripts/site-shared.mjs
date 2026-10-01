/**
 * Shared by vite.config.ts and the generator scripts so the homepage and the static
 * project pages agree on base path, theme list and header markup.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.join(__dirname, '..');

export const REPO = 'JeremyB-pydev_Portfolio';

// GitHub Pages: custom domain (e.g. jeremyb.dev) is served at /. Project URL
// https://<user>.github.io/<repo>/ needs asset base /repo/ — set GITHUB_PAGES_SUBPATH=true for that.
const useSubpath = () => process.env.GITHUB_PAGES_SUBPATH === 'true';

export function getBase() {
  return useSubpath() ? `/${REPO}/` : '/';
}

export function getSiteOrigin() {
  return useSubpath() ? `https://jeremyb-py.github.io/${REPO}` : 'https://jeremyb.dev';
}

const themeConfig = JSON.parse(fs.readFileSync(path.join(siteDir, 'src/themes.json'), 'utf8'));

export const THEME_IDS = themeConfig.themes.map((t) => t.id);
/** Retired theme ids -> replacement, so saved preferences keep working. */
export const THEME_ALIASES = themeConfig.aliases;

/** Inline <head> script: apply the saved theme before first paint (no flash). */
export function themeBootScript() {
  const ids = JSON.stringify(THEME_IDS);
  const aliases = JSON.stringify(THEME_ALIASES);
  return `<script>(function(){try{var t=localStorage.getItem('portfolio-theme');var a=${aliases};if(t&&a[t])t=a[t];if(t&&${ids}.indexOf(t)>=0)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();</script>`;
}

/** Header from partials/site-header.html; nav links point back to portfolio anchors under `base`. */
export function siteHeaderHtml(base) {
  const tpl = fs.readFileSync(path.join(siteDir, 'partials/site-header.html'), 'utf8');
  return tpl.replaceAll('%BASE%', base).trimEnd();
}
