"""Post for the Blender paintings: grade toward the hall's numbers, film grain, vignette; write <id>.webp/.jpg/.json.
  python post.py <render.png> <out dir> <id> "<name>" [exposure] [gamma]
The anchors come from <render>.anchors.json (written by the scene)."""
import json, os, sys
import numpy as np
from PIL import Image

src, out, pid, name = sys.argv[1:5]
expo = float(sys.argv[5]) if len(sys.argv) > 5 else 1.
gam = float(sys.argv[6]) if len(sys.argv) > 6 else 1.
im = np.asarray(Image.open(src).convert('RGB'), dtype=np.float32) / 255.
H, W, _ = im.shape
x = np.clip(im * expo, 0, 1) ** gam
yy, xx = np.mgrid[0:H, 0:W]
r = np.hypot((xx / W - .5) * 1.1, (yy / H - .52) * .75)
x *= (1 - .45 * np.clip(r - .25, 0, 1) ** 1.5)[..., None]               # a soft vignette, as the hall's corners fall away
rng = np.random.default_rng(1)
x += (rng.normal(0, .012, (H, W, 1)) * (.4 + .6 * np.sqrt(x.mean(2, keepdims=True))))   # film grain, luminance only
x = np.clip(x, 0, 1)
img = Image.fromarray((x * 255 + .5).astype(np.uint8))
os.makedirs(out, exist_ok=True)
img.save(os.path.join(out, pid + '.webp'), quality=82, method=6)
img.save(os.path.join(out, pid + '.jpg'), quality=90)
anchors = json.load(open(src.replace('.png', '.anchors.json')))
json.dump({'id': pid, 'name': name, 'line': '', 'width': W, 'height': H, 'live': {'motes': 'gold', 'gold': True}, 'anchors': anchors},
          open(os.path.join(out, pid + '.json'), 'w'), indent=1)
print(pid, W, H, os.path.getsize(os.path.join(out, pid + '.webp')) // 1024, 'KB')
