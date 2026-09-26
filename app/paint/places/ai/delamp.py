#!/usr/bin/env python3
"""The AI repaint (D-099): take out a small lamp the model added (a false light), by inpainting. No story here.

    python3 delamp.py <in.png> <out.png> x0,y0,x1,y1 [...]

Each box (in the 1024x1536 picture) is covered by a feathered copy of the stone beside it (dx,dy: where from, default
the box's own width to the left; add them as x0,y0,x1,y1,dx,dy); within the box and a margin round it, the
lamp's warm spill is pulled back toward the stone's violet so no glow is left without a source.
"""
import sys
import cv2, numpy as np
im = cv2.imread(sys.argv[1]); out = sys.argv[2]
for b in sys.argv[3:]:
    v = list(map(int, b.split(','))); x0, y0, x1, y1 = v[:4]
    dx, dy = (v[4], v[5]) if len(v) > 4 else (-(x1 - x0), 0)
    f = max(12, (x1 - x0) // 3)                                     # the feather
    a = np.zeros(im.shape[:2], np.float32); a[y0:y1, x0:x1] = 1
    a = np.clip(cv2.GaussianBlur(a, (0, 0), f / 2) * 1.6, 0, 1)[..., None]
    src = np.roll(im, (-dy, -dx), (0, 1)).astype(np.float32)    # the stone at (x+dx, y+dy)
    rm = np.zeros(im.shape[:2], bool); rm[max(0, y0 - 2 * f):y1 + 2 * f, max(0, x0 - 2 * f):x1 + 2 * f] = True
    rm[y0 - f // 2:y1 + f // 2, x0 - f // 2:x1 + f // 2] = False  # a ring round the box, the lamp left out
    k = np.median(im.mean(2)[rm]) / max(1, np.median(src.mean(2)[y0:y1, x0:x1]))
    src *= float(np.clip(k, .9, 1.4))                              # as bright as the stone round it
    im = np.clip(src * a + im * (1 - a), 0, 255).astype(np.uint8)
    pad = max(x1 - x0, y1 - y0)   # the spill round it
    X0, Y0, X1, Y1 = max(0, x0 - pad), max(0, y0 - pad), min(im.shape[1], x1 + pad), min(im.shape[0], y1 + pad)
    yy, xx = np.mgrid[Y0:Y1, X0:X1]; cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    w = np.clip(1 - np.hypot((xx - cx) / (pad * 1.6), (yy - cy) / (pad * 1.6)), 0, 1)[..., None] * .15
    reg = im[Y0:Y1, X0:X1].astype(np.float32); L = reg.mean(2, keepdims=True)
    cool = L * np.array([1.25, .85, .8], np.float32)               # BGR: the stone's violet
    im[Y0:Y1, X0:X1] = np.clip(reg * (1 - w) + cool * w, 0, 255).astype(np.uint8)
cv2.imwrite(out, im)
