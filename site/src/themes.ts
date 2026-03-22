export type ThemeId = 'nebula' | 'matrix' | 'terminal' | 'paper';

const STORAGE_KEY = 'portfolio-theme';

const THEMES: { id: ThemeId; label: string }[] = [
  { id: 'nebula', label: 'Nebula' },
  { id: 'matrix', label: 'Matrix' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'paper', label: 'Paper' },
];

function applyTheme(theme: ThemeId): void {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
  document.querySelectorAll<HTMLButtonElement>('.theme-btn').forEach((btn) => {
    btn.setAttribute('aria-pressed', btn.dataset.theme === theme ? 'true' : 'false');
  });
}

export function initTheme(): void {
  let initial: ThemeId = 'nebula';
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (saved && THEMES.some((t) => t.id === saved)) {
      initial = saved;
    }
  } catch {
    /* ignore */
  }
  applyTheme(initial);

  const container = document.getElementById('theme-buttons');
  if (!container) return;

  THEMES.forEach(({ id, label }) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-btn';
    btn.dataset.theme = id;
    btn.textContent = label;
    btn.setAttribute('aria-pressed', id === initial ? 'true' : 'false');
    btn.addEventListener('click', () => applyTheme(id));
    container.appendChild(btn);
  });

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'T') {
      e.preventDefault();
      const idx = THEMES.findIndex((t) => t.id === document.documentElement.getAttribute('data-theme'));
      const next = THEMES[(idx + 1) % THEMES.length];
      applyTheme(next.id);
    }
  });
}

export function getCurrentTheme(): ThemeId {
  const t = document.documentElement.getAttribute('data-theme') as ThemeId | null;
  return t && THEMES.some((x) => x.id === t) ? t : 'nebula';
}
