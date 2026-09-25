# The Blender pipeline (D-084 test)

Sealed (D-015): the scene files and Meshy prompts here quote the painting briefs. Dan sees the pictures only in the game.

## Setup (once per session)
- Blender: the official build from PyPI, as a Python module. The system package (`apt install blender`, 4.0) has **no denoiser**, and download.blender.org is blocked.
  `uv venv -p 3.11 <scratch>/bvenv && uv pip install -p <scratch>/bvenv/bin/python "bpy==4.2.*" pillow`
- Meshy: `MESHY_API_KEY` in the environment. Network access needs **both** `api.meshy.ai` (jobs) and `assets.meshy.ai` (the finished models).

## Files
- `lib.py`: kit coordinates (`K()`, x right, y up, z into the room), so rooms and cameras carry over from `../places/*.js`; room shells cut from rock (`arch_room` = the kit's `hallAir`), cut-stone material with the kit-style "darker overhead / darker near the eye" shading, lights with **light linking** (`only=[...]`, the Blender equivalent of the kit's `reach`), camera with the kit's `f`, compositor haze and glow, anchor projection.
- `<id>.py`: one scene per place. `python <id>.py out.png [scale] [samples]` (drafts: `.5 64`, about 40 s; final: `1 160`, about 34 min on 4 CPUs; 64 samples would do).
- `post.py`: vignette, grain, writes `<id>.webp/.jpg/.json` in the kit's format, so `node paint/check.mjs` and the app take them unchanged.
- `meshy.py`: text-to-3D (preview, then refine with PBR textures), saves `assets/<name>.glb`. `resume <name>` fetches a job that finished while the asset host was blocked.
- `img/`: the test's output. Not in the app.

## Lessons from the first scene
- A light left unlinked near the props lights the whole corner: an accent for one object goes in `only=[obj]`.
- Anything that must catch the warm light alone (a rim) is its own object, so light linking can reach just it.
- Haze colour must stay dark (about the kit's `hazeBase`), or it washes the frame.
- Run `check.mjs` on every half-size draft: words band, button band and warm share are the fastest guides.
