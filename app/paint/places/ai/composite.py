#!/usr/bin/env python3
"""Fit a 2:3 AI repaint (1024x1536) into the game's 1320x2868 frame. SEALED folder (D-015); this file holds no story.

    python3 composite.py <ai.png|jpg> <out-dir> <id> [top] [soft] [dim]

top = where the painted 1320x1980 window sits in the frame (default 444 = centred; 888 = bottom-aligned,
0 = top-aligned). Above and below the window the picture is continued from the AI painting's own blurred edge,
fading to dark (never blended with the old picture: that left seams and ghost lights). The lower third is softened
so the button band stays calm (check.mjs): soft = that blur's radius (default 9; raise it when check.mjs says
"button band busy"); dim = how much the words' band (top 22%) is darkened, 0-1 (default 0; raise it when check.mjs
says "words band dark"). Writes <out-dir>/<id>.webp and .jpg; the .json (anchors) is made by
anchors.py.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

W, H, h = 1320, 2868, 1980
src, out_dir, ident = sys.argv[1:4]
top = int(sys.argv[4]) if len(sys.argv) > 4 else 444
soft = float(sys.argv[5]) if len(sys.argv) > 5 else 9
dim = float(sys.argv[6]) if len(sys.argv) > 6 else 0
ai = Image.open(src).convert('RGB').resize((W, h), Image.LANCZOS)
A = np.asarray(ai).astype(np.float32)
blur = np.asarray(ai.filter(ImageFilter.GaussianBlur(28))).astype(np.float32)
out = np.zeros((H, W, 3), np.float32)
if top:   # above the window: the blurred top rows mirrored, fading to dark toward the frame's top
    n = top; t = np.linspace(1, 0, n, dtype=np.float32)[:, None, None]
    src_rows = blur[:n][::-1] if n <= h else np.repeat(blur[:1], n, 0)
    out[:top] = src_rows * (1 - .75 * t)
nb = H - top - h
if nb > 0:  # below: the edge row itself continued (no mirrored lights), fading to dark
    b = np.linspace(0, 1, nb, dtype=np.float32)[:, None, None]
    out[top + h:] = np.repeat(blur[h - 1:h], nb, 0) * (1 - .8 * b)
f = 120; y = np.arange(h, dtype=np.float32); w = np.clip(np.minimum(y, h - 1 - y) / f, 0, 1)[:, None, None]
if not top: w[:f] = 1
if not nb: w[-f:] = 1
out[top:top + h] = w * A + (1 - w) * blur
im = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)); a = np.asarray(im).astype(np.float32)
bb = np.asarray(im.filter(ImageFilter.GaussianBlur(soft))).astype(np.float32)
v = np.arange(H, dtype=np.float32) / H; wb = np.clip((v - .60) / .08, 0, 1)[:, None, None] * .85
wd = 1 - dim * np.clip((.26 - v) / .1, 0, 1)[:, None, None]   # the words' band darkened, fading out by 26%
fin = Image.fromarray(np.clip((wb * bb + (1 - wb) * a) * wd, 0, 255).astype(np.uint8))
fin.save(f'{out_dir}/{ident}.webp', quality=90); fin.save(f'{out_dir}/{ident}.jpg', quality=92)
print(ident, 'composited, window top', top)
