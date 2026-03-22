export interface ProjectForMap {
  id: string;
  slug: string;
  title: string;
  writeUpUrl: string;
}

interface Star {
  baseAngle: number;
  orbitRx: number;
  orbitRy: number;
  project: ProjectForMap;
  r: number;
}

function galaxyPos(
  s: Star,
  cx: number,
  cy: number,
  spin: number
): { x: number; y: number } {
  const a = s.baseAngle + spin;
  return {
    x: cx + Math.cos(a) * s.orbitRx,
    y: cy + Math.sin(a) * s.orbitRy,
  };
}

export function initConstellation(
  canvas: HTMLCanvasElement,
  projects: ProjectForMap[],
  baseUrl: string
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx || projects.length === 0) return;
  const c = ctx;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let stars: Star[] = [];
  let hovered: Star | null = null;
  let nearAny = false;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let spin = 0;
  let wCss = 800;
  let hCss = 400;
  let galaxyCx = 0;
  let galaxyCy = 0;
  const hub = { x: 0, y: 0 };

  function syncSize(): void {
    const wrap = canvas.parentElement;
    const w = wrap?.clientWidth ?? 800;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    wCss = w;
    hCss = Math.max(280, Math.round(w * 0.48));
    canvas.style.width = `${wCss}px`;
    canvas.style.height = `${hCss}px`;
    canvas.width = Math.floor(wCss * dpr);
    canvas.height = Math.floor(hCss * dpr);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);

    galaxyCx = wCss * 0.5;
    galaxyCy = hCss * 0.42;
    hub.x = wCss * 0.5;
    hub.y = hCss * 0.88;

    const count = projects.length;
    stars = projects.map((project, i) => {
      const t = (i / Math.max(count, 1)) * Math.PI * 2 - Math.PI / 2 + 0.12;
      const ripple = 0.82 + (i % 4) * 0.05;
      return {
        baseAngle: t,
        orbitRx: wCss * 0.36 * ripple,
        orbitRy: hCss * 0.28 * ripple,
        project,
        r: 9,
      };
    });
  }

  function pickStar(clientX: number, clientY: number): Star | null {
    const rect = canvas.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    let best: Star | null = null;
    let bestD = Infinity;
    for (const s of stars) {
      const pos = galaxyPos(s, galaxyCx, galaxyCy, spin);
      const dx = mx - pos.x;
      const dy = my - pos.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d <= s.r + 14 && d < bestD) {
        bestD = d;
        best = s;
      }
    }
    return best;
  }

  function nearGalaxy(mx: number, my: number): boolean {
    for (const s of stars) {
      const pos = galaxyPos(s, galaxyCx, galaxyCy, spin);
      const dx = mx - pos.x;
      const dy = my - pos.y;
      if (dx * dx + dy * dy <= (s.r + 36) ** 2) return true;
    }
    return false;
  }

  function readColors(): { accent: string; text: string; muted: string } {
    const cs = getComputedStyle(document.documentElement);
    return {
      accent: cs.getPropertyValue('--color-accent').trim() || '#38bdf8',
      text: cs.getPropertyValue('--color-text').trim() || '#e8f4fc',
      muted: cs.getPropertyValue('--color-text-muted').trim() || '#94a3b8',
    };
  }

  function drawFrame(): void {
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const { accent, text, muted } = readColors();
    c.clearRect(0, 0, w, h);

    if (!reducedMotion) {
      spin += 0.0018;
    }

    const idleMode = !nearAny && !hovered;
    const lineAlpha = idleMode ? 0.08 : 0.35;
    const nodeAlpha = idleMode ? 0.22 : 1;
    const labelAlpha = hovered || nearAny ? 1 : 0.15;

    c.fillStyle = `${accent}18`;
    c.beginPath();
    c.arc(hub.x, hub.y, 14, 0, Math.PI * 2);
    c.fill();

    c.strokeStyle = muted;
    c.globalAlpha = lineAlpha;
    c.lineWidth = 1;
    stars.forEach((s) => {
      const pos = galaxyPos(s, galaxyCx, galaxyCy, spin);
      c.beginPath();
      c.moveTo(hub.x, hub.y);
      c.lineTo(pos.x, pos.y);
      c.stroke();
    });
    c.globalAlpha = 1;

    if (hovered) {
      const pos = galaxyPos(hovered, galaxyCx, galaxyCy, spin);
      c.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      c.lineWidth = 2;
      c.globalAlpha = 1;
      c.beginPath();
      c.moveTo(hub.x, hub.y);
      c.lineTo(pos.x, pos.y);
      c.stroke();
    }

    stars.forEach((s) => {
      const pos = galaxyPos(s, galaxyCx, galaxyCy, spin);
      const active = s === hovered;
      const radius = active ? s.r + 2 : idleMode ? s.r * 0.65 : s.r;
      c.globalAlpha = nodeAlpha;
      c.fillStyle = active ? accent : muted;
      c.shadowColor = active ? `${accent}aa` : 'transparent';
      c.shadowBlur = active ? 14 : 0;
      c.beginPath();
      c.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      c.fill();
      c.shadowBlur = 0;
      c.globalAlpha = labelAlpha;
      c.fillStyle = text;
      c.font = '11px system-ui, sans-serif';
      c.textAlign = 'center';
      const label =
        s.project.title.length > 26 ? `${s.project.title.slice(0, 24)}…` : s.project.title;
      c.fillText(label, pos.x, pos.y - radius - 8);
      c.globalAlpha = 1;
    });

    c.fillStyle = muted;
    c.globalAlpha = 0.85;
    c.font = '12px system-ui, sans-serif';
    c.textAlign = 'center';
    c.fillText('You are here', hub.x, hub.y + 28);
    c.globalAlpha = 1;

    if (!reducedMotion) {
      requestAnimationFrame(drawFrame);
    }
  }

  function onMove(e: MouseEvent): void {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    hovered = pickStar(e.clientX, e.clientY);
    nearAny = nearGalaxy(mx, my);
    canvas.style.cursor = hovered ? 'pointer' : 'crosshair';
    if (reducedMotion) drawFrame();
  }

  function onLeave(): void {
    hovered = null;
    nearAny = false;
    if (reducedMotion) drawFrame();
  }

  function onClick(e: MouseEvent): void {
    const s = pickStar(e.clientX, e.clientY);
    if (s) {
      const url = `${baseUrl}projects/${encodeURIComponent(s.project.slug)}/`;
      window.location.assign(url);
    }
  }

  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseleave', onLeave);
  canvas.addEventListener('click', onClick);

  const themeObs = new MutationObserver(() => {
    if (reducedMotion) drawFrame();
  });
  themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  syncSize();
  if (reducedMotion) {
    drawFrame();
  } else {
    drawFrame();
  }

  window.addEventListener('resize', () => {
    syncSize();
    if (reducedMotion) drawFrame();
  });
}
