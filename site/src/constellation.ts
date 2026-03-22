export interface ProjectForMap {
  id: string;
  title: string;
  writeUpUrl: string;
}

interface Star {
  x: number;
  y: number;
  project: ProjectForMap;
  r: number;
}

function layoutStars(width: number, height: number, count: number): { x: number; y: number }[] {
  const cx = width * 0.5;
  const cy = height * 0.38;
  const rx = width * 0.38;
  const ry = height * 0.32;
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / Math.max(count, 1)) * Math.PI * 2 - Math.PI / 2 + 0.15;
    out.push({
      x: cx + rx * Math.cos(angle) * (0.85 + (i % 3) * 0.05),
      y: cy + ry * Math.sin(angle) * (0.9 + (i % 2) * 0.06),
    });
  }
  return out;
}

export function initConstellation(
  canvas: HTMLCanvasElement,
  projects: ProjectForMap[],
  onSelect: (id: string) => void
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx || projects.length === 0) return;
  const c = ctx;

  const hub = { x: 0, y: 0 };
  let stars: Star[] = [];
  let hovered: Star | null = null;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function syncSize(): void {
    const wrap = canvas.parentElement;
    const w = wrap?.clientWidth ?? 800;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = w;
    const cssH = Math.max(260, Math.round(w * 0.45));
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);

    const positions = layoutStars(cssW, cssH, projects.length);
    hub.x = cssW * 0.5;
    hub.y = cssH * 0.88;
    stars = projects.map((project, i) => ({
      x: positions[i]?.x ?? cssW * 0.5,
      y: positions[i]?.y ?? cssH * 0.3,
      project,
      r: 10,
    }));
  }

  function pickStar(clientX: number, clientY: number): Star | null {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i];
      const dx = x - s.x;
      const dy = y - s.y;
      if (dx * dx + dy * dy <= (s.r + 8) ** 2) return s;
    }
    return null;
  }

  function readColors(): { accent: string; text: string; muted: string } {
    const cs = getComputedStyle(document.documentElement);
    return {
      accent: cs.getPropertyValue('--color-accent').trim() || '#38bdf8',
      text: cs.getPropertyValue('--color-text').trim() || '#e8f4fc',
      muted: cs.getPropertyValue('--color-text-muted').trim() || '#94a3b8',
    };
  }

  function draw(): void {
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const { accent, text, muted } = readColors();
    c.clearRect(0, 0, w, h);

    c.fillStyle = `${accent}14`;
    c.beginPath();
    c.arc(hub.x, hub.y, 14, 0, Math.PI * 2);
    c.fill();

    c.strokeStyle = `${muted}55`;
    c.lineWidth = 1;
    stars.forEach((s) => {
      c.beginPath();
      c.moveTo(hub.x, hub.y);
      c.lineTo(s.x, s.y);
      c.stroke();
    });

    if (hovered) {
      c.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(hub.x, hub.y);
      c.lineTo(hovered.x, hovered.y);
      c.stroke();
    }

    stars.forEach((s) => {
      const active = s === hovered;
      c.fillStyle = active ? accent : muted;
      c.shadowColor = active ? `${accent}99` : 'transparent';
      c.shadowBlur = active ? 12 : 0;
      c.beginPath();
      c.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      c.fill();
      c.shadowBlur = 0;

      c.fillStyle = text;
      c.font = '11px system-ui, sans-serif';
      c.textAlign = 'center';
      const label =
        s.project.title.length > 28 ? `${s.project.title.slice(0, 26)}…` : s.project.title;
      c.fillText(label, s.x, s.y - s.r - 8);
    });

    c.fillStyle = muted;
    c.font = '12px system-ui, sans-serif';
    c.textAlign = 'center';
    c.fillText('You are here', hub.x, hub.y + 28);
  }

  function onMove(e: MouseEvent): void {
    hovered = pickStar(e.clientX, e.clientY);
    canvas.style.cursor = hovered ? 'pointer' : 'crosshair';
    draw();
  }

  function onLeave(): void {
    hovered = null;
    draw();
  }

  function onClick(e: MouseEvent): void {
    const s = pickStar(e.clientX, e.clientY);
    if (s) onSelect(s.project.id);
  }

  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseleave', onLeave);
  canvas.addEventListener('click', onClick);

  const themeObs = new MutationObserver(() => draw());
  themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  syncSize();
  draw();
  window.addEventListener('resize', () => {
    syncSize();
    draw();
  });
}
