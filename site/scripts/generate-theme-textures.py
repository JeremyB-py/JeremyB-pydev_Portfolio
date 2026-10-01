#!/usr/bin/env python3
"""Raster textures for theme backgrounds, rendered once so the page only decodes small images
(no per-frame or per-tile SVG filters). Run from repo: python3 site/scripts/generate-theme-textures.py

- nebula-clouds.webp: domain-warped fractal noise shaped by a few soft cloud masses, colored from
  the nebula palette (violet/indigo to match the GitHub chart, blues, faint rose and gold). Saved
  opaque (clouds premultiplied onto black) and screen-blended with the sky gradient inside one
  static layer (`background-blend-mode`), where black adds nothing. An alpha channel compresses
  ~15x worse, and lossy alpha bands visibly.
- ember-char-rim.webp: ragged dark char around the edges of Ember's cards (noise masked to the rim).
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "images" / "nebula-clouds.webp"
RIM_OUT = ROOT / "public" / "images" / "ember-char-rim.webp"
W, H = 1120, 700
#: Cloud brightness (was the layer's CSS opacity before it moved into the sky layer)
INTENSITY = 0.7
SEED = 7

rng = np.random.default_rng(SEED)
ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
u, v = xs / W, ys / H


def value_noise(cells_x: int, cells_y: int) -> np.ndarray:
    grid = rng.random((cells_y + 1, cells_x + 1)).astype(np.float32)
    return np.asarray(Image.fromarray(grid).resize((W, H), Image.BICUBIC), dtype=np.float32)


def fbm(base_x: int, base_y: int, octaves: int, gain: float = 0.52) -> np.ndarray:
    total = np.zeros((H, W), np.float32)
    amp, norm = 1.0, 0.0
    for o in range(octaves):
        total += amp * value_noise(base_x * 2**o, base_y * 2**o)
        norm += amp
        amp *= gain
    return total / norm


def warp(field: np.ndarray, strength: float) -> np.ndarray:
    """Sample `field` at coordinates pushed around by two other noise fields (filament look)."""
    dx = (fbm(3, 2, 4) - 0.5) * strength
    dy = (fbm(3, 2, 4) - 0.5) * strength
    return field[mirror(ys + dy, H), mirror(xs + dx, W)]


def mirror(coord: np.ndarray, n: int) -> np.ndarray:
    """Reflect out-of-range coordinates back inside (clamping smears the edge rows into streaks)."""
    i = np.abs(coord.astype(np.int32)) % (2 * (n - 1))
    return np.where(i >= n, 2 * (n - 1) - i, i)


def mass(cx: float, cy: float, rx: float, ry: float, angle: float) -> np.ndarray:
    """Soft rotated elliptical envelope (0..1)."""
    ca, sa = np.cos(angle), np.sin(angle)
    px, py = (u - cx) * (W / H), v - cy
    qx = (px * ca + py * sa) / rx
    qy = (-px * sa + py * ca) / ry
    return np.exp(-(qx * qx + qy * qy) * 1.6)


def smoothstep(a: float, b: float, x: np.ndarray) -> np.ndarray:
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


# Cloud body: billowy fbm, warped; plus ridged noise for bright filaments
body = warp(fbm(4, 3, 6), strength=220)
ridged = 1 - np.abs(2 * warp(fbm(5, 3, 5), strength=160) - 1)
filaments = smoothstep(0.72, 0.97, ridged)

envelope = np.maximum.reduce(
    [
        mass(0.22, 0.30, 0.55, 0.26, 0.45),  # upper-left violet/indigo sweep
        mass(0.80, 0.20, 0.42, 0.20, -0.35),  # upper-right blue
        mass(0.55, 0.88, 0.60, 0.20, 0.10),  # lower violet band
        0.7 * mass(0.10, 0.70, 0.22, 0.18, 0.9),  # small left teal wisp
    ]
)
density = smoothstep(0.42, 0.78, body) * envelope
glow = filaments * envelope

# Palette (0-255): violet, indigo, sky blue, deep blue, rose (hint), gold (hint)
violet = np.array([139, 92, 246], np.float32)
indigo = np.array([99, 102, 241], np.float32)
sky = np.array([56, 189, 248], np.float32)
blue = np.array([37, 99, 235], np.float32)
rose = np.array([236, 72, 153], np.float32)
gold = np.array([251, 191, 36], np.float32)

# Low-frequency hue field picks the mix per region; hints only where their own noise peaks
hue = fbm(2, 2, 3)[..., None]
cool = blue * (1 - hue) + sky * hue
warm = indigo * (1 - hue) + violet * hue
side = smoothstep(0.35, 0.75, (u * 0.8 + (1 - v) * 0.2))[..., None]  # right side leans blue
color = warm * (1 - side) + cool * side
rose_w = (smoothstep(0.62, 0.8, fbm(3, 2, 3)) * mass(0.30, 0.34, 0.3, 0.16, 0.45))[..., None] * 0.7
gold_w = (smoothstep(0.66, 0.84, fbm(3, 2, 3)) * mass(0.58, 0.86, 0.25, 0.1, 0.1))[..., None] * 0.5
color = color * (1 - rose_w - gold_w) + rose * rose_w + gold * gold_w
# Filaments burn brighter / whiter
color = color + (255 - color) * (0.35 * glow[..., None])

alpha = np.clip(density * 0.62 + glow * 0.28, 0, 1)
rgb = np.clip(color * (alpha * INTENSITY)[..., None], 0, 255).astype(np.uint8)

OUT.parent.mkdir(parents=True, exist_ok=True)
Image.fromarray(rgb).save(OUT, "WEBP", quality=82, method=6)
print(f"Wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)")


# ---- Ember card rim: speckled char, transparent in the middle, stretched over each card ----
RW, RH = 400, 240
rim_rng = np.random.default_rng(11)


def rim_noise(cells_x: int, cells_y: int) -> np.ndarray:
    grid = rim_rng.random((cells_y + 1, cells_x + 1)).astype(np.float32)
    return np.asarray(Image.fromarray(grid).resize((RW, RH), Image.BICUBIC), dtype=np.float32)


ry, rx = np.mgrid[0:RH, 0:RW].astype(np.float32)
noise = sum(rim_noise(9 * 2**o, 9 * 2**o) * 0.5**o for o in range(4)) / sum(0.5**o for o in range(4))
# Elliptical distance from center in box-relative units (matches the old SVG radialGradient r=.72)
t = np.sqrt((rx / RW - 0.5) ** 2 + (ry / RH - 0.5) ** 2) / 0.72
edge = smoothstep(0.55, 1.0, t)
char = np.clip(2.6 * noise - 0.95, 0, 1) * edge
rim = np.zeros((RH, RW, 4), np.uint8)
rim[..., 0], rim[..., 1], rim[..., 2] = 10, 5, 2
rim[..., 3] = (char * 255).astype(np.uint8)
# Lossy alpha is fine here: the speckle hides any banding
Image.fromarray(rim).save(RIM_OUT, "WEBP", quality=70, alpha_quality=60, method=6)
print(f"Wrote {RIM_OUT.relative_to(ROOT)} ({RIM_OUT.stat().st_size // 1024} KB)")
