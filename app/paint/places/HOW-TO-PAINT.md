# How to paint a place with the kit

Sealed folder (D-015): the scene files here quote the briefs. This guide itself holds no story.

## Fast path (what worked, 2026-09-25: 42 places in one day)
The kit got **faster, not better**: first attempts are clear and correct but plainer than week 1. Use this path to repaint or add places quickly.

1. **Brief → scene → one attempt.** One painter (a subagent) per room or group of places, a few at a time: each reads this guide, the briefs, and the accepted scenes, writes `<id>.js`, drafts at `--scale .25` (≤ ~8 drafts), then **one** full-size final with `--ss 2 --jpg` into a scratch folder. `check.mjs` must be all ok at full size.
2. **A separate critic checks wrong readings only** (see `CRITIQUE-D085-*.md` for the prompt's standard): is the look-at found, and could it be mistaken for something else? Not a score; dark or plain is not a failure. Give the critic the painter's own worries.
3. **Fail → one second attempt** from the critic's smallest fix, then the critic again. Still failing → **don't tweak: start a simpler scene** (that is how the last one got in).
4. **Put it in** with `python3 paint/tools/put-in.py <scratch-dir>:<id>:<focus>` (from `app/`), then `npx vitest run` and `npx tsc --noEmit`. `focus` is the look-at's height, 0 top – 1 bottom (the painter reports it).
5. **Scene file = picture in the game.** If a new attempt is rejected, restore its scene file from git so the file still makes the picture the game carries.

**Time and the machine.** A full-size `--ss 2` bake takes ~4 min alone on the container's 4 CPU cores (no GPU) but 10–45 min with five bakes at once. Keep at most **one bake per painter and ~3–4 painters**; tell painters so. Quarter-size drafts are ~10 s. Tests may time out at 5 s while bakes run: `npx vitest run --testTimeout 120000`.

**Build shared rooms first.** Three painters each built their own stair, so it now differs from place to place. Before fanning out, have one painter build any new room (and export it) that several places share; the others import it. Never change an export that an in-game scene imports without re-baking those scenes.

**Wrong readings that came up** (check for these first): a small arched opening → mousehole or oven; a raised rim round a hole → porthole or pipe mouth; hard-rimmed ellipses → cut basins or holes, not wear; dents lit on top → raised studs; four dots in a dish → a button, and a bright arc + dark band → an eye; a round glow → a lamp or moon; a pale bead on a dark line → a pearl on a hair; a thin wavy raised line → a thread or wire; many same-size ovals → eggs or beans; interlocking blocks with outlines or chevrons → boards, panels, tread plate or a fence; a camera looking straight up a shaft → a level corridor; an evenly ruled line → ruler markings. The cures were almost always: cut into the surface rather than raised, same value as the surrounding stone, no outlines, one light across the look-at, and a simpler frame.

**What didn't help.** A general polish pass (more warmth, texture, haze) changed the pictures very little; only 3 of 7 were kept. Richer pictures would need a better kit, or the paused Blender route (D-090), not more passes.

## The method (D-075): room scale, reused rooms, fast drafts
- **Room scale only.** Frame every place as a space seen from 1–4 m; the look-at is a lit feature within it. No macro close-ups of small objects (they never reached the bar). If a brief asks for a close view, take the nearest room-scale view that keeps its look-at.
- **Reuse an approved room** (below) and change camera, light and one feature. Copy what worked in the accepted ones: a long view with a far glow, one warm or cold key, dark words band, calm floor.
- **Drafts at `--scale .25`** (a few seconds); full size only at the end. Aim to finish a place in under ~10 drafts.
- Before calling it done: `check.mjs` all ok at full size, and `stats.mjs` + a crop show the look-at is the brightest or sharpest thing. One attempt, then the critic (D-091, below).

## Setup
- `export NODE_PATH=/opt/node22/lib/node_modules` (Playwright lives there). Run from `app/`.
- Bake a draft at half size: `node paint/bake.mjs --scale .5 --jpg --out <scratch>/<dir> paint/places/<id>.js` (10–25 s).
- Final at full size: drop `--scale .5` and add `--ss 2` (kit v1.5: painted at twice the size and scaled down, so near edges do not stair-step; about 4× the time, finals only) (bake with `--jpg` too, for viewing). The app uses the `.webp` + `.json`.
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

## The bar and the round (D-091, Dan)
- **A painting goes in after its first attempt** if `check.mjs` is all ok at full size and its look-at reads as what it is. No score to reach.
- A separate critic checks each batch **for wrong readings only** (the look-at mistaken for something else, or not found); dark or plain is not a failure. See `CRITIQUE-D085-*.md`.
- A painting that fails gets **one second attempt**, from the critic's smallest fix. If it still reads wrongly it keeps its stand-in and Dan decides. Dan can send any painting back when he meets it in the game.
- Once in: `paint/tools/put-in.py` (above) copies the bake to `img/` and updates `core/game.ts` PAINTED and `ui/paintings.ts`; `tests/rules/paintings.test.ts` keeps them in step.
- Before D-091 the bar was 8/10 from the critic (7 after three rounds); the older CRITIQUE files score against that.
- Don't show sealed content outside `paint/places/` and `docs/narrative/sealed/`.
