export interface ProjectForMap {
  id: string;
  slug: string;
  title: string;
  writeUpUrl: string;
  tech: string[];
}

interface Star {
  baseAngle: number;
  orbitRx: number;
  orbitRy: number;
  project: ProjectForMap;
  r: number;
}

interface BgDot {
  ang: number;
  rx: number;
  ry: number;
  r: number;
}

interface SkillSat {
  parentIndex: number;
  label: string;
  dist: number;
  /** Angle (rad) in parent-local frame: radial u and tangent v from galaxy center */
  phi: number;
}

const MAX_SKILLS = 5;
/** Same orbit radius for all skill dots around a project node (clock-like spread). */
const SKILL_ORBIT_DIST = 54;
/** Base radius for project nodes (CSS px); ~50% larger than original. */
const NODE_R = 14;
/** Skill satellite dot radii (CSS px) when highlighted / dim. */
const SAT_R_HI = 6;
const SAT_R_LO = 4;

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

function skillWorldPos(
  parent: Star,
  sat: SkillSat,
  cx: number,
  cy: number,
  spin: number
): { x: number; y: number } {
  const posP = galaxyPos(parent, cx, cy, spin);
  const dx = posP.x - cx;
  const dy = posP.y - cy;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const vx = -uy;
  const vy = ux;
  const phi = sat.phi;
  const ox = Math.cos(phi) * ux + Math.sin(phi) * vx;
  const oy = Math.cos(phi) * uy + Math.sin(phi) * vy;
  return {
    x: posP.x + sat.dist * ox,
    y: posP.y + sat.dist * oy,
  };
}

function buildSkillSats(stars: Star[]): SkillSat[] {
  const out: SkillSat[] = [];
  stars.forEach((s, si) => {
    const tech = s.project.tech.slice(0, MAX_SKILLS);
    const n = tech.length;
    // Rotate the whole clock pattern per project so adjacent projects don't align
    const basePhase = si * 0.713 + 0.35;
    tech.forEach((label, k) => {
      const phi =
        n <= 1 ? basePhase : basePhase + (2 * Math.PI * k) / n;
      out.push({
        parentIndex: si,
        label,
        dist: SKILL_ORBIT_DIST,
        phi,
      });
    });
  });
  return out;
}

