import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// GitHub Pages: custom domain (e.g. jeremyb.dev) is served at /. Project URL
// https://<user>.github.io/<repo>/ needs asset base /repo/ — set GITHUB_PAGES_SUBPATH=true for that.
const repo = 'JeremyB-pydev_Portfolio';
const base =
  process.env.GITHUB_PAGES_SUBPATH === 'true' ? `/${repo}/` : '/';

export default defineConfig({
  base,
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        projectReveal: path.resolve(__dirname, 'src/project-reveal.ts'),
        siteShell: path.resolve(__dirname, 'src/site-shell.ts'),
      },
      output: {
        entryFileNames(chunkInfo) {
          if (chunkInfo.name === 'projectReveal') {
            return 'assets/project-reveal.js';
          }
          if (chunkInfo.name === 'siteShell') {
            return 'assets/site-shell.js';
          }
          return 'assets/[name]-[hash].js';
        },
      },
    },
  },
});
