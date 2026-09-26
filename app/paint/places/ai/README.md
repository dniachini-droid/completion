# The AI repaint (D-099): every place, painted by an image model over the kit's layout

Sealed folder (D-015): the scripts here quote the briefs. **This README holds no story.** Never show Dan a brief, a prompt or a sealed id's meaning; show him only the pictures, labelled BEFORE / AFTER.

## The job (Dan, 2026-09-26)
Dan saw four repaints and found them "pretty beautiful … the detail is amazing". So **every place gets one**:
- **48 places already painted with the kit**: repaint each, using its kit painting as the layout guide.
- **41 new places for weeks 8–14** (35 places and 6 camp views, D-098). They show stand-ins now and have no kit painting yet; their briefs are in `docs/narrative/sealed/PAINTING_BRIEFS.md`. Paint them from the brief alone, with the style references below and no layout guide.

**The bar (Dan):** *story-critical things must be right*, meaning the one thing to look at, carved marks and counts, and anything a clue depends on. Small errors elsewhere are fine (his example: a mug with a lid). "Try to fix it but don't go obsessive." One or two tries per place, one targeted edit if a story-critical thing is wrong. If it's still wrong, the kit painting (or the stand-in) stays.

## Setup
- `MESHY_API_KEY` is in the environment. `api.meshy.ai` and `assets.meshy.ai` are reachable; `docs.meshy.ai` is blocked, so the API shape below was found by trial.
- `pip install pillow numpy scipy opencv-python-headless` (not preinstalled). Node checks need `export NODE_PATH=/opt/node22/lib/node_modules`, run from `app/`.

## The Meshy API (what works)
- `POST https://api.meshy.ai/openapi/v1/image-to-image`, header `Authorization: Bearer $MESHY_API_KEY`, JSON body `{"ai_model": "gpt-image-2", "prompt": "...", "reference_image_urls": ["data:image/jpeg;base64,...", ...], "aspect_ratio": "2:3"}` → `{"result": "<task id>"}`. **Always pass `aspect_ratio: "2:3"`**: without it the output is a 1024×1024 square (squashed); `size` is ignored.
- Poll `GET .../image-to-image/<id>` until `status` is `SUCCEEDED`; `image_urls[0]` is a 1024×1536 PNG. About a minute each; **12 credits each**.
- Several jobs can run at once (four at a time worked).

## The method (tested on four places; see `CRITIQUE-AI-TEST.md`)
1. **Layout guide.** From the kit painting (1320×2868), take a 1320×1980 window, scaled to 1024×1536. Default: centred (top = 444). If something the brief names sits near the top or bottom (one test place lost the object it is named after that way), move the window (top = 888 bottom-aligned, 0 top-aligned). New places have no guide: send only the style references.
2. **Paint freely** (`free.py`): reference 1 = the layout guide, reference 2 = the style (the Lamp Hall `pt-b-1.A`'s middle). The prompt says: the layout only guides the camera, surfaces and where the light and subject are; paint far more depth, detail and craft; portrait; no people, text, symbols or modern objects; no red; cold blue-violet stone, warm only where lamplight is; nothing new brighter than the subject; top fifth and bottom third dark and quiet. Then one plain scene description per place, written from its brief. **Two candidates per place**; pick the better.
   - **Consistency:** once the first few repaints are approved, add one of them as a third reference, so 89 pictures look like one hand and a place seen twice looks the same.
3. **Targeted edit** (`edit.py`): if a story-critical thing is wrong, send the chosen picture alone with an instruction that names the one change and says "change nothing else". This worked first time for two problems: an object painted as the wrong material, and a drawn line painted as carved.
4. **Fit to the frame** (`composite.py <ai> <out-dir> <id> [top]`). This continues the picture above and below the window from its own blurred edge, never from the old picture (that left seams and ghost lights), and softens the lower third for the buttons.
5. **Re-place the live anchors.** The `.json` beside each painting places the moving layers (glints, flames, beams, fog) by `u`, `v` (0–1 in the frame). The repaint moves things slightly, so a glint can land in a crack. Align the AI window to the kit window (OpenCV `findTransformECC`, affine, on grey images) and map each anchor through it, then move the `focus` in `ui/paintings.ts` the same way. New places: set anchors by hand on the lit points, or leave `anchors` empty (the painting stays still).
6. **Automatic checks:** `node paint/check.mjs <out-dir>/<id>.json` must say ok on every line. The usual failure is "button band busy": soften the lower third more.
7. **Critic, story-critical only.** A separate subagent with the brief, the kit painting and the repaint answers: is the thing to look at found and read correctly? Are carved marks and counts the same number, shape and place? Did the AI add a mark, hole, symbol or object that could read as a clue? Minor errors elsewhere are **not** failures (D-099).
8. **Put in:** `python3 paint/tools/put-in.py <out-dir>:<id>:<focus>` (for new places it also adds them to PAINTED); `npx vitest run --testTimeout 120000`, `npx tsc --noEmit`.

## Wrong readings seen in the test
- An object's material changed (card → stone).
- A mug's closed base painted as a lid, so it no longer reads upside down.
- A drawn line painted as a carved groove.
- Round holes added to a shelf front.
- A pale object painted warm, so it reads as a flame.
- An opening given a built stone surround, so it reads as a fireplace or tunnel.

Name the material, the orientation and "no rim or frame" in the scene description; check these first.

## Wrong readings seen in the full run (D-100)
- Small oil lamps added on ledges, benches and shelves wherever the light is unclear: the most common fault in new places. Say the light source plainly and remove any lamp the scene doesn't name.
- Counts off by one (the model rarely gets 7, 8 or 9 strokes right twice); a hand fix (copy one stroke) is cheaper than an edit.
- Handwritten words garbled ("open. D9"); pencil painted as carved.
- Carved rings painted as raised metal; a bowl left behind after a lamp is removed reads as an unlit lamp.

## The run's files (D-100)
`scenes.json` (one scene per place), `paint.py` (step 2), `edit.py` (step 3), `delamp.py` / `cool.py` (hand fixes), `composite.py` (step 4), `anchors.py` / `newmeta.py` (step 5), `chosen.json` (the picture chosen per place, and the critics' anchor corrections), `fitall.py` (steps 4–5 for every place from `chosen.json`). The raw pictures stayed in the session scratchpad; only the final frames are in `img/`.

## Budget
89 places × 2 tries × 12 credits ≈ 2,100 credits, plus edits. Painters in parallel (a few at a time, each with its own group of places), one critic per batch. Show Dan a labelled BEFORE/AFTER sheet of the first batch before doing the rest.
