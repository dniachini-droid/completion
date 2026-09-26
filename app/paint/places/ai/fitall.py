#!/usr/bin/env python3
"""The AI repaint (D-100), steps 4-6 for every place, from chosen.json. SEALED folder (D-015). Run from app/.

    python3 paint/places/ai/fitall.py <out-dir> [id ...]

For each place: its chosen picture fitted to the frame (composite.py, with scenes.json's top/soft/dim), its anchors
moved (anchors.py; newmeta.py for a new place), then the critics' anchor corrections (each moves the anchor of that
layer nearest to the given old point, or the given index); a place whose choice is "kit" keeps its kit painting.
Prints each place's focus for put-in.py.
"""
import json, os, re, shutil, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); IMG = os.path.join(HERE, '..', 'img')
out = sys.argv[1]; C = json.load(open(os.path.join(HERE, 'chosen.json'))); S = json.load(open(os.path.join(HERE, 'scenes.json')))
pt = open('src/ui/paintings.ts').read()
ids = sys.argv[2:] or list(C['choice'])
for i in ids:
    ch = C['choice'][i]; sc = S[i]; kit = os.path.exists(os.path.join(IMG, i + '.webp'))
    m = re.search(rf"'{re.escape(i)}': \{{[^}}]*focus: ([.0-9]+)", pt); focus = m.group(1) if m else '.5'
    if ch == 'kit':
        for e in ('webp', 'json'): shutil.copy(os.path.join(IMG, f'{i}.{e}'), os.path.join(out, f'{i}.{e}'))
        print(i, 'kit kept; focus', focus); continue
    src = os.path.join(out, '..', f'{i}.{ch}.png'); top = str(sc.get('top', 444))
    subprocess.run(['python3', os.path.join(HERE, 'composite.py'), src, out, i, top, str(sc.get('soft', 9)), str(sc.get('dim', 0))], check=True, capture_output=True)
    if kit:
        r = subprocess.run(['python3', os.path.join(HERE, 'anchors.py'), src, out, i, top, focus], check=True, capture_output=True, text=True).stdout
        mf = re.search(r'focus [.0-9]+ -> ([.0-9]+)', r); focus = mf.group(1) if mf else focus
    else:
        subprocess.run(['python3', os.path.join(HERE, 'newmeta.py'), out, i], check=True, capture_output=True)
    meta = json.load(open(os.path.join(out, i + '.json')))
    for fx in C['anchors'].get(i, []):
        layer, k, u, v = fx[:4]; L = meta['anchors'][layer]
        if len(fx) > 4: k = min(range(len(L)), key=lambda j: (L[j]['u'] - fx[4]) ** 2 + (L[j]['v'] - fx[5]) ** 2)
        L[k]['u'], L[k]['v'] = u, v
    json.dump(meta, open(os.path.join(out, i + '.json'), 'w'), indent=1)
    print(i, ch, 'focus', focus)
