#!/usr/bin/env python3
"""The AI repaint (D-100), step 5 for a NEW place (no kit painting, so no anchors to move). SEALED folder (D-015).

    python3 newmeta.py <out-dir> <id> ...

Writes <out-dir>/<id>.json: the name from the brief's table, the live layers (gold motes and a low fog where the scene
is lit warm, violet motes otherwise) and no anchors, so nothing is placed on a wrong spot; the painting stays still
apart from its motes and fog.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
BRIEFS = os.path.join(HERE, '..', '..', '..', '..', 'docs', 'narrative', 'sealed', 'PAINTING_BRIEFS.md')
names = dict(re.findall(r'^\| `(pt-[^`]+)` \| ([^|]+?) \|', open(BRIEFS).read(), re.M))
S = json.load(open(os.path.join(HERE, 'scenes.json')))
out = sys.argv[1]
for ident in sys.argv[2:]:
    warm = re.search(r'warm|cup-flame|flames', S[ident]['scene'])
    live = {'motes': 'gold', 'fog': 'low', 'gold': True} if warm else {'motes': 'violet', 'fog': 'low'}
    json.dump({'id': ident, 'name': names[ident], 'line': '', 'width': 1320, 'height': 2868, 'live': live, 'anchors': {}},
              open(os.path.join(out, ident + '.json'), 'w'), indent=1)
    print(ident, names[ident], live)
