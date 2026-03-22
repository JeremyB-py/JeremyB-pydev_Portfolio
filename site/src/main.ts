import './styles/base.css';
import './styles/themes.css';
import './styles/sections.css';

import { getCurrentTheme, initTheme } from './themes';
import { initScrollReveal } from './scrollReveal';
import { syncMatrixRain } from './matrixRain';
import { initConstellation, type ProjectForMap } from './constellation';

interface ProjectJson {
  id: string;
  title: string;
  summary: string;
  tech: string[];
  writeUpUrl: string;
  private: boolean;
}

async function loadProjects(): Promise<ProjectJson[]> {
  const url = `${import.meta.env.BASE_URL}projects.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load projects');
  return res.json() as Promise<ProjectJson[]>;
}

function renderProjects(projects: ProjectJson[]): void {
  const root = document.getElementById('projects-root');
  if (!root) return;

  root.innerHTML = projects
    .map(
      (p) => `
    <article class="project-card" id="project-${p.id}">
      <h3 class="project-card__title">${escapeHtml(p.title)}</h3>
      <p class="project-card__summary">${escapeHtml(p.summary)}</p>
      <div class="project-card__tags" aria-label="Technologies">
        ${p.tech.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
      </div>
      <div class="project-card__links">
        <a href="${p.writeUpUrl}" target="_blank" rel="noopener noreferrer">Read write-up</a>
        ${p.private ? '<span class="badge-private">Private repo</span>' : ''}
      </div>
    </article>
  `
    )
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
    .map(
      (p) =>
        `<li><a href="#project-${p.id}">${escapeHtml(p.title)}</a></li>`
    )
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

    const mapData: ProjectForMap[] = projects.map((p) => ({
      id: p.id,
      title: p.title,
      writeUpUrl: p.writeUpUrl,
    }));
    fillConstellationList(mapData);

    const canvas = document.getElementById('constellation-canvas') as HTMLCanvasElement | null;
    if (canvas) {
      initConstellation(canvas, mapData, (id) => {
        const el = document.getElementById(`project-${id}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
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
