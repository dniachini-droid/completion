#!/usr/bin/env python3
"""The AI repaint (D-100), step 5: move the live-layer anchors onto the repaint. SEALED folder (D-015); no story here.

    python3 anchors.py <ai.png> <out-dir> <id> [top] [focus]

Aligns the AI picture (the 1320x1980 window at `top`) to the kit painting's same window (OpenCV findTransformECC,
affine, on blurred grey images), maps every anchor inside the window through it, and writes <out-dir>/<id>.json
(the kit's .json with the anchors moved). With `focus`, prints the moved focus too. If the alignment fails or is
implausible (scale off by over 20%, a shift over 12% of the frame), the anchors stay where they were and it says so.
"""
import json, os, sys
import cv2, numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); IMG = os.path.join(HERE, '..', 'img')
W, H, h = 1320, 2868, 1980

def grey(im):
    g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32)
    g = cv2.GaussianBlur(g, (0, 0), 6); g -= g.mean(); return g / (g.std() + 1e-6)

def align(ai_path, ident, top):
    kit = cv2.imread(os.path.join(IMG, ident + '.webp'))
    kw = cv2.resize(kit[top:top + h], (330, 495), interpolation=cv2.INTER_AREA)
    ai = cv2.resize(cv2.imread(ai_path), (330, 495), interpolation=cv2.INTER_AREA)
    why = []
    for mode, name in ((cv2.MOTION_AFFINE, 'affine'), (cv2.MOTION_TRANSLATION, 'shift')):
        M = np.eye(2, 3, dtype=np.float32)
        try:
            _, M = cv2.findTransformECC(grey(kw), grey(ai), M, mode,
                                        (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-5), None, 5)
        except cv2.error:
            why.append(name + ' failed'); continue
        sx, sy = np.linalg.norm(M[:, 0]), np.linalg.norm(M[:, 1])
        if .8 < sx < 1.25 and .8 < sy < 1.25 and abs(M[0, 2]) < 40 and abs(M[1, 2]) < 60:
            return M, ' '.join(why + [name + ' ok'])
        why.append(name + ' implausible')
    return None, ' '.join(why)

def mapper(M, top):
    """frame (u,v) -> frame (u,v): kit window px -> AI window px through M (kit coords to AI coords)."""
    def f(u, v):
        x, y = u * W / 4, (v * H - top) / 4          # the 330x495 grid
        if not (0 <= y <= 495): return u, v
        X = M[0, 0] * x + M[0, 1] * y + M[0, 2]; Y = M[1, 0] * x + M[1, 1] * y + M[1, 2]
        return round(float(np.clip(X * 4 / W, 0, 1)), 4), round(float(np.clip((Y * 4 + top) / H, 0, 1)), 4)
    return f

def snap(ai_path, top, u, v, r=28):
    """a glint or flame: to the brightest point within r px (frame scale) of where it landed, inside the window."""
    g = cv2.GaussianBlur(cv2.cvtColor(cv2.resize(cv2.imread(ai_path), (W, h)), cv2.COLOR_BGR2GRAY), (0, 0), 3)
    x, y = int(u * W), int(v * H - top)
    if not (0 <= y < h): return u, v
    y0, y1, x0, x1 = max(0, y - r), min(h, y + r + 1), max(0, x - r), min(W, x + r + 1)
    iy, ix = np.unravel_index(np.argmax(g[y0:y1, x0:x1]), (y1 - y0, x1 - x0))
    return round((x0 + ix) / W, 4), round((y0 + iy + top) / H, 4)

if __name__ == '__main__':
    ai_path, out, ident = sys.argv[1:4]
    top = int(sys.argv[4]) if len(sys.argv) > 4 else 444
    meta = json.load(open(os.path.join(IMG, ident + '.json')))
    M, why = align(ai_path, ident, top)
    moved = 0; f = mapper(M, top) if M is not None else None
    for kind, layer in meta.get('anchors', {}).items():
        for a in layer:
            if 'u' not in a: continue
            nu, nv = f(a['u'], a['v']) if M is not None else (a['u'], a['v'])
            if kind in ('glints', 'flame'): nu, nv = snap(ai_path, top, nu, nv)
            moved += (nu, nv) != (a['u'], a['v']); a['u'], a['v'] = nu, nv
    json.dump(meta, open(os.path.join(out, ident + '.json'), 'w'), indent=1)
    msg = f'{ident}: align {why}; {moved} anchors moved'
    if len(sys.argv) > 5 and M is not None: msg += f'; focus {sys.argv[5]} -> {mapper(M, top)(.5, float(sys.argv[5]))[1]:.2f}'
    print(msg)
