/**
 * Shared bootstrap for generated project case-study pages: theme persistence,
 * matrix rain sync, mobile nav (same behavior as main site).
 */
import { getCurrentTheme, initTheme } from './themes';
import { syncMatrixRain } from './matrixRain';

function syncThemeEffects(): void {
  syncMatrixRain(getCurrentTheme());
}

initTheme();
syncThemeEffects();

const themeObs = new MutationObserver(() => syncThemeEffects());
themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

const toggle = document.getElementById('nav-toggle');
const nav = document.getElementById('site-nav');
if (toggle && nav) {
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
