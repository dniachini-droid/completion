import base64, json, os, sys, time, urllib.request
KEY = os.environ['MESHY_API_KEY']; API = 'https://api.meshy.ai/openapi/v1/image-to-image'
STYLE = ("A richly hand-painted, atmospheric fantasy illustration in the exact style, palette and brushwork of the SECOND image: "
  "an ancient underground site cut in cold blue-violet stone, deep shadow, real depth and layered haze, stone with carved detail, "
  "chisel marks, cracks, wear and grain, soft bloom, painterly light. Use the FIRST image only as a layout guide: keep its camera, "
  "the positions of the walls and floor, where the light falls and where the main subject sits, but paint everything with far more "
  "depth, detail and craft. Rules: portrait; no people, hands, shadows of people, text, letters, symbols or modern objects; no red; "
  "the stone stays cold blue-violet, the only warm light is lamplight where the first image has it; nothing new becomes brighter "
  "than the main subject; the top fifth and the bottom third of the frame stay dark and quiet (text sits there). Scene: ")
SCENES = {
 'pt-pl-w1-below-the-lamp': "kneeling low under a stone ledge (its underside a dark band across the top), looking into a small niche cut in the wall at knee height. Above the niche mouth, a short row of four or five straight cut strokes in the stone. The stone around the niche mouth is darkened by old oil, a soft dark ring, darkest at the sill, like a shadow that doesn't move. Warm lamplight falls from directly above, out of frame, past the ledge's lip onto the floor. The main subject is the dark oily ring around the plain-cut niche mouth; the niche edge is a plain cut, no rim or frame.",
 'pt-b-2.B': "close on a cut-stone shelf in a dark chamber: a rod of dark, fine-grained stone, forearm-long, lying at a low diagonal across the frame, one long edge ground finer than a knife. A thin line of weak warm lamplight from a doorway behind runs along that fine edge only; the flat faces stay dark and matt. A faint pencilled line under the shelf. The main subject is the rod's fine edge catching light like a blade.",
 'pt-pl-w2-above-the-ring': "looking up at a wall of banded grey-white rock salt raked by cold violet light from the left. A single narrow crack, two fingers wide, runs up the salt; beside it a small count of short cut strokes. Far back inside the dark crack, a small pale sliver catches a single glint. The main subject is that pale thing deep in the crack.",
 'pt-pl-w2-box-by-the-cot': "low, near the floor, looking along a cut-stone wall in a small camp room: a shoebox-sized cardboard box gone soft with age sits against the wall; a thin dark slate is laid across its lid with a small count scratched on it; on the slate an old worn tin mug stands UPSIDE DOWN (rim on the slate, flat base on top, handle low). Weak warm lamplight from a doorway, a single glint on the mug's rim, dust in the air. The main subject is the upside-down mug.",
}
def uri(p): return 'data:image/jpeg;base64,' + base64.b64encode(open(p, 'rb').read()).decode()
def call(url, body=None):
    req = urllib.request.Request(url, data=json.dumps(body).encode() if body else None, headers={'Authorization': f'Bearer {KEY}', 'Content-Type': 'application/json'})
    return json.load(urllib.request.urlopen(req, timeout=120))
n_each = int(sys.argv[1]); jobs = {}
for n in sys.argv[2:]:
    for k in range(n_each):
        jobs[f'{n}.free{k}'] = call(API, {'ai_model': 'gpt-image-2', 'prompt': STYLE + SCENES[n], 'aspect_ratio': '2:3',
            'reference_image_urls': [uri(n + '.crop.jpg'), uri('pt-b-1.A.crop.jpg')]})['result']
print('sent', len(jobs), flush=True)
while jobs:
    time.sleep(10)
    for n, t in list(jobs.items()):
        d = call(f'{API}/{t}')
        if d['status'] in ('SUCCEEDED', 'FAILED', 'CANCELED'):
            if d['status'] == 'SUCCEEDED': urllib.request.urlretrieve(d['image_urls'][0], n + '.png'); print('got', n, flush=True)
            else: print('failed', n, d.get('task_error'), flush=True)
            del jobs[n]
