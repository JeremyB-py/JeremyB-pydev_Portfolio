/** Ember theme: a few sparks drifting up from the bottom of the viewport, cooling as they rise. */
import { sprite, stamp } from './canvasSprites';

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  r: number;
  phase: number;
}

/** Hot (young) -> cool (old): white-gold, orange, deep red */
const HEAT: [number, number, number][] = [
  [255, 236, 179],
  [255, 138, 61],
  [194, 65, 12],
];

/** Spark color for a cooling fraction t in [0, 1] (also used by the Ember constellation hub). */
export function heatColor(t: number): [number, number, number] {
  const seg = t < 0.5 ? 0 : 1;
  const k = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
  const a = HEAT[seg];
  const b = HEAT[seg + 1];
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}

/** Pre-rendered spark (hot core + soft halo) per cooling step, so each spark is one drawImage. */
const HEAT_STEPS = 12;
function sparkSprite(lifeT: number): HTMLCanvasElement {
  const step = Math.min(HEAT_STEPS - 1, Math.floor(lifeT * HEAT_STEPS));
  return sprite(`spark:${step}`, 64, (g, n) => {
    const [r, gr, b] = heatColor((step + 0.5) / HEAT_STEPS).map((v) => v | 0);
    const h = n / 2;
    const grad = g.createRadialGradient(h, h, 0, h, h, h);
    grad.addColorStop(0, `rgba(${r},${gr},${b},1)`);
    grad.addColorStop(0.26, `rgba(${r},${gr},${b},0.9)`);
    grad.addColorStop(0.33, `rgba(${r},${gr},${b},0.16)`);
    grad.addColorStop(1, `rgba(${r},${gr},${b},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, n, n);
  });
}

export function startEmberSparks(canvas: HTMLCanvasElement): (() => void) | void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const c = ctx;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.width = 0;
    canvas.height = 0;
    return;
  }

  let sparks: Spark[] = [];
  let rafId: number | null = null;
  let last = performance.now();

  function spawn(s: Partial<Spark> = {}): Spark {
    return {
      x: Math.random() * canvas.width,
      y: canvas.height + 8,
      vx: (Math.random() - 0.5) * 16,
      vy: -(26 + Math.random() * 48),
      age: 0,
      life: 4 + Math.random() * 5,
      r: 0.8 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
      ...s,
    };
  }

  /* Canvas at CSS-pixel resolution: the sparks are soft glows, so DPR scaling buys nothing. */
  function resize(): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.round(Math.min(46, Math.max(18, canvas.width / 30)));
    sparks = Array.from({ length: count }, () => {
      const s = spawn();
      // Start mid-flight so the screen isn't empty on load.
      s.age = Math.random() * s.life;
      s.y = canvas.height - (-s.vy) * s.age;
      return s;
    });
  }
  resize();
  window.addEventListener('resize', resize);

  /* Sparks drift slowly, so ~30 fps is indistinguishable, and skipped frames leave the
     full-screen canvas untouched (no re-upload / recomposite of the layer). */
  const FRAME_MS = 1000 / 30 - 2;

  function draw(now: number): void {
    if (now - last < FRAME_MS) {
      rafId = requestAnimationFrame(draw);
      return;
    }
    const dt = Math.min(Math.max((now - last) / 1000, 0), 0.1);
    last = now;
    const t = now / 1000;
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.globalCompositeOperation = 'lighter';
    c.lineCap = 'round';

    for (let i = 0; i < sparks.length; i++) {
      let s = sparks[i];
      s.age += dt;
      if (s.age >= s.life || s.y < -12) {
        s = sparks[i] = spawn();
      }
      const sway = Math.sin(t * 1.3 + s.phase) * 12;
      s.x += (s.vx + sway) * dt;
      s.y += s.vy * dt;

      const lifeT = s.age / s.life;
      const fade = lifeT < 0.12 ? lifeT / 0.12 : Math.pow(1 - lifeT, 1.2);
      const flicker = 0.72 + 0.28 * Math.sin(t * 9 + s.phase * 7);
      const alpha = fade * flicker;
      const [r, g, b] = heatColor(lifeT);

      c.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},${alpha * 0.45})`;
      c.lineWidth = s.r;
      c.beginPath();
      c.moveTo(s.x, s.y);
      c.lineTo(s.x - (s.vx + sway) * 0.06, s.y - s.vy * 0.06);
      c.stroke();

      stamp(c, sparkSprite(lifeT), s.x, s.y, s.r * 6.4, alpha);
    }
    c.globalCompositeOperation = 'source-over';
    rafId = requestAnimationFrame(draw);
  }
  rafId = requestAnimationFrame(draw);

  return () => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    window.removeEventListener('resize', resize);
    c.clearRect(0, 0, canvas.width, canvas.height);
  };
}
