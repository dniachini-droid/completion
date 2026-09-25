"""Post for the Blender paintings: grade locked to the hall, film grain, vignette; write <id>.webp/.jpg/.json.
  python post.py <render.png> <out dir> <id> "<name>" [exposure] [gamma]
The anchors come from <render>.anchors.json (written by the scene).

The grade is shared by every Blender place, so each starts in the hall's colour: the darks are lifted to the hall's
violet floor (never black), then at every brightness the frame's mean colour is replaced by the hall's mean colour at
that brightness (regression/hall-ref.jpg), keeping each pixel's own departure from it (the lamp's gold, a glint)."""
import json, os, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
HALL = os.path.join(HERE, '..', 'regression', 'hall-ref.jpg')
LUM = np.array([.299, .587, .114], np.float32)
FLOOR = 17.                                       # the hall's darkest 1 %: 20 17 42 (luminance about 21)


def ratios(img, bins=32, sigma=2.):
    """Colour per luminance as channel / luminance, per bin (0-255), smoothed so no brightness band jumps."""
    p = img.reshape(-1, 3); L = p @ LUM
    k = np.clip((L / 256 * bins).astype(int), 0, bins - 1)
    n = np.bincount(k, minlength=bins).astype(np.float32)
    m = np.stack([np.bincount(k, p[:, c], bins) for c in range(3)], 1)
    xs = np.arange(bins); w = np.exp(-.5 * ((xs[:, None] - xs[None]) / sigma) ** 2)
    m, n = w @ m, w @ n                                        # pooled with the neighbouring bins
    r = m / np.maximum(m @ LUM, 1e-3)[:, None]
    ok = n > p.shape[0] * 1e-3
    return np.stack([np.interp(xs, xs[ok], r[ok, c]) for c in range(3)], 1), (xs + .5) * 256 / bins


def grade(x):
    """x: float 0-255. Lift the darks to the floor, then lock the colour at each brightness to the hall's."""
    L = x @ LUM
    lift = FLOOR * np.clip(1 - L / 90, 0, 1) ** 2                 # only the darks move; the lights stay put
    x = x + lift[..., None] * np.array([.95, .82, 2.0], np.float32)   # lifted toward the hall's violet, not grey
    hall = np.asarray(Image.open(HALL).convert('RGB'), np.float32)
    rh, cx = ratios(hall); rr, _ = ratios(x)
    L = x @ LUM
    k = np.stack([np.interp(L, cx, rh[:, c] / rr[:, c]) for c in range(3)], -1)
    return x * k


if __name__ == '__main__':
    src, out, pid, name = sys.argv[1:5]
    expo = float(sys.argv[5]) if len(sys.argv) > 5 else 1.
    gam = float(sys.argv[6]) if len(sys.argv) > 6 else 1.
    im = np.asarray(Image.open(src).convert('RGB'), dtype=np.float32) / 255.
    H, W, _ = im.shape
    x = np.clip(im * expo, 0, 1) ** gam
    x = np.clip(grade(x * 255.), 0, 255) / 255.
    yy, xx = np.mgrid[0:H, 0:W]
    r = np.hypot((xx / W - .5) * 1.1, (yy / H - .52) * .75)
    x *= (1 - .45 * np.clip(r - .25, 0, 1) ** 1.5)[..., None]               # a soft vignette, as the hall's corners fall away
    rng = np.random.default_rng(1)
    x += (rng.normal(0, .012, (H, W, 1)) * (.4 + .6 * np.sqrt(x.mean(2, keepdims=True))))   # film grain, luminance only
    x = np.clip(x, 0, 1)
    img = Image.fromarray((x * 255 + .5).astype(np.uint8))
    os.makedirs(out, exist_ok=True)
    img.save(os.path.join(out, pid + '.webp'), quality=82, method=6)
    img.save(os.path.join(out, pid + '.jpg'), quality=90)
    anchors = json.load(open(src.replace('.png', '.anchors.json')))
    json.dump({'id': pid, 'name': name, 'line': '', 'width': W, 'height': H, 'live': {'motes': 'gold', 'gold': True}, 'anchors': anchors},
              open(os.path.join(out, pid + '.json'), 'w'), indent=1)
    print(pid, W, H, os.path.getsize(os.path.join(out, pid + '.webp')) // 1024, 'KB')
