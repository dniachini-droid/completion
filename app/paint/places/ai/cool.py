#!/usr/bin/env python3
"""The AI repaint (D-099): cool a repaint that came out too warm (check.mjs "cold stone"). No story here.

    python3 cool.py <in.png> <out.png> [k]

The shadows and mid-tones are pulled toward the Site's violet (k, default .6); the brightest light keeps its warmth.
"""
import sys
import numpy as np
from PIL import Image
src, dst = sys.argv[1:3]; k = float(sys.argv[3]) if len(sys.argv) > 3 else .6
a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
L = (.299 * a[..., 0] + .587 * a[..., 1] + .114 * a[..., 2])[..., None]
violet = L * np.array([.86, .82, 1.32], np.float32)          # the stone's blue-violet at the same brightness
w = k * np.clip((200 - L) / 120, 0, 1)                         # full in the shadows, none in the brightest light
Image.fromarray(np.clip(a * (1 - w) + violet * w, 0, 255).astype(np.uint8)).save(dst)
