Final polish of direction D (`/home/user/completion/docs/design/directions/d-combined/`). Read `CRITIQUE-2.md` in that folder, and `docs/design/ART_DIRECTION.md` → "Dan on direction D" (the player's own words; they overrule the critic). Never open `docs/narrative/sealed/`. Story constraints: no person or figure anywhere (and no mark that looks like one); wall-cups dark except during the cut; the clay lamp always lit.

**The player has overruled three of the critic's blockers — do NOT change these:** the hall painting in `hall.js` (he's seen it and likes it), the stair (he called it "just amazing"), and the Salt Gallery arrival (he called it "really beautiful"). Only fix the stair's white triangle glitches and hard floor seam, invisibly.

**Fix these:**
1. `delve-set.html` dial scale: the ring fills in proportion to the minutes out of 60 (25 = 5/12 of the ring, 30 = half, 45 = three quarters, 60 = full); the stop labels sit at those positions on the ring (60 at the top where the ring starts/ends); keep everything centred and aligned (Dan asked for that).
2. `delve-set.html` destinations must never pass a sealed thing. The lintel is sealed and the stair is beyond it. Use only reachable first-region places: 25 → "Towards the Salt Gallery"; 30 → "The Salt Gallery, and a little past it"; 45 → "On to the Survey Cut"; 60 → "The far end of the Survey Cut". Also, the dial is opened from the cat's-medication job, so "Start the delve" must start a delve on that job (not the Course).
3. `morning.html`: restore the "AHEAD ——" label above the Ahead sentence (Dan agreed to it).
4. `camp.html`: remove the warm floating specks at cup height along the walls (they read as lit cups).
5. `daybook.html`: replace the sample mark labelled "lamp" (it reads as a person with raised arms) with an abstract shape.
6. `record.html`: its return link goes to `morning.html` in the right state for where you came from; from day complete it must not undo "That's the day. Enough." (link to `morning.html#done` in that case, e.g. via `record.html#fromdone`).
7. `cut.html`: the far cups must not flare into two orange blobs like headlights — they wake as small warm points receding in perspective.
8. `complete.html`: the main button ("Rest here for today") must be present within ~2.5 s (fade it in early, even if the scene is still turning gold).
9. Anything else in CRITIQUE-2's should-fix list that is cheap and clearly right and doesn't touch the three overruled items.

Another agent may just have finished edits to record, cut, the lamp in `hall.js` and elsewhere: re-read every file from disk before editing, keep edits surgical. Check at 390×844 and 360×780 with screenshots (`cd /home/user/completion && NODE_PATH=$(npm root -g) node docs/design/tools/shot.js <your scratchpad>/df-<name>.jpg <html> 390 844 <ms>`) and Read them. Regenerate `shots/*.jpg` for every changed screen (JPEG; 9000 ms for cut and complete). Write `REVISION-2.md` (short). Do not commit. Reply in under 120 words.
