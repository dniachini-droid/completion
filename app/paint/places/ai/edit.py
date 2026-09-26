import base64, json, os, sys, time, urllib.request
KEY = os.environ['MESHY_API_KEY']; API = 'https://api.meshy.ai/openapi/v1/image-to-image'
KEEP = (" Change nothing else at all: keep the exact composition, camera, lighting, colours, style, stone, every other object and every "
        "mark exactly as they are. Do not add anything.")
EDITS = {
 'pt-b-2.B': ('pt-b-2.B.free0.jpg', "Edit this painting in three small ways. 1) The long straight line along the front of the shelf below the rod must "
   "be a thin flat grey pencil line drawn on the stone surface: no groove, no relief, no shadowed channel, no lit lip. 2) Remove the faint "
   "small pits or holes in the back wall behind the rod so the wall is plain stone. 3) On the rod, the flat faces are dark and matt; the "
   "light is only a thin bright line along one fine edge, not a broad glossy streak."),
 'pt-pl-w2-box-by-the-cot': ('pt-pl-w2-box-by-the-cot.free0.jpg', "Edit this painting in two small ways. 1) The box under the slate must be an "
   "old cardboard shoebox gone soft with age: matt, pale grey-brown card, slightly slumped rounded corners, a visible lid edge, no stone "
   "texture and no chisel marks. 2) The tin mug stands UPSIDE DOWN on the slate: its rim rests on the slate, its handle is low near the "
   "slate, and its top is the mug's closed flat bottom, one piece with the side wall, with no lid, no seam and no overhanging edge."),
}
def uri(p): return 'data:image/jpeg;base64,' + base64.b64encode(open(p, 'rb').read()).decode()
def call(url, body=None):
    req = urllib.request.Request(url, data=json.dumps(body).encode() if body else None, headers={'Authorization': f'Bearer {KEY}', 'Content-Type': 'application/json'})
    return json.load(urllib.request.urlopen(req, timeout=120))
jobs = {n + '.edit': call(API, {'ai_model': 'gpt-image-2', 'prompt': p + KEEP, 'aspect_ratio': '2:3', 'reference_image_urls': [uri(src)]})['result'] for n, (src, p) in EDITS.items()}
while jobs:
    time.sleep(10)
    for n, t in list(jobs.items()):
        d = call(f'{API}/{t}')
        if d['status'] in ('SUCCEEDED', 'FAILED', 'CANCELED'):
            if d['status'] == 'SUCCEEDED':
                urllib.request.urlretrieve(d['image_urls'][0], n + '.png')
                from PIL import Image; Image.open(n + '.png').convert('RGB').save(n + '.jpg', quality=92); print('got', n, flush=True)
            else: print('failed', n, d.get('task_error'), flush=True)
            del jobs[n]
