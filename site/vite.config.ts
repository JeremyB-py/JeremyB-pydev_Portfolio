import { defineConfig } from 'vite';

// GitHub Pages project site: https://<user>.github.io/<repo>/
const repo = 'JeremyB-pydev_Portfolio';
const base =
  process.env.GITHUB_PAGES === 'true' ? `/${repo}/` : '/';

export default defineConfig({
  base,
  publicDir: 'public',
});
