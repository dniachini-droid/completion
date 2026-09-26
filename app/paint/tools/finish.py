#!/usr/bin/env python3
"""A shared finishing pass for baked paintings (experiment): bring a flat kit bake toward the approved
Lamp Hall's hand without moving anything, so every look-at stays where it is and reads the same.

    python3 paint/tools/finish.py <out-dir> <bake.webp> ...   (needs pillow, numpy, scipy)

Writes <out-dir>/<id>.webp (+ .jpg to look at) and copies <id>.json beside it for check.mjs.
Steps: a tone curve that lifts the brightest values toward the hall's (the look-at stays the brightest),
a split grade (violet shadows, a little gold in the lights, as the hall), a painterly smoothing
(Kuwahara) that turns flat CG gradients into strokes, a highlight glow, a soft paper/brush texture,
grain and a vignette. Every step keeps the order of values, so nothing new becomes the brightest thing.
"""
import json, os, shutil, sys
import numpy as np
from PIL import Image
from scipy.ndimage import uniform_filter, gaussian_filter

HALL_P50, HALL_TOP = 36., 196.     # the hall's median and near-top luminance (pt-b-1.A)


def kuwahara(a, r):
    """Edge-keeping painterly smoothing: each pixel takes the calmest of four quadrant means."""
    k = r + 1
    L = a @ [.299, .587, .114]
    m = np.stack([uniform_filter(a[..., c], k) for c in range(3)], -1)
    m2 = uniform_filter(L * L, k)
    mL = uniform_filter(L, k)
    var = m2 - mL * mL
    h = r // 2 + (r % 2)
    shifts = [(-h, -h), (-h, h), (h, -h), (h, h)]
    best = None; out = np.zeros_like(a)
    for dy, dx in shifts:
        v = np.roll(var, (dy, dx), (0, 1)); mm = np.roll(m, (dy, dx), (0, 1))
        if best is None:
            best = v; out[:] = mm
        else:
            sel = v < best
            best = np.where(sel, v, best); out[sel] = mm[sel]
    return out


def finish(src, out_dir):
    ident = os.path.splitext(os.path.basename(src))[0]
    a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
    H, W, _ = a.shape
    rng = np.random.default_rng(7)
    top_n = int(H * .22)
    words0 = float((a[:top_n] @ [.299, .587, .114]).mean())   # the words band's darkness before, to keep

    # 1. tone: gentle S-curve and a lift of the top toward the hall's, anchored at the median
    L = a @ [.299, .587, .114] + 1e-3
    p50, top = np.percentile(L, 50), np.percentile(L, 99.9)
    x = L / 255.
    gamma = np.log(HALL_P50 / 255.) / np.log(max(p50, 4) / 255.)
    gamma = float(np.clip(gamma, .85, 1.15))
    lift = float(np.clip((HALL_TOP / max(top, 20)) , 1., 1.35))
    y = x ** gamma
    y = y * (1 + (lift - 1) * np.clip((x - np.percentile(x, 60)) / max(1e-3, np.percentile(x, 99.95) - np.percentile(x, 60)), 0, 1) ** 1.5)
    a *= (y * 255. / (L))[..., None]

    # 2. split grade: violet shadows, a touch of gold where it is already lit
    L = a @ [.299, .587, .114] / 255.
    lights = np.clip((L - .25) / .5, 0, 1)[..., None]
    shadows = (1 - np.clip(L / .3, 0, 1))[..., None]
    a = a * (1 - .10 * lights) + lights * .10 * a * np.array([1.25, 1.05, .70])
    a = a * (1 - .08 * shadows) + shadows * .08 * a * np.array([1.05, .90, 1.15])

    # 3. painterly strokes: Kuwahara, blended so fine marks survive
    s = max(3, round(W / 330))
    p = kuwahara(a, s)
    a = .55 * p + .45 * a

    # 4. glow from the brightest parts (the look-at is already the brightest, so it gains most)
    L = a @ [.299, .587, .114]
    hi = np.clip((L - np.percentile(L, 97)) / 60., 0, 1)[..., None] * a
    glow = np.stack([gaussian_filter(hi[..., c], W / 60) for c in range(3)], -1)
    a += .30 * glow

    # 5. brush/paper texture: soft stretched noise that modulates value by a few percent
    n = gaussian_filter(rng.standard_normal((H, W)).astype(np.float32), (W / 400, W / 140))
    n2 = gaussian_filter(rng.standard_normal((H, W)).astype(np.float32), W / 700)
    t = n / (n.std() + 1e-6) * .035 + n2 / (n2.std() + 1e-6) * .02
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    v = yy / H   # texture and grain only between the words band (top 22%) and the button band (lower third)
    band = np.clip((v - .22) / .06, 0, 1) * np.clip((.66 - v) / .06, 0, 1)
    a *= (1 + t * band)[..., None]
    a *= (1 - .12 * np.clip((.22 - v) / .22, 0, 1))[..., None]   # keep the words band dark

    # 6. vignette and grain
    d = np.sqrt(((xx / W - .5) / .75) ** 2 + ((yy / H - .5) / 1.) ** 2)
    a *= (1 - .28 * np.clip(d - .25, 0, 1) ** 1.4)[..., None]
    a += rng.normal(0, 1.6, (H, W, 1)).astype(np.float32) * band[..., None]

    words1 = float((a[:top_n] @ [.299, .587, .114]).mean())
    if words1 > words0:   # never lighter behind the words than the bake was, fading out over the band's edge
        k = words0 / words1
        ramp = np.clip((top_n * 1.25 - np.arange(H)) / (top_n * .25), 0, 1).astype(np.float32)
        a *= (1 - (1 - k) * ramp)[:, None, None]

    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    os.makedirs(out_dir, exist_ok=True)
    img.save(f'{out_dir}/{ident}.webp', quality=86)
    img.save(f'{out_dir}/{ident}.jpg', quality=88)
    j = src[:-5] + '.json'
    if os.path.exists(j):
        meta = json.load(open(j))
        shutil.copy(j, f'{out_dir}/{ident}.json')
    print(ident, 'done')


if __name__ == '__main__':
    out = sys.argv[1]
    for f in sys.argv[2:]:
        finish(f, out)
