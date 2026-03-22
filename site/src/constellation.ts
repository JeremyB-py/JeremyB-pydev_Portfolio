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
  /** Per-star twinkle phase & speed (subtle brightness pulse) */
  twinklePhase: number;
  twinkleSpeed: number;
}

/** Mid-size orbiting specks: larger than mini background stars, smaller than skill satellites */
interface MidOrbiter {
  ang: number;
  rx: number;
  ry: number;
  r: number;
  twinklePhase: number;
  twinkleSpeed: number;
  spinRate: number;
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
const SKILL_ORBIT_DIST = 81;
/** Base radius for project nodes (CSS px); ~50% larger than original. */
const NODE_R = 14;
/** Skill satellite dot radii (CSS px) when highlighted / dim. */
const SAT_R_HI = 6;
const SAT_R_LO = 4;

/** Matrix theme: monospace glyphs (size still follows orbit / highlight logic) */
const MATRIX_NODE_CHARS = ['@', '#', '*', '%', '&', 'O', '+', 'X', '8', 'H'];
const MATRIX_SAT_CHARS = ['+', '*', '.', ':', "'", '`', ',', '^', '~', '='];
const MATRIX_MID_CHARS = ['.', ',', "'", ':', ';', '`', '^', '~', '-', '|'];

/** Matrix: node & satellite glyphs ~3× prior size (“+200%”); mid orbiters ~2× (“+100%”) */
const MATRIX_NODE_SAT_GLYPH_SCALE = 3;
const MATRIX_MID_GLYPH_SCALE = 2;

/** Golden-angle hue step so neighboring projects read as distinct in any theme */
const GOLDEN_HUE = 137.508;

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface NodePaletteEntry {
  fill: string;
  fillDim: string;
  glow: string;
  /** Soft shadow for dim project nodes */
  shadowDim: string;
  /** Low-opacity stroke for hub → node lines when not hovered */
  hubLineMuted: string;
}

function withAlpha(hexOrCss: string, alpha: number): string {
  const rgb = parseCssColor(hexOrCss);
  if (!rgb) return hexOrCss;
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
}

function parseCssColor(input: string): RGB | null {
  const s = input.trim();
  if (!s) return null;
  if (s.startsWith('#')) {
    const hex = s.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
  }
  const m = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
  if (m) {
    return { r: +m[1], g: +m[2], b: +m[3] };
  }
  return null;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const l = (max + min) / 2;
  let s = 0;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }
  return { h: h * 360, s, l };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => n.toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** WCAG relative luminance (sRGB), 0–1 */
function relativeLuminance(rgb: RGB): number {
  const lin = (c: number) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  const r = lin(rgb.r);
  const g = lin(rgb.g);
  const b = lin(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function shortestHueDelta(from: number, to: number): number {
  let d = to - from;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

/**
 * One distinct color per project, anchored to --color-accent / --color-link and tuned for --color-bg.
 */
function paletteForProjectNodes(
  count: number,
  accentStr: string,
  linkStr: string,
  bgStr: string
): NodePaletteEntry[] {
  const accent = parseCssColor(accentStr);
  const link = parseCssColor(linkStr);
  const bg = parseCssColor(bgStr);
  if (!accent || !bg) {
    const fb = accentStr || '#38bdf8';
    return Array.from({ length: count }, () => ({
      fill: fb,
      fillDim: fb,
      glow: `${fb}cc`,
      shadowDim: 'rgba(148,163,184,0.45)',
      hubLineMuted: 'rgba(148,163,184,0.12)',
    }));
  }
  const aH = rgbToHsl(accent.r, accent.g, accent.b);
  const lH = link ? rgbToHsl(link.r, link.g, link.b) : aH;
  const bgIsDark = relativeLuminance(bg) < 0.4;

  const out: NodePaletteEntry[] = [];
  for (let i = 0; i < count; i++) {
    const linkPull = shortestHueDelta(aH.h, lH.h) * (0.06 + (i % 4) * 0.035);
    let h = (aH.h + i * GOLDEN_HUE + linkPull) % 360;
    if (h < 0) h += 360;

    let s = Math.min(0.92, Math.max(0.36, aH.s * (0.86 + 0.05 * (i % 5))));
    let L = aH.l;
    if (bgIsDark) {
      L = Math.min(0.82, Math.max(0.42, aH.l + 0.035 * Math.sin(i * 1.2) + (i % 3) * 0.018));
    } else {
      L = Math.max(0.26, Math.min(0.55, aH.l - 0.015 * (i % 4)));
    }

    const rgb = hslToRgb(h, s, L);
    const dimS = Math.min(0.75, s * 0.58);
    const dimL = bgIsDark ? L * 0.7 : Math.min(L * 1.05, 0.48);
    const dimRgb = hslToRgb(h, dimS, dimL);

    out.push({
      fill: rgbToHex(rgb.r, rgb.g, rgb.b),
      fillDim: rgbToHex(dimRgb.r, dimRgb.g, dimRgb.b),
      glow: `rgba(${rgb.r},${rgb.g},${rgb.b},0.82)`,
      shadowDim: `rgba(${dimRgb.r},${dimRgb.g},${dimRgb.b},0.5)`,
      hubLineMuted: `rgba(${rgb.r},${rgb.g},${rgb.b},0.13)`,
    });
  }
  return out;
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
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.65 + Math.random() * 1.15,
    });
  }
  return out;
}

/** ~1–2.8px radius: between mini dust and ~4px skill satellites */
function makeMidOrbiters(count: number, wCss: number, hCss: number): MidOrbiter[] {
  const out: MidOrbiter[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      ang: Math.random() * Math.PI * 2,
      /* Inner–mid annulus so they read between distant dust and project ring */
      rx: wCss * (0.14 + Math.random() * 0.38),
      ry: hCss * (0.12 + Math.random() * 0.36),
      r: 1.0 + Math.random() * 1.8,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.5 + Math.random() * 0.95,
      spinRate: 0.72 + Math.random() * 0.55,
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
  let midOrbiters: MidOrbiter[] = [];
  let hovered: Star | null = null;
  let skillFade = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let spin = 0;
  /** Wall-clock-ish phase for twinkle / breathe (skipped when reduced motion) */
  let animT = 0;
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
    /* 100+ more mini-stars than prior pass; still tiny specks */
    const bgCount = reducedMotion ? 180 : 280;
    bgDots = makeBgDots(bgCount, wCss, hCss);
    const midCount = reducedMotion ? 85 : 115;
    midOrbiters = makeMidOrbiters(midCount, wCss, hCss);
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

  function readColors(): {
    accent: string;
    text: string;
    muted: string;
    link: string;
    bg: string;
  } {
    const cs = getComputedStyle(document.documentElement);
    const accent = cs.getPropertyValue('--color-accent').trim() || '#38bdf8';
    return {
      accent,
      text: cs.getPropertyValue('--color-text').trim() || '#e8f4fc',
      muted: cs.getPropertyValue('--color-text-muted').trim() || '#94a3b8',
      link: cs.getPropertyValue('--color-link').trim() || accent,
      bg: cs.getPropertyValue('--color-bg').trim() || '#070b14',
    };
  }

  function drawFrame(): void {
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const colors = readColors();
    const { accent, text, muted } = colors;
    const nodePalette = paletteForProjectNodes(
      stars.length,
      colors.accent,
      colors.link,
      colors.bg
    );
    const themeAttr = document.documentElement.getAttribute('data-theme') ?? '';
    const isPaper = themeAttr === 'paper';
    const isMatrix = themeAttr === 'matrix';
    const monoFont = "ui-monospace, 'Cascadia Code', 'Fira Code', monospace";

    c.clearRect(0, 0, w, h);

    if (!reducedMotion) {
      spin += 0.0018;
      animT += 0.018;
    }

    const targetFade = hovered ? 1 : 0;
    skillFade += (targetFade - skillFade) * 0.14;
    if (Math.abs(targetFade - skillFade) < 0.004) {
      skillFade = targetFade;
    }

    const hoveredIndex = hovered ? stars.indexOf(hovered) : -1;

    // Background mini-stars (non-interactive): brighter + subtle twinkle
    const bgBaseAlpha = reducedMotion ? 0.32 : 0.48;
    for (const d of bgDots) {
      const a = d.ang + spin * (0.85 + (d.r % 1) * 0.3);
      const bx = galaxyCx + Math.cos(a) * d.rx;
      const by = galaxyCy + Math.sin(a) * d.ry;
      const twinkle = reducedMotion
        ? 1
        : 0.62 + 0.38 * Math.sin(animT * d.twinkleSpeed + d.twinklePhase);
      const rr = d.r * (reducedMotion ? 1 : 0.92 + 0.08 * twinkle);
      c.beginPath();
      c.arc(bx, by, rr, 0, Math.PI * 2);
      if (isPaper) {
        /* Ink dots: solid black, full outlines, still slightly “alive” via twinkle */
        c.globalAlpha = (0.88 + 0.12 * twinkle) * (reducedMotion ? 0.92 : 1);
        c.fillStyle = '#0a0a0a';
        c.fill();
        c.strokeStyle = '#000000';
        c.lineWidth = Math.max(1.15, rr * 0.35);
        c.stroke();
      } else {
        c.globalAlpha = bgBaseAlpha * twinkle;
        c.fillStyle = muted;
        c.fill();
      }
    }
    c.globalAlpha = 1;

    // Mid-orbit stars (larger than mini dust, smaller than skill satellites)
    const midBaseAlpha = reducedMotion ? 0.44 : 0.58;
    const midPaperMul = isPaper ? 0.95 : 1;
    midOrbiters.forEach((d, midIdx) => {
      const a = d.ang + spin * d.spinRate;
      const bx = galaxyCx + Math.cos(a) * d.rx;
      const by = galaxyCy + Math.sin(a) * d.ry;
      const twinkle = reducedMotion
        ? 1
        : 0.68 + 0.32 * Math.sin(animT * d.twinkleSpeed + d.twinklePhase);
      const rr = d.r * (reducedMotion ? 1 : 0.94 + 0.06 * twinkle);
      c.globalAlpha = midBaseAlpha * twinkle * midPaperMul;
      if (isMatrix) {
        const ch = MATRIX_MID_CHARS[midIdx % MATRIX_MID_CHARS.length];
        const fs =
          Math.max(6, Math.min(13, rr * 2.4)) * MATRIX_MID_GLYPH_SCALE;
        c.fillStyle = muted;
        c.font = `${fs}px ${monoFont}`;
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.globalAlpha = midBaseAlpha * twinkle * midPaperMul;
        c.fillText(ch, bx, by);
      } else if (isPaper) {
        c.globalAlpha = 1;
        c.fillStyle = withAlpha(muted, 0.18);
        c.beginPath();
        c.arc(bx, by, rr, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = withAlpha(muted, 0.92);
        c.lineWidth = 2.4;
        c.beginPath();
        c.arc(bx, by, rr, 0, Math.PI * 2);
        c.stroke();
      } else {
        c.fillStyle = muted;
        c.beginPath();
        c.arc(bx, by, rr, 0, Math.PI * 2);
        c.fill();
      }
    });
    c.globalAlpha = 1;

    // Hub aura — radial glow + rings (drawn behind core disk); softer “pencil” on paper
    const accentRgb = parseCssColor(accent);
    const auraMul = isPaper ? 0.78 : isMatrix ? 0.4 : 1;
    if (accentRgb) {
      const pulse = reducedMotion ? 0 : 7 * Math.sin(animT * 0.72);
      const breathe = reducedMotion ? 1 : 1 + 0.035 * Math.sin(animT * 0.48);
      const rOuter = (54 + pulse) * breathe;
      const rInner = 22 + pulse * 0.25;
      const grad = c.createRadialGradient(
        hub.x,
        hub.y,
        rInner * 0.4,
        hub.x,
        hub.y,
        rOuter
      );
      const { r: ar, g: ag, b: ab } = accentRgb;
      const ga = (x: number) => x * auraMul;
      grad.addColorStop(0, `rgba(${ar},${ag},${ab},0)`);
      grad.addColorStop(0.22, `rgba(${ar},${ag},${ab},${ga(0.14)})`);
      grad.addColorStop(0.5, `rgba(${ar},${ag},${ab},${ga(0.07)})`);
      grad.addColorStop(1, `rgba(${ar},${ag},${ab},0)`);
      c.fillStyle = grad;
      c.beginPath();
      c.arc(hub.x, hub.y, rOuter, 0, Math.PI * 2);
      c.fill();

      const ringCount = reducedMotion ? 2 : isPaper ? 3 : 4;
      for (let ring = 0; ring < ringCount; ring++) {
        const baseR = 30 + ring * 9 + (reducedMotion ? 0 : Math.sin(animT * 0.65 + ring * 1.1) * 2.5);
        const alpha = reducedMotion
          ? (0.065 + ring * 0.015) * auraMul
          : (0.07 + 0.06 * Math.sin(animT * 0.88 + ring * 0.9)) * auraMul;
        c.strokeStyle = `rgba(${ar},${ag},${ab},${alpha})`;
        c.lineWidth = reducedMotion ? 1 : isPaper ? 1.35 : 1.2 + (ring % 2) * 0.35;
        c.beginPath();
        c.arc(hub.x, hub.y, baseR, 0, Math.PI * 2);
        c.stroke();
      }

      if (!reducedMotion && !isPaper && !isMatrix) {
        const rot = animT * 0.38;
        for (let s = 0; s < 3; s++) {
          const arcR = 36 + s * 10;
          const sweep = Math.PI * 1.15;
          const a0 = rot + s * 1.05;
          const arcAlpha = 0.09 + 0.06 * Math.sin(animT * 1.1 + s * 0.7);
          c.strokeStyle = `rgba(${ar},${ag},${ab},${arcAlpha})`;
          c.lineWidth = 2;
          c.lineCap = 'round';
          c.beginPath();
          c.arc(hub.x, hub.y, arcR, a0, a0 + sweep);
          c.stroke();
        }
        c.lineCap = 'butt';
      }
    }

    // Hub — galaxy center; paper = ink; matrix = [JB.py] label (no circle)
    const hubPulse = reducedMotion ? 1 : 0.92 + 0.08 * Math.sin(animT * 0.7);
    const hubR = 21 * hubPulse;
    if (isMatrix) {
      const hubFs = Math.max(20, Math.min(34, 22 * hubPulse));
      c.fillStyle = accent;
      c.font = `${hubFs}px ${monoFont}`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.globalAlpha = 1;
      if (!reducedMotion) {
        c.shadowColor = accent;
        c.shadowBlur = 10 + 4 * Math.sin(animT * 0.65);
      }
      c.fillText('[JB.py]', hub.x, hub.y);
      c.shadowBlur = 0;
    } else if (isPaper) {
      c.fillStyle = withAlpha(accent, 0.14);
      c.beginPath();
      c.arc(hub.x, hub.y, hubR, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = withAlpha(muted, 0.88);
      c.lineWidth = 2.75;
      c.globalAlpha = 1;
      c.beginPath();
      c.arc(hub.x, hub.y, hubR, 0, Math.PI * 2);
      c.stroke();
      c.strokeStyle = withAlpha(accent, 0.72);
      c.lineWidth = 2;
      c.beginPath();
      c.arc(hub.x, hub.y, hubR - 2.5, 0, Math.PI * 2);
      c.stroke();
    } else {
      c.fillStyle = `${accent}38`;
      c.beginPath();
      c.arc(hub.x, hub.y, hubR, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = accent;
      c.lineWidth = 2;
      c.globalAlpha = reducedMotion ? 0.92 : 0.82 + 0.12 * Math.sin(animT * 0.55 + 0.3);
      c.stroke();
    }
    c.globalAlpha = 1;

    if (!isMatrix) {
      c.fillStyle = isPaper ? withAlpha(muted, 0.92) : muted;
      c.font = '14px system-ui, sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'alphabetic';
      if (!reducedMotion && !isPaper) {
        c.shadowColor = accent;
        c.shadowBlur = 6 + 5 * Math.sin(animT * 0.65);
      }
      c.fillText('Jeremy B.', hub.x, hub.y + 32);
      c.shadowBlur = 0;
    }

    // Hub → project lines (solid ink strokes on paper)
    c.lineWidth = isPaper ? 2 : 1;
    stars.forEach((s, si) => {
      const pos = galaxyPos(s, galaxyCx, galaxyCy, spin);
      const isHi = hovered === s;
      const np = nodePalette[si];
      if (isPaper) {
        c.strokeStyle = isHi ? withAlpha(np.fill, 0.96) : withAlpha(muted, 0.72);
        c.globalAlpha = 1;
      } else {
        c.strokeStyle = isHi ? 'rgba(255, 255, 255, 0.88)' : np.hubLineMuted;
        c.globalAlpha = isHi ? 0.95 : 1;
      }
      c.beginPath();
      c.moveTo(hub.x, hub.y);
      c.lineTo(pos.x, pos.y);
      c.stroke();
    });
    c.globalAlpha = 1;

    // Branch lines + skill nodes (inherit parent color)
    skillSats.forEach((sat, satIdx) => {
      const parent = stars[sat.parentIndex];
      if (!parent) return;
      const posP = galaxyPos(parent, galaxyCx, galaxyCy, spin);
      const posS = skillWorldPos(parent, sat, galaxyCx, galaxyCy, spin);
      const isParentHi = hoveredIndex === sat.parentIndex;
      const pCol = nodePalette[sat.parentIndex];
      if (isPaper) {
        c.strokeStyle = isParentHi ? withAlpha(pCol.fill, 0.94) : withAlpha(muted, 0.68);
      } else {
        c.strokeStyle = isParentHi ? pCol.fill : pCol.hubLineMuted;
      }
      c.globalAlpha = isParentHi ? 0.62 : 1;
      c.lineWidth = isPaper ? (isParentHi ? 2.1 : 1.75) : isParentHi ? 1.35 : 1;
      c.beginPath();
      c.moveTo(posP.x, posP.y);
      c.lineTo(posS.x, posS.y);
      c.stroke();
      c.globalAlpha = 1;

      const satTw =
        !isParentHi && !reducedMotion
          ? 0.88 + 0.12 * Math.sin(animT * 1.1 + sat.parentIndex * 0.9 + sat.phi)
          : 1;
      const sr =
        (isParentHi ? SAT_R_HI : SAT_R_LO) *
        (isParentHi && !reducedMotion ? 1 + 0.04 * Math.sin(animT * 0.9) : satTw);

      const matrixSatGlyphFs = isMatrix
        ? Math.max(7, Math.min(16, sr * 2)) * MATRIX_NODE_SAT_GLYPH_SCALE
        : 0;

      if (isMatrix) {
        const ch = MATRIX_SAT_CHARS[satIdx % MATRIX_SAT_CHARS.length];
        const fs = matrixSatGlyphFs;
        c.fillStyle = isParentHi ? pCol.fill : pCol.fillDim;
        c.globalAlpha = isParentHi ? 0.95 : 0.55 * satTw;
        c.font = `${fs}px ${monoFont}`;
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(ch, posS.x, posS.y);
      } else if (isPaper) {
        c.fillStyle = withAlpha(isParentHi ? pCol.fill : pCol.fillDim, isParentHi ? 0.38 : 0.26);
        c.globalAlpha = 1;
        c.beginPath();
        c.arc(posS.x, posS.y, sr, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = withAlpha(isParentHi ? pCol.fill : pCol.fillDim, isParentHi ? 0.95 : 0.82);
        c.lineWidth = 2.5;
        c.beginPath();
        c.arc(posS.x, posS.y, sr, 0, Math.PI * 2);
        c.stroke();
      } else {
        c.fillStyle = isParentHi ? pCol.fill : pCol.fillDim;
        c.globalAlpha = isParentHi ? 0.92 : 0.38 * satTw;
        c.beginPath();
        c.arc(posS.x, posS.y, sr, 0, Math.PI * 2);
        c.fill();
      }
      c.globalAlpha = 1;

      if (isParentHi && skillFade > 0.05) {
        const short =
          sat.label.length > 18 ? `${sat.label.slice(0, 16)}…` : sat.label;
        c.globalAlpha = skillFade;
        c.fillStyle = text;
        const labelLift = isMatrix ? matrixSatGlyphFs * 0.52 + 10 : 8;
        c.font = isMatrix ? `13px ${monoFont}` : '14px system-ui, sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'alphabetic';
        c.fillText(short, posS.x, posS.y - sr - labelLift);
        c.globalAlpha = 1;
      }
    });

    // Project nodes + titles (per-theme palette + soft breathe)
    stars.forEach((s, si) => {
      const pos = galaxyPos(s, galaxyCx, galaxyCy, spin);
      const isHi = hovered === s;
      const np = nodePalette[si];
      const breathe = reducedMotion
        ? 1
        : 1 + 0.045 * Math.sin(animT * 0.65 + s.baseAngle * 1.4 + si * 0.2);
      const baseR = isHi ? s.r + 3 : s.r * 0.75;
      const radius = baseR * (isHi ? 1 + (reducedMotion ? 0 : 0.03 * Math.sin(animT * 0.85)) : breathe);

      const matrixNodeGlyphFs = isMatrix
        ? Math.max(13, Math.min(26, radius * 1.2)) * MATRIX_NODE_SAT_GLYPH_SCALE
        : 0;

      if (isMatrix) {
        const ch = MATRIX_NODE_CHARS[si % MATRIX_NODE_CHARS.length];
        const fs = matrixNodeGlyphFs;
        c.fillStyle = isHi ? np.fill : np.fillDim;
        c.globalAlpha = isHi ? 1 : 0.62;
        c.font = `${fs}px ${monoFont}`;
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.shadowBlur = 0;
        c.fillText(ch, pos.x, pos.y);
        c.globalAlpha = 1;
      } else if (isPaper) {
        c.globalAlpha = 1;
        c.fillStyle = withAlpha(isHi ? np.fill : np.fillDim, isHi ? 0.34 : 0.22);
        c.shadowBlur = 0;
        c.beginPath();
        c.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = withAlpha(isHi ? np.fill : np.fillDim, isHi ? 0.96 : 0.88);
        c.lineWidth = isHi ? 3 : 2.6;
        c.beginPath();
        c.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        c.stroke();
      } else {
        c.globalAlpha = isHi ? 1 : 0.46;
        c.fillStyle = isHi ? np.fill : np.fillDim;
        c.shadowColor = isHi ? np.glow : np.shadowDim;
        c.shadowBlur = isHi ? 22 : reducedMotion ? 0 : 10;
        c.beginPath();
        c.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        c.fill();
        c.shadowBlur = 0;
      }
      c.globalAlpha = isPaper
        ? 0.88
        : isMatrix
          ? isHi
            ? 1
            : 0.52
          : isHi
            ? 1
            : 0.22;
      c.fillStyle = isPaper ? withAlpha(text, 0.94) : text;
      c.font = isMatrix ? `15px ${monoFont}` : '16px system-ui, sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'alphabetic';
      const label =
        s.project.title.length > 26 ? `${s.project.title.slice(0, 24)}…` : s.project.title;
      const labelY = isMatrix
        ? pos.y - matrixNodeGlyphFs * 0.52 - 12
        : pos.y - radius - 10;
      c.fillText(label, pos.x, labelY);
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
