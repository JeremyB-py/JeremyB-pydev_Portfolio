import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import { getBase, siteHeaderHtml, themeBootScript } from './scripts/site-shared.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const base = getBase();

/** Fixed-name entries that the generated project pages load by URL. */
const SHELL_ENTRIES: Record<string, string> = {
  'assets/site-shell.js': 'src/site-shell.ts',
  'assets/project-reveal.js': 'src/project-reveal.ts',
};

/**
 * - Fills the `<!-- @theme-boot -->` / `<!-- @site-header -->` placeholders in index.html
 *   from the same source the project-page generator uses.
 * - Dev only: regenerates project pages / shell CSS when their sources change, and serves
 *   generated project pages with the Vite client + live TS so they behave like the build.
 */
function siteShared(): Plugin {
  return {
    name: 'site-shared',
    transformIndexHtml(html) {
      return html
        .replace(/[ \t]*<!-- @theme-boot -->/, (m) => m.replace('<!-- @theme-boot -->', themeBootScript()))
        .replace(/[ \t]*<!-- @site-header -->/, () => siteHeaderHtml(base));
    },
    configureServer(server) {
      const scripts = {
        pages: path.join(__dirname, 'scripts/generate-project-pages.mjs'),
        shellCss: path.join(__dirname, 'scripts/build-shell-css.mjs'),
      };
      const timers: Partial<Record<keyof typeof scripts, NodeJS.Timeout>> = {};
      const run = (key: keyof typeof scripts) => {
        clearTimeout(timers[key]);
        timers[key] = setTimeout(() => {
          execFile('node', [scripts[key]], { cwd: __dirname }, (err, _stdout, stderr) => {
            if (err) {
              server.config.logger.error(`[site-shared] ${path.basename(scripts[key])} failed:\n${stderr || err.message}`);
              return;
            }
            server.config.logger.info(`[site-shared] reran ${path.basename(scripts[key])}`, { timestamp: true });
            server.ws.send({ type: 'full-reload' });
          });
        }, 150);
      };

      const projectsDir = path.join(repoRoot, 'projects');
      const mediaDir = path.join(repoRoot, 'media');
      const manifest = path.join(__dirname, 'public/projects.json');
      const stylesDir = path.join(__dirname, 'src/styles');
      const partialsDir = path.join(__dirname, 'partials');
      const themesJson = path.join(__dirname, 'src/themes.json');
      server.watcher.add([projectsDir, mediaDir, partialsDir]);

      const onFsEvent = (file: string) => {
        const f = path.resolve(file);
        if (f.startsWith(stylesDir + path.sep) && f.endsWith('.css')) run('shellCss');
        else if (
          (f.startsWith(projectsDir + path.sep) && f.endsWith('.md')) ||
          f.startsWith(mediaDir + path.sep) ||
          f.startsWith(partialsDir + path.sep) ||
          f === manifest ||
          f === themesJson
        ) {
          run('pages');
        }
      };
      server.watcher.on('change', onFsEvent);
      server.watcher.on('add', onFsEvent);
      server.watcher.on('unlink', onFsEvent);

      // Runs before Vite's own middlewares, so req.url still carries `base`.
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        if (!url.startsWith(base)) return next();
        const rel = url.slice(base.length);

        const entry = SHELL_ENTRIES[rel];
        if (entry) {
          req.url = `${base}${entry}`;
          return next();
        }

        const page = /^projects\/[\w-]+\/(index\.html)?$/.test(rel)
          ? path.join(__dirname, 'public', rel.endsWith('/') ? `${rel}index.html` : rel)
          : null;
        if (page && fs.existsSync(page)) {
          try {
            const html = await server.transformIndexHtml(url, fs.readFileSync(page, 'utf8'));
            res.setHeader('Content-Type', 'text/html');
            res.end(html);
          } catch (e) {
            next(e);
          }
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  base,
  publicDir: 'public',
  plugins: [siteShared()],
  server: {
    watch: {
      /* Static or generated files never need HMR: generated pages are reloaded by the site-shared
         plugin after it regenerates them. Keeps the inotify watch count small (ENOSPC when the
         system limit is shared with an editor). public/projects.json stays watched. */
      ignored: [
        '**/public/games/**',
        '**/public/media/**',
        '**/public/docs/**',
        '**/public/fonts/**',
        '**/public/images/**',
        '**/public/projects/**',
        '**/dist/**',
      ],
    },
  },
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
