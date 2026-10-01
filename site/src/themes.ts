import themeConfig from './themes.json';

/** Must match the ids in themes.json (also read by scripts/site-shared.mjs). */
export type ThemeId = 'nebula' | 'matrix' | 'ember' | 'paper';

const STORAGE_KEY = 'portfolio-theme';

const THEMES = themeConfig.themes as { id: ThemeId; label: string }[];
/** Retired theme ids -> replacement, so saved preferences keep working. */
const THEME_ALIASES = themeConfig.aliases as Record<string, ThemeId>;

function applyTheme(theme: ThemeId): void {
  document.documentElement.setAttribute('data-theme', theme);
  // Tint the mobile browser bar to match the page background.
  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
  if (themeColor && bg) themeColor.content = bg;
  localStorage.setItem(STORAGE_KEY, theme);
  document.querySelectorAll<HTMLButtonElement>('.theme-btn').forEach((btn) => {
    btn.setAttribute('aria-pressed', btn.dataset.theme === theme ? 'true' : 'false');
  });
}

export function initTheme(): void {
  let initial: ThemeId = 'nebula';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const saved = stored ? (THEME_ALIASES[stored] ?? stored) : null;
    if (saved && THEMES.some((t) => t.id === saved)) {
      initial = saved as ThemeId;
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