function makeBgDots(count: number, wCss: number, hCss: number): BgDot[] {
  const out: BgDot[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      ang: Math.random() * Math.PI * 2,
      rx: wCss * (0.22 + Math.random() * 0.48),
      ry: hCss * (0.16 + Math.random() * 0.42),
      /** Smaller specks; extra dozens read as distant stars */
      r: 0.22 + Math.random() * 0.55,
    });
  }
  return out;
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
  let skillSats: SkillSat[] = [];
  let bgDots: BgDot[] = [];
  let hovered: Star | null = null;
  let skillFade = 0;
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
    /* ~20% shorter than prior full-width map */
    hCss = Math.max(448, Math.round(w * 0.768));
    canvas.style.width = `${wCss}px`;
    canvas.style.height = `${hCss}px`;
    canvas.width = Math.floor(wCss * dpr);
    canvas.height = Math.floor(hCss * dpr);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);

    galaxyCx = wCss * 0.5;
    galaxyCy = hCss * 0.48;
    hub.x = galaxyCx;
    hub.y = galaxyCy;

    const count = projects.length;
    stars = projects.map((project, i) => {
      const t = (i / Math.max(count, 1)) * Math.PI * 2 - Math.PI / 2 + 0.12;
      const ripple = 0.82 + (i % 4) * 0.05;
      return {
        baseAngle: t,
        orbitRx: wCss * 0.36 * ripple,
        orbitRy: hCss * 0.28 * ripple,
        project,
        r: NODE_R,
      };
    });
    skillSats = buildSkillSats(stars);
    /* Extra small orbiting stars (dozens more than original) */
    const bgCount = reducedMotion ? 72 : 152;
    bgDots = makeBgDots(bgCount, wCss, hCss);
  }

  function pickStar(clientX: number, clientY: number): Star | null {
    const rect = canvas.getBoundingClientRect();
    let best: Star | null = null;
    let bestD = Infinity;
    for (const s of stars) {
      const pos = galaxyPos(s, galaxyCx, galaxyCy, spin);
      const dx = clientX - rect.left - pos.x;
      const dy = clientY - rect.top - pos.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d <= s.r + 22 && d < bestD) {
        bestD = d;
        best = s;
      }
    }
    return best;
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

    const targetFade = hovered ? 1 : 0;
    skillFade += (targetFade - skillFade) * 0.14;
    if (Math.abs(targetFade - skillFade) < 0.004) {
      skillFade = targetFade;
    }

    const hoveredIndex = hovered ? stars.indexOf(hovered) : -1;

    // Background galaxy dust (non-interactive)
    c.globalAlpha = reducedMotion ? 0.2 : 0.35;
    for (const d of bgDots) {
      const a = d.ang + spin * (0.85 + (d.r % 1) * 0.3);
      const bx = galaxyCx + Math.cos(a) * d.rx;
      const by = galaxyCy + Math.sin(a) * d.ry;
      c.fillStyle = muted;
      c.beginPath();
      c.arc(bx, by, d.r, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;

    // Hub — galaxy center
    c.fillStyle = `${accent}28`;
    c.beginPath();
    c.arc(hub.x, hub.y, 21, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = accent;
    c.lineWidth = 2;
    c.globalAlpha = 0.9;
    c.stroke();
    c.globalAlpha = 1;

    c.fillStyle = muted;
    c.font = '14px system-ui, sans-serif';
    c.textAlign = 'center';
    c.fillText('Jeremy B.', hub.x, hub.y + 32);

    // Hub → project lines (only hovered project bright)
    c.lineWidth = 1;
    stars.forEach((s) => {
      const pos = galaxyPos(s, galaxyCx, galaxyCy, spin);
      const isHi = hovered === s;
      c.strokeStyle = isHi ? 'rgba(255, 255, 255, 0.85)' : muted;
      c.globalAlpha = isHi ? 0.95 : 0.1;
      c.beginPath();
      c.moveTo(hub.x, hub.y);
      c.lineTo(pos.x, pos.y);
      c.stroke();
    });
    c.globalAlpha = 1;

    // Branch lines + skill nodes
    skillSats.forEach((sat) => {
      const parent = stars[sat.parentIndex];
      if (!parent) return;
      const posP = galaxyPos(parent, galaxyCx, galaxyCy, spin);
      const posS = skillWorldPos(parent, sat, galaxyCx, galaxyCy, spin);
      const isParentHi = hoveredIndex === sat.parentIndex;
      c.strokeStyle = isParentHi ? accent : muted;
      c.globalAlpha = isParentHi ? 0.55 : 0.07;
      c.lineWidth = isParentHi ? 1.25 : 1;
      c.beginPath();
      c.moveTo(posP.x, posP.y);
      c.lineTo(posS.x, posS.y);
      c.stroke();
      c.globalAlpha = 1;

      const sr = isParentHi ? SAT_R_HI : SAT_R_LO;
      c.fillStyle = isParentHi ? accent : muted;
      c.globalAlpha = isParentHi ? 0.85 : 0.2;
      c.beginPath();
      c.arc(posS.x, posS.y, sr, 0, Math.PI * 2);
      c.fill();
      c.globalAlpha = 1;

      if (isParentHi && skillFade > 0.05) {
        const short =
          sat.label.length > 18 ? `${sat.label.slice(0, 16)}…` : sat.label;
        c.globalAlpha = skillFade;
        c.fillStyle = text;
        c.font = '14px system-ui, sans-serif';
        c.textAlign = 'center';
        c.fillText(short, posS.x, posS.y - sr - 8);
        c.globalAlpha = 1;
      }
    });

    // Project nodes + titles
    stars.forEach((s) => {
      const pos = galaxyPos(s, galaxyCx, galaxyCy, spin);
      const isHi = hovered === s;
      const radius = isHi ? s.r + 3 : s.r * 0.75;
      c.globalAlpha = isHi ? 1 : 0.28;
      c.fillStyle = isHi ? accent : muted;
      c.shadowColor = isHi ? `${accent}aa` : 'transparent';
      c.shadowBlur = isHi ? 20 : 0;
      c.beginPath();
      c.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      c.fill();
      c.shadowBlur = 0;
      c.globalAlpha = isHi ? 1 : 0.22;
      c.fillStyle = text;
      c.font = '16px system-ui, sans-serif';
      c.textAlign = 'center';
      const label =
        s.project.title.length > 26 ? `${s.project.title.slice(0, 24)}…` : s.project.title;
      c.fillText(label, pos.x, pos.y - radius - 10);
      c.globalAlpha = 1;
    });

    if (!reducedMotion) {
      requestAnimationFrame(drawFrame);
    }
  }

  function onMove(e: MouseEvent): void {
    hovered = pickStar(e.clientX, e.clientY);
    canvas.style.cursor = hovered ? 'pointer' : 'crosshair';
    if (reducedMotion) drawFrame();
  }

  function onLeave(): void {
    hovered = null;
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
  drawFrame();

  window.addEventListener('resize', () => {
    syncSize();
    if (reducedMotion) drawFrame();
  });
}
