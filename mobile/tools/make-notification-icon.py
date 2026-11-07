#!/usr/bin/env python3
"""Builds assets/notification-icon.png (Android status-bar icon) from assets/icon.png.

Android draws the notification icon as a white silhouette, so every pixel that differs from the
icon's dark background (the white "FP" and the green smile) becomes white, the background becomes
transparent. Output: 96x96 RGBA (xxxhdpi size of a 24 dp icon), shape centered with ~8 % padding.
Usage (from mobile/): python3 tools/make-notification-icon.py   — needs Pillow.
"""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
src = Image.open(root / "assets" / "icon.png").convert("RGB")
bg = src.getpixel((0, 0))
w, h = src.size
mask = Image.new("L", src.size, 0)
mp, sp = mask.load(), src.load()
for y in range(h):
    for x in range(w):
        r, g, b = sp[x, y]
        # distance from the background colour → alpha (soft edges keep anti-aliasing)
        d = max(abs(r - bg[0]), abs(g - bg[1]), abs(b - bg[2]))
        mp[x, y] = min(255, d * 3)
box = mask.getbbox()
shape = mask.crop(box)
size, pad = 96, 8
inner = size - 2 * pad
scale = inner / max(shape.size)
shape = shape.resize((max(1, round(shape.size[0] * scale)), max(1, round(shape.size[1] * scale))), Image.LANCZOS)
out = Image.new("RGBA", (size, size), (255, 255, 255, 0))
white = Image.new("RGBA", shape.size, (255, 255, 255, 255))
out.paste(white, ((size - shape.size[0]) // 2, (size - shape.size[1]) // 2), shape)
out.save(root / "assets" / "notification-icon.png")
print("assets/notification-icon.png", out.size)
