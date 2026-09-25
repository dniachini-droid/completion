#!/usr/bin/env python3
"""Put finished paintings into the game (D-091). Run from app/.

    python3 paint/tools/put-in.py <dir>:<id>:<focus> ...

<dir> holds the full-size bake (<dir>/pt-<id>.webp and .json); <id> is the place or camp id without "pt-"
(e.g. b-3.A, pl-w4-hollow, cv-01); <focus> is the look-at's height in the frame, 0 top to 1 bottom.
Copies the bake to paint/places/img/, adds the id to core/game.ts PAINTED and the import + entry to
ui/paintings.ts (re-running for an id already in only refreshes its image). Then run the tests:
tests/rules/paintings.test.ts keeps the two lists in step.
"""
import re, shutil, sys

pt = open('src/ui/paintings.ts').read()
g = open('src/core/game.ts').read()
m = re.search(r"export const PAINTED: ReadonlySet<string> = new Set<string>\(\[(.*?)\]\);", g)
have = [x.strip().strip("'") for x in m.group(1).split(',') if x.strip()]
for arg in sys.argv[1:]:
    d, i, f = arg.rsplit(':', 2)
    for ext in ('webp', 'json'):
        try: shutil.copy(f'{d}/pt-{i}.{ext}', f'paint/places/img/pt-{i}.{ext}')
        except shutil.SameFileError: pass
    v = 'p' + re.sub(r'[^A-Za-z0-9]', '_', i)
    if f"'pt-{i}'" not in pt:
        imp = f"import {v}Url from '../../paint/places/img/pt-{i}.webp?url';\nimport {v}Meta from '../../paint/places/img/pt-{i}.json';"
        pt = pt.replace('\n\nexport interface Painting', '\n' + imp + '\n\nexport interface Painting', 1)
        pt = re.sub(r"(export const paintings: Record<string, Painting> = \{\n(?:.*\n)*?)(\};)",
                    lambda mm: mm.group(1) + f"  'pt-{i}': {{ url: {v}Url, meta: {v}Meta, focus: {f} }},\n" + mm.group(2), pt, count=1)
    if i not in have:
        have.append(i)
g = g.replace(m.group(0), "export const PAINTED: ReadonlySet<string> = new Set<string>([" + ", ".join(f"'{x}'" for x in have) + "]);")
open('src/ui/paintings.ts', 'w').write(pt)
open('src/core/game.ts', 'w').write(g)
print(len(have), 'painted')
