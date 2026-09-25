# How to paint a place with the kit (lessons from week 1)

Sealed folder (D-015): the scene files here quote the briefs. This guide itself holds no story.

## The method (D-075): room scale, reused rooms, fast drafts
- **Room scale only.** Frame every place as a space seen from 1–4 m; the look-at is a lit feature within it. No macro close-ups of small objects (they never reached the bar). If a brief asks for a close view, take the nearest room-scale view that keeps its look-at.
- **Reuse an approved room** (below) and change camera, light and one feature. Copy what worked in the accepted ones: a long view with a far glow, one warm or cold key, dark words band, calm floor.
- **Drafts at `--scale .25`** (a few seconds); full size only at the end. Aim to finish a place in under ~10 drafts.
- Before calling it done: `check.mjs` all ok at full size, and `stats.mjs` + a crop show the look-at is the brightest or sharpest thing.

## Setup
- `export NODE_PATH=/opt/node22/lib/node_modules` (Playwright lives there). Run from `app/`.
- Bake a draft at half size: `node paint/bake.mjs --scale .5 --jpg --out <scratch>/<dir> paint/places/<id>.js` (10–25 s).
- Final at full size: drop `--scale .5` (bake with `--jpg` too, for viewing). The app uses the `.webp` + `.json`.
- Checks: `node paint/check.mjs <dir>/<id>.json` (every line must say ok: words band dark ≤32, button band ≤45 and busyness ≤.6, warm ≤15%, anchors in frame, palette). **Busyness rises at full size**: re-check full-size bakes.
- Look at it: `node paint/tools/sheet.mjs out.jpg 900 a.jpg b.jpg@x0,y0,x1,y1 …` (side by side; `@` crops by fractions), then view with Read. `node paint/tools/stats.mjs img…` for luminance/mean RGB. The bar: `paint/regression/hall-ref.jpg` and the accepted `paint/places/img/pt-b-1.{A,B,C}.webp`.

## Reuse, don't rebuild
- A scene can import another and reuse its room: `import room from './pt-b-1.C.js'; export default { ...room, id, name, cam, lights, glsl: room.glsl.replace('vec4 scene(vec3 p)', 'vec4 roomScene(vec3 p)') + \`vec4 scene(vec3 p){ vec4 d = roomScene(p); … return d; }\` }`. See `pt-b-2.B.js`, `pt-pl-w2-smooth-place.js`. Keep the same place looking the same across weeks.
- Existing settings: the Lamp Hall `pt-b-1.A.js` (and `paint/regression/lamp-hall.js`), the corner `pt-b-1.B.js`, the Survey Cut / her camp `pt-b-1.C.js`, the salt gallery `pt-pl-w1-pick-niche.js` / `pt-b-2.A.js`, below the lamp `pt-pl-w1-below-the-lamp.js`. Kit forms and materials: `paint/kit/lib.js` (read its header and the forms list). Samples in `paint/samples/` show stairs, shafts, domes, water, mist, beams.

## Traps that cost hours
- **gTint leaks.** `if (a.x < b.x) gTint = …` is true far from the object too. Always also require the surface to be near: `if (obj.x < d.x) { d = obj; gTint = … }` or `&& obj.x < .01`.
- **Light falloff is broad**: `att = k / (1 + d²/r²) / r²` ≈ `k/d²` far away. A "small" warm light with k .5 washes a whole floor gold (warm check fails). Local accents: k .01–.1, r .1–.3, placed very near the thing.
- A light's `reach: m` (kit v1.5) cuts it off beyond that distance: use it for small accents (a rim, a pin, an edge) so they light the thing and not the wall.
- **Floor sheen** is added toward `bloomAt` and ignores gTint; if the floor near the camera glows, set `sheen: 0` in the scene.
- `warm:` on a light adds gold everywhere around it; keep ≤ .02.
- **Words band (top 22%) too bright**: tint the upper walls/vault down (`if (p.y > h) gTint *= mix(1., .3, smoothstep(h, h2, p.y))`) or pitch the camera down. **Button band (lower third) busy/bright**: darken the near floor with gTint; polish and floor sheen are additive and ignore gTint, so damp `gPolish` there too.
- Floors (normal up, not M_DRESSED/M_ROCK) get a sheen toward `bloomAt`; inside small recesses set the material to `M_ROCK` to avoid it.
- In the GLSL, JS numbers must print as floats: `${x.toFixed(2)}`, never `${3}.`.
- A shader error shows as a JSON-less bake; see it with `node paint/bake.mjs … 2>&1 | grep -a ERROR`.
- Small close objects (under ~10 cm at under 1 m) read as toys or CG boxes. Round every edge (`box(...).x -= r`), vary with `rough()`, give them contact (sit on something, no gap), dark real-world albedo, and one clear light edge. Fill the frame with the look-at: camera within ~0.5 m, portrait frame, keep the rest dark.
- The look-at must be the brightest value or the sharpest edge. Check with stats and a crop.

## The bar and the round
- A separate critic scores each painting against the hall (see `CRITIQUE-W1-5.md` for the standard). 8/10 goes into the app; after 3 critiqued rounds a 7 goes in (Dan, 2026-09-24). Below 7 keeps its stand-in.
- Don't show sealed content outside `paint/places/` and `docs/narrative/sealed/`.
