/**
 * Pre-rendered canvas sprites. Glows, coals and sparks are painted once into small offscreen
 * canvases and stamped with drawImage, instead of rebuilding gradients or running shadowBlur
 * (a full blur pass per draw call) every frame.
 */

const cache = new Map<string, HTMLCanvasElement>();

/** Square sprite of `size` px, painted once per `key`. */
export function sprite(
  key: string,
  size: number,
  paint: (g: CanvasRenderingContext2D, size: number) => void
): HTMLCanvasElement {
  let cv = cache.get(key);
  if (!cv) {
    cv = document.createElement('canvas');
    cv.width = cv.height = size;
    const g = cv.getContext('2d');
    if (g) paint(g, size);
    cache.set(key, cv);
  }
  return cv;
}

/** Alpha component of an rgba() string (1 for anything else). */
export function alphaOf(color: string): number {
  const m = color.match(/rgba\([^)]*,\s*([\d.]+)\s*\)\s*$/);
  return m ? +m[1] : 1;
}

/** Soft radial glow sprite in rgb `r,g,b` (center opaque, fading to transparent). */
export function glowSprite(rgb: string): HTMLCanvasElement {
  return sprite(`glow:${rgb}`, 128, (g, s) => {
    const h = s / 2;
    const grad = g.createRadialGradient(h, h, 0, h, h, h);
    grad.addColorStop(0, `rgba(${rgb},1)`);
    grad.addColorStop(0.3, `rgba(${rgb},0.55)`);
    grad.addColorStop(0.65, `rgba(${rgb},0.15)`);
    grad.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, s, s);
  });
}

/** Stamp a sprite centered at (x, y) with diameter d, multiplying the current globalAlpha by `alpha`. */
export function stamp(
  c: CanvasRenderingContext2D,
  img: HTMLCanvasElement,
  x: number,
  y: number,
  d: number,
  alpha = 1
): void {
  if (alpha <= 0.003 || d <= 0) return;
  const prev = c.globalAlpha;
  c.globalAlpha = prev * alpha;
  c.drawImage(img, x - d / 2, y - d / 2, d, d);
  c.globalAlpha = prev;
}
