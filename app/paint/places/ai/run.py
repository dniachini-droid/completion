import base64, json, os, sys, time, urllib.request
KEY = os.environ['MESHY_API_KEY']; API = 'https://api.meshy.ai/openapi/v1/image-to-image'
PROMPT = ("Repaint the FIRST image in the hand-painted style of the SECOND image: a dark, painterly illustration of an "
  "underground place cut in cold blue-violet stone, with visible mottled stone texture and wear, soft haze and depth, "
  "gentle bloom, and warm gold lamplight only where light already falls in the first image. "
  "Keep the FIRST image's composition exactly: the same camera, the same surfaces and objects in the same positions, "
  "shapes and sizes, every carved mark, line and scratch unchanged in number, shape and place, the same light direction, "
  "and the same brightest spot. Do not add any object, figure, text, symbol, torch, window or light source. "
  "Do not light areas that are dark in the first image, do not add glow onto marks, and do not add rims, frames, arches or "
  "borders around openings or objects: edges stay plain cuts in the stone. Keep the top and bottom of the frame dark and plain. No red.")
def uri(p): return 'data:image/jpeg;base64,' + base64.b64encode(open(p, 'rb').read()).decode()
def call(url, body=None):
    req = urllib.request.Request(url, data=json.dumps(body).encode() if body else None, headers={'Authorization': f'Bearer {KEY}', 'Content-Type': 'application/json'})
    return json.load(urllib.request.urlopen(req, timeout=120))
jobs = {}
for n in sys.argv[1:]:
    jobs[n] = call(API, {'ai_model': 'gpt-image-2', 'prompt': PROMPT, 'reference_image_urls': [uri(n + '.crop.jpg'), uri('pt-b-1.A.crop.jpg')], 'aspect_ratio': '2:3'})['result']
    print('sent', n, flush=True)
while jobs:
    time.sleep(10)
    for n, t in list(jobs.items()):
        d = call(f'{API}/{t}')
        if d['status'] in ('SUCCEEDED', 'FAILED', 'CANCELED'):
            if d['status'] == 'SUCCEEDED':
                urllib.request.urlretrieve(d['image_urls'][0], n + '.ai.png'); print('got', n, flush=True)
            else: print('failed', n, d.get('task_error'), flush=True)
            del jobs[n]
