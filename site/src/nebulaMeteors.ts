/**
 * Nebula theme: an occasional shooting star. Each one gets a random gap (18-26 s), spawn point,
 * direction, length, thickness and brightness, scaled to the viewport and kept on screen.
 * Idle between meteors (a timer, no animation frames).
 */

const GAP_MS: [number, number] = [18_000, 26_000];
/** First one comes a little sooner so visitors get a chance to see it. */
const FIRST_MS: [number, number] = [6_000, 12_000];

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export function startNebulaMeteors(canvas: HTMLCanvasElement): (() => void) | void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const c = ctx;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.width = 0;
    canvas.height = 0;
    return;
  }

  let timer: number | undefined;
  let rafId: number | null = null;

  /* The canvas is only full-size while a meteor is flying; between meteors it is 0x0, so the
     idle full-screen layer costs nothing to composite. */
  function sizeCanvas(on: boolean): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = on ? Math.floor(window.innerWidth * dpr) : 0;
    canvas.height = on ? Math.floor(window.innerHeight * dpr) : 0;
    if (on) c.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeCanvas(false);

  function schedule([min, max]: [number, number]): void {
    timer = window.setTimeout(launch, rand(min, max));
  }

  function launch(): void {
    sizeCanvas(true);
    const w = window.innerWidth;
    const h = window.innerHeight;
    /* Everything scales with the shorter side so phones and wide monitors both get a visible streak */
    const scale = Math.min(w, h);

    // Spawn anywhere in the upper ~55% of the screen, away from the side edges.
    const x0 = rand(0.08, 0.92) * w;
    const y0 = rand(0.05, 0.55) * h;
    // Head toward the wider side of the screen, 10-40 degrees below horizontal.
    const dirX = x0 < w / 2 ? 1 : -1;
    const ang = (rand(10, 40) * Math.PI) / 180;
    const dx = Math.cos(ang) * dirX;
    const dy = Math.sin(ang);
    // Travel distance: random, but capped so the head never leaves the viewport.
    const toEdgeX = dirX > 0 ? (w - x0) / dx : -x0 / dx;
    const toEdgeY = (h - y0) / dy;
    const travel = Math.min(rand(0.3, 0.6) * scale, toEdgeX * 0.92, toEdgeY * 0.92);
    const tail = rand(0.12, 0.24) * scale;
    const size = Math.min(1.4, Math.max(0.8, scale / 800));
    const width = rand(0.9, 2) * size;
    const peak = rand(0.5, 1);
    const duration = rand(700, 1300) * Math.max(0.7, travel / (0.45 * scale));

    const t0 = performance.now();
    const frame = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      c.clearRect(0, 0, w, h);
      if (p >= 1) {
        rafId = null;
        sizeCanvas(false);
        schedule(GAP_MS);
        return;
      }
      const eased = 1 - Math.pow(1 - p, 1.3);
      const hx = x0 + dx * travel * eased;
      const hy = y0 + dy * travel * eased;
      const len = tail * Math.min(1, p * 3); // tail grows in, then trails the head
      const tx = hx - dx * len;
      const ty = hy - dy * len;
      const alpha = peak * (p < 0.15 ? p / 0.15 : p > 0.7 ? (1 - p) / 0.3 : 1);

      const g = c.createLinearGradient(tx, ty, hx, hy);
      g.addColorStop(0, 'rgba(186, 230, 253, 0)');
      g.addColorStop(0.7, `rgba(196, 181, 253, ${alpha * 0.35})`);
      g.addColorStop(1, `rgba(240, 249, 255, ${alpha})`);
      c.strokeStyle = g;
      c.lineWidth = width;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(tx, ty);
      c.lineTo(hx, hy);
      c.stroke();

      const glow = c.createRadialGradient(hx, hy, 0, hx, hy, width * 4);
      glow.addColorStop(0, `rgba(240, 249, 255, ${alpha * 0.9})`);
      glow.addColorStop(1, 'rgba(186, 230, 253, 0)');
      c.fillStyle = glow;
      c.beginPath();
      c.arc(hx, hy, width * 4, 0, Math.PI * 2);
      c.fill();

      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);
  }

  schedule(FIRST_MS);

  return () => {
    window.clearTimeout(timer);
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    c.clearRect(0, 0, canvas.width, canvas.height);
  };
}
