#!/usr/bin/env python3
"""The AI repaint (D-099), step 2 for any place. SEALED folder (D-015): scenes.json quotes the briefs.

    python3 paint.py <out-dir> <n-each> <id>[:k] ...

For each id: the layout guide (the kit painting's window at scenes.json's `top`, if the place has a kit painting),
the style reference (the Lamp Hall's middle) and, if scenes.json's `house` names approved repaints, those too;
the prompt is STYLE (or NEW, with no guide) + the place's scene. <n-each> candidates, written as
<out-dir>/<id>.free<k>.png (starting at k, default 0, so a second try doesn't overwrite the first).
Several ids run at once (four at a time worked).
"""
import base64, io, json, os, sys, time, urllib.request
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__)); IMG = os.path.join(HERE, '..', 'img')
KEY = os.environ['MESHY_API_KEY']; API = 'https://api.meshy.ai/openapi/v1/image-to-image'
RULES = ("Rules: portrait; no people, hands, shadows of people, text, letters, numbers, symbols or modern objects unless the scene "
  "names them; no red; the stone stays cold blue-violet, the only warm light is the lamplight the scene names; nothing new becomes "
  "brighter than the main subject; the top fifth and the bottom third of the frame stay dark and quiet (text sits there). "
  "Carved marks are only the ones the scene names, in the number it names; add no other marks, holes, cups, niches or objects. Scene: ")
STYLE = ("A richly hand-painted, atmospheric fantasy illustration in the exact style, palette and brushwork of the SECOND image (and any later ones): "
  "an ancient underground site cut in cold blue-violet stone, deep shadow, real depth and layered haze, stone with carved detail, "
  "chisel marks, cracks, wear and grain, soft bloom, painterly light. Use the FIRST image only as a layout guide: keep its camera, "
  "the positions of the walls and floor, where the light falls and where the main subject sits, but paint everything with far more "
  "depth, detail and craft. ")
NEW = ("A richly hand-painted, atmospheric fantasy illustration in the exact style, palette and brushwork of the reference images: "
  "an ancient underground site cut in cold blue-violet stone, deep shadow, real depth and layered haze, stone with carved detail, "
  "chisel marks, cracks, wear and grain, soft bloom, painterly light. The references show the style only, not the place: compose "
  "this new place from the scene below. ")

def jpeg_uri(im):
    b = io.BytesIO(); im.convert('RGB').save(b, 'JPEG', quality=90)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()

def window(ident, top):
    im = Image.open(os.path.join(IMG, ident + '.webp')).convert('RGB')
    return im.crop((0, top, 1320, top + 1980)).resize((1024, 1536), Image.LANCZOS)

def call(url, body=None):
    for a in range(5):
        try:
            req = urllib.request.Request(url, data=json.dumps(body).encode() if body else None,
                                         headers={'Authorization': f'Bearer {KEY}', 'Content-Type': 'application/json'})
            return json.load(urllib.request.urlopen(req, timeout=120))
        except Exception as e:
            if a == 4: raise
            print('retry', url[-30:], e, flush=True); time.sleep(2 ** (a + 1))

if __name__ == '__main__':
    out, n_each = sys.argv[1], int(sys.argv[2])
    S = json.load(open(os.path.join(HERE, 'scenes.json')))
    style = jpeg_uri(window('pt-b-1.A', 444))
    house = [jpeg_uri(Image.open(os.path.join(out, h)).resize((1024, 1536))) for h in S.get('_house', [])]
    jobs = {}
    for arg in sys.argv[3:]:
        ident, k0 = (arg.split(':') + ['0'])[:2]
        sc = S[ident]
        guided = os.path.exists(os.path.join(IMG, ident + '.webp')) and not sc.get('noguide')
        refs = ([jpeg_uri(window(ident, sc.get('top', 444)))] if guided else []) + [style] + house
        prompt = (STYLE if guided else NEW) + RULES + sc['scene']
        for k in range(int(k0), int(k0) + n_each):
            jobs[f'{ident}.free{k}'] = call(API, {'ai_model': 'gpt-image-2', 'prompt': prompt, 'aspect_ratio': '2:3',
                                                  'reference_image_urls': refs})['result']
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
