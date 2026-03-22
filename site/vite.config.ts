import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// GitHub Pages project site: https://<user>.github.io/<repo>/
const repo = 'JeremyB-pydev_Portfolio';
const base =
  process.env.GITHUB_PAGES === 'true' ? `/${repo}/` : '/';

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
