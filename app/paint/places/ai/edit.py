#!/usr/bin/env python3
"""The AI repaint (D-099), step 3: one targeted edit. SEALED folder (D-015): the instructions quote the briefs.

    python3 edit.py <out-dir> <id>:<src-suffix>:<new-suffix> "<instruction>" [<id>:<src>:<new> "<instruction>" ...]

Sends <out-dir>/<id>.<src-suffix>.png alone with the instruction + KEEP; writes <out-dir>/<id>.<new-suffix>.png.
(The four-place test's two hard-coded edits are in git history, commit f108e70.)
"""
import os, sys, time, urllib.request
from paint import API, call, jpeg_uri
from PIL import Image

KEEP = (" Change nothing else at all: keep the exact composition, camera, lighting, colours, style, stone, every other object and every "
        "mark exactly as they are. Do not add anything.")

if __name__ == '__main__':
    out = sys.argv[1]; args = sys.argv[2:]; jobs = {}
    for spec, instr in zip(args[::2], args[1::2]):
        ident, src, new = spec.split(':')
        ref = jpeg_uri(Image.open(os.path.join(out, f'{ident}.{src}.png')))
        jobs[f'{ident}.{new}'] = call(API, {'ai_model': 'gpt-image-2', 'prompt': instr + KEEP, 'aspect_ratio': '2:3',
                                            'reference_image_urls': [ref]})['result']
    print('sent', len(jobs), flush=True)
    while jobs:
        time.sleep(10)
        for n, t in list(jobs.items()):
            d = call(f'{API}/{t}')
            if d['status'] in ('SUCCEEDED', 'FAILED', 'CANCELED'):
                if d['status'] == 'SUCCEEDED':
                    urllib.request.urlretrieve(d['image_urls'][0], os.path.join(out, n + '.png')); print('got', n, flush=True)
                else: print('failed', n, d.get('task_error'), flush=True)
                del jobs[n]
