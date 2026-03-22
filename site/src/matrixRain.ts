let rafId: number | null = null;
let active = false;

const chars = 'ｱｲｳｴｵｶｷｸｹｺ0123456789ABCDEF';

export function startMatrixRain(canvas: HTMLCanvasElement): (() => void) | void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const c = ctx;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    canvas.width = 0;
    canvas.height = 0;
    return;
  }

  const fontSize = 14;
  let drops: number[] = [];

  function resize(): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const columns = Math.ceil(canvas.width / fontSize) || 1;
    drops = new Array(columns).fill(0);
  }
  resize();
  window.addEventListener('resize', resize);

  function draw(): void {
    if (!active) return;
    c.fillStyle = 'rgba(0, 0, 0, 0.05)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = '#0f0';
    c.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      c.fillText(char, x, y);
      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i] += 1;
    }
    rafId = requestAnimationFrame(draw);
  }

  active = true;
  draw();

  return () => {
    active = false;
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    window.removeEventListener('resize', resize);
  };
}

let cleanup: (() => void) | undefined;

export function syncMatrixRain(theme: string): void {
  const canvas = document.getElementById('matrix-rain') as HTMLCanvasElement | null;
  if (!canvas) return;

  if (cleanup) {
    cleanup();
    cleanup = undefined;
  }

  if (theme === 'matrix') {
    const out = startMatrixRain(canvas);
    if (typeof out === 'function') cleanup = out;
  } else {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
