#!/usr/bin/env python3
"""Raster 1200x630 Open Graph image: nebula palette + favicon motif. Run from repo: python3 site/scripts/generate-og-image.py"""
from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "og-image.png"
W, H = 1200, 630

# Nebula + favicon (favicon.svg)
BG = "#04070f"
SURFACE = "#0f172a"
ACCENT = "#38bdf8"
TEXT = "#e8f4fc"
MUTED = "#94a3b8"

# ~20% larger than original 52 / 30 / 24
TITLE_PX = 62
SUB_PX = 36
DOMAIN_PX = 29


def _lerp_rgb(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return (
        int(a[0] + (b[0] - a[0]) * t),
        int(a[1] + (b[1] - a[1]) * t),
        int(a[2] + (b[2] - a[2]) * t),
    )


def nebula_background() -> Image.Image:
    """Soft gas clouds (blurred) + faint comet streaks + star dust, aligned with nebula theme CSS."""
    # Vertical base like themes.css linear strip
    base = Image.new("RGB", (W, H))
    px = base.load()
    c_top = (2, 6, 23)
    c_mid = (10, 18, 40)
    c_bot = (15, 23, 42)
    for y in range(H):
        t = y / max(H - 1, 1)
        if t < 0.42:
            u = t / 0.42
            rgb = _lerp_rgb(c_top, c_mid, u)
        else:
            u = (t - 0.42) / 0.58
            rgb = _lerp_rgb(c_mid, c_bot, u)
        for x in range(W):
            px[x, y] = rgb

    gas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    g = ImageDraw.Draw(gas)
    # Large soft blobs (theme radial colors)
    blobs = [
        (-220, -140, 640, 520, (99, 102, 241, 55)),
        (560, -160, 1320, 480, (56, 189, 248, 48)),
        (140, 260, 1080, 780, (139, 92, 246, 42)),
        (640, 160, 1280, 680, (236, 72, 153, 28)),
        (-80, 240, 480, 720, (14, 165, 233, 36)),
        (320, 80, 920, 420, (79, 70, 229, 22)),
    ]
    for *bbox, rgba in blobs:
        g.ellipse(bbox, fill=rgba)

    gas = gas.filter(ImageFilter.GaussianBlur(radius=52))

    out = base.convert("RGBA")
    out = Image.alpha_composite(out, gas)

    # Comet streaks (head bright, tail fades)
    comets = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cd = ImageDraw.Draw(comets)
    rng = random.Random(42)
    specs = [
        (80, 120, 18, 240, (180, 220, 255)),
        (920, 80, 195, 200, (160, 210, 255)),
        (200, 480, 35, 280, (200, 230, 255)),
        (700, 360, 160, 160, (120, 200, 255)),
        (1050, 420, 210, 140, (100, 180, 240)),
        (40, 300, 8, 320, (220, 235, 255)),
    ]
    for cx, cy, angle_deg, length, rgb in specs:
        rad = math.radians(angle_deg)
        cos, sin = math.cos(rad), math.sin(rad)
        for i in range(length):
            t = i / max(length - 1, 1)
            alpha = int(55 * (1.0 - t) ** 1.8)
            if alpha < 2:
                continue
            jitter = rng.uniform(-0.4, 0.4)
            px = cx + i * cos + jitter
            py = cy + i * sin + jitter
            w = max(1.0, 3.5 * (1.0 - t) + 0.5)
            cd.ellipse(
                (px - w, py - w, px + w, py + w),
                fill=(rgb[0], rgb[1], rgb[2], alpha),
            )

    comets = comets.filter(ImageFilter.GaussianBlur(radius=3.2))
    out = Image.alpha_composite(out, comets)

    # Sparse star dust
    dust = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dd = ImageDraw.Draw(dust)
    for _ in range(140):
        sx = rng.randint(0, W - 1)
        sy = rng.randint(0, H - 1)
        br = rng.choice([85, 120, 160, 200])
        dd.point((sx, sy), fill=(230, 240, 255, br))
    dust = dust.filter(ImageFilter.GaussianBlur(radius=0.9))
    out = Image.alpha_composite(out, dust)

    # Final gentle veil so foreground text stays readable
    veil = Image.new("RGBA", (W, H), (4, 7, 15, 35))
    out = Image.alpha_composite(out, veil)
    return out.convert("RGB")


def favicon_motif(draw: ImageDraw.ImageDraw, cx: float, cy: float, scale: float) -> None:
    """Scaled polygons from favicon.svg paths (viewBox 0 0 32 32)."""

    def poly(points: list[tuple[float, float]]) -> None:
        pts = [(cx + x * scale, cy + y * scale) for x, y in points]
        draw.polygon(pts, fill=ACCENT)

    poly([(8, 22), (8, 10), (12, 8), (12, 22), (8, 24)])
    poly([(16, 6), (20, 8), (20, 20), (16, 18), (16, 6)])
    poly([(24, 10), (28, 12), (28, 22), (24, 20), (24, 10)])


def find_font(size: int, bold: bool) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
    ]
    for p in candidates:
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            continue
    return ImageFont.load_default()


def main() -> None:
    img = nebula_background()
    draw = ImageDraw.Draw(img)

    tile = 168
    tx, ty = 96, (H - tile) // 2
    draw.rounded_rectangle((tx, ty, tx + tile, ty + tile), radius=26, fill=SURFACE)

    favicon_motif(draw, tx + 8, ty + 6, scale=(tile - 16) / 32)

    title_font = find_font(TITLE_PX, bold=True)
    sub_font = find_font(SUB_PX, bold=False)
    domain_font = find_font(DOMAIN_PX, bold=False)

    x_text = tx + tile + 56
    gap12 = int(14 * 1.2)
    gap23 = int(12 * 1.2)
    block_h = TITLE_PX + gap12 + SUB_PX + gap23 + DOMAIN_PX
    y0 = (H - block_h) // 2

    draw.text((x_text, y0), "Jeremy Brown", fill=TEXT, font=title_font)
    y1 = y0 + TITLE_PX + gap12
    draw.text((x_text, y1), "Full Stack Python Developer", fill=ACCENT, font=sub_font)
    y2 = y1 + SUB_PX + gap23
    draw.text((x_text, y2), "jeremyb.dev portfolio website", fill=MUTED, font=domain_font)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, "PNG", optimize=True)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
