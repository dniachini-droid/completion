"""Meshy text-to-3D client for the Blender pipeline (D-084). SEALED folder (D-015).

  python meshy.py new <name> "<prompt>" ["<texture prompt>"]   start a preview, then refine with PBR; saves assets/<name>.glb
  python meshy.py resume <name>                                  continue an interrupted job from assets/<name>.task.json

Reads MESHY_API_KEY from the environment and never prints it.
"""
import json, os, sys, time, urllib.request

API = 'https://api.meshy.ai/openapi/v2/text-to-3d'
HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, 'assets')
NEG = 'low quality, low resolution, cartoon, toy, plastic, glossy, text, logo, watermark, base, pedestal, ground plane'


def call(method, url, body=None):
    key = os.environ.get('MESHY_API_KEY')
    if not key:
        sys.exit('MESHY_API_KEY is not set')
    req = urllib.request.Request(url, method=method, data=json.dumps(body).encode() if body else None,
                                 headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


def wait(task_id, label):
    while True:
        t = call('GET', f'{API}/{task_id}')
        print(f'  {label}: {t["status"]} {t.get("progress", 0)}%', flush=True)
        if t['status'] == 'SUCCEEDED':
            return t
        if t['status'] in ('FAILED', 'CANCELED', 'EXPIRED'):
            sys.exit(f'{label} {t["status"]}: {t.get("task_error")}')
        time.sleep(15)


def save(state, name):
    with open(os.path.join(ASSETS, name + '.task.json'), 'w') as f:
        json.dump(state, f, indent=1)


def run(name, state):
    if 'preview' not in state:
        state['preview'] = call('POST', API, {'mode': 'preview', 'prompt': state['prompt'], 'negative_prompt': NEG,
                                              'art_style': 'realistic', 'ai_model': 'meshy-5', 'topology': 'triangle',
                                              'target_polycount': 40000, 'should_remesh': True})['result']
        save(state, name)
    wait(state['preview'], name + ' preview')
    if 'refine' not in state:
        body = {'mode': 'refine', 'preview_task_id': state['preview'], 'enable_pbr': True}
        if state.get('texture_prompt'):
            body['texture_prompt'] = state['texture_prompt']
        state['refine'] = call('POST', API, body)['result']
        save(state, name)
    t = wait(state['refine'], name + ' refine')
    urllib.request.urlretrieve(t['model_urls']['glb'], os.path.join(ASSETS, name + '.glb'))
    if t.get('thumbnail_url'):
        urllib.request.urlretrieve(t['thumbnail_url'], os.path.join(ASSETS, name + '.thumb.png'))
    print('saved', name + '.glb')


if __name__ == '__main__':
    os.makedirs(ASSETS, exist_ok=True)
    cmd, name = sys.argv[1], sys.argv[2]
    if cmd == 'new':
        state = {'prompt': sys.argv[3], 'texture_prompt': sys.argv[4] if len(sys.argv) > 4 else ''}
        save(state, name)
    else:
        state = json.load(open(os.path.join(ASSETS, name + '.task.json')))
    run(name, state)
