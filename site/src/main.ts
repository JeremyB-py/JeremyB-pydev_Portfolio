import './styles/base.css';
import './styles/themes.css';
import './styles/sections.css';

import { getCurrentTheme, initTheme } from './themes';
import { initScrollReveal } from './scrollReveal';
import { syncMatrixRain } from './matrixRain';
import { initConstellation, type ProjectForMap } from './constellation';

interface ProjectJson {
  id: string;
  slug: string;
  title: string;
  summary: string;
  tech: string[];
  writeUpUrl: string;
  private: boolean;
}

function projectPageHref(slug: string): string {
  const s = slug.replace(/[^a-zA-Z0-9_-]/g, '') || 'project';
  return `${import.meta.env.BASE_URL}projects/${s}/`;
}

async function loadProjects(): Promise<ProjectJson[]> {
  const url = `${import.meta.env.BASE_URL}projects.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load projects');
  return res.json() as Promise<ProjectJson[]>;
}

/**
 * Allow only http(s) URLs for navigational links. Blocks javascript:, data:, vbscript:, etc.
 */
function sanitizeHttpUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  try {
    const u = new URL(t);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.href;
  } catch {
    return null;
  }
}

/**
 * Restrict DOM id / hash fragment segments to safe characters (prevents attribute-breakout in templates).
 */
function safeProjectDomId(id: string, fallbackIndex: number): string {
  const cleaned = id.replace(/[^a-zA-Z0-9_-]/g, '');
  return cleaned || `project-${fallbackIndex}`;
}

function renderProjects(projects: ProjectJson[]): void {
  const root = document.getElementById('projects-root');
  if (!root) return;

  root.innerHTML = projects
    .map((p, index) => {
      const domId = safeProjectDomId(p.id, index);
      const slug = (p.slug ?? p.id).replace(/[^a-zA-Z0-9_-]/g, '') || `project-${index}`;
      const pageHref = projectPageHref(slug);
      const writeUp = sanitizeHttpUrl(p.writeUpUrl);
      const viewProject = `<a class="project-card__primary" href="${escapeHtml(pageHref)}">View project</a>`;
      const writeUpLink = writeUp
        ? `<a href="${escapeHtml(writeUp)}" target="_blank" rel="noopener noreferrer">View on GitHub</a>`
        : `<span class="project-card__invalid-url" title="Invalid or disallowed write-up URL (only http and https links allowed)">Write-up unavailable</span>`;
      return `
    <article class="project-card" id="project-${escapeHtml(domId)}">
      <h3 class="project-card__title">${escapeHtml(p.title)}</h3>
      <p class="project-card__summary">${escapeHtml(p.summary)}</p>
      <div class="project-card__tags" aria-label="Technologies">
        ${p.tech.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
      </div>
      <div class="project-card__links">
        ${viewProject}
        ${writeUpLink}
        ${p.private ? '<span class="badge-private">Private repo</span>' : ''}
      </div>
    </article>
  `;
    })
    .join('');
}

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function fillConstellationList(projects: ProjectForMap[]): void {
  const ul = document.getElementById('constellation-list');
  if (!ul) return;
  ul.innerHTML = projects
    .map((p) => {
      const href = projectPageHref(p.slug);
      return `<li><a href="${escapeHtml(href)}">${escapeHtml(p.title)}</a></li>`;
    })
    .join('');
}

function initNav(): void {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function observeThemeForMatrix(): void {
  syncMatrixRain(getCurrentTheme());
  const obs = new MutationObserver(() => syncMatrixRain(getCurrentTheme()));
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}

async function main(): Promise<void> {
  document.getElementById('year')!.textContent = String(new Date().getFullYear());

  initTheme();
  observeThemeForMatrix();
  initScrollReveal();
  initNav();

  try {
    const projects = await loadProjects();
    renderProjects(projects);

    const mapData: ProjectForMap[] = projects.map((p, index) => ({
      id: safeProjectDomId(p.id, index),
      slug: (p.slug ?? p.id).replace(/[^a-zA-Z0-9_-]/g, '') || `project-${index}`,
      title: p.title,
      writeUpUrl: sanitizeHttpUrl(p.writeUpUrl) ?? '',
      tech: Array.isArray(p.tech) ? p.tech : [],
    }));
    fillConstellationList(mapData);

    const canvas = document.getElementById('constellation-canvas') as HTMLCanvasElement | null;
    if (canvas) {
      initConstellation(canvas, mapData, import.meta.env.BASE_URL);
    }
  } catch (e) {
    console.error(e);
    const root = document.getElementById('projects-root');
    if (root) {
      root.innerHTML = `<p class="section__lead">Could not load projects. Open the console for details.</p>`;
    }
  }
}

void main();
