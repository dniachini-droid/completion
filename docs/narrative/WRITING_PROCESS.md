# How the story's words are written

> **Spoiler-free.** How every story line that goes into the app is written and checked (D-084–D-087). Follow it for any new story text, above all **the later weeks** (only weeks 1–7 are in the app), and for any line Dan flags while playing.

## Who does what

- **The writer is ChatGPT.** In a blind test Dan preferred its prose to two Claude agent teams (D-087).
- **Claude edits and checks.** Claude extracts the lines, writes the brief, and checks and loads the result. The brief always carries `VOICE.md`, the voice Dan chose (D-086).
- **Dan carries the files** between the two **unopened**: he is the player and the story is sealed (D-015). The only story he sees is the examples he asks ChatGPT to show in the chat, and those must come from week 1 or 2.

## The steps

1. **Extract.** Dump the lines (`app/scripts/words/dump.ts`) into the scratchpad, never into the repository. Leave out buttons, one-tap choices, the four taps of a cut word, and location labels: they stay short and plain. Also leave out anything the puzzles depend on: sign renderings, mark shapes, guess words.
2. **Split and brief.** Use files of **up to about 150 lines, grouped by kind** (big moments; sealed things and notebook pages; finds and glimpses; passages), **one fresh ChatGPT chat per file**. A long file in one chat makes it pad lines with the same stock sentences. The brief at the top of each file says:
   - what the game is, and that Dan must not read the file;
   - the whole of `VOICE.md`;
   - a length guide on every heading: big moments 120–220 words, story steps and camps 70–150, finds and passages 40–90, glimpses 30–60; end-of-week lines stay plain and under 40;
   - the story rules: keep every fact; add no new objects, marks, writing, people, causes or hints; keep carved-mark words, [brackets], *italics*, CAPITALS and quotes exactly; identical lines stay identical; no pressure or guilt;
   - the banned list: no "You can…" sentences, no surveying words (occupies, in view, position…), no sentence reused across lines, no AI tells;
   - the reply: the whole file back as a downloadable `.md` with the same `### key` headings, and in the chat only "Done" (or up to two week-1/2 examples copied from the file).
3. **Dan passes each file** to ChatGPT with "Follow the brief at the top of this file." and sends back what it returns. **If it comes back unchanged**, he resends in the same chat, telling it to do the rewrite now.
4. **Check** each returned file (`app/scripts/words/check.cjs`) for keys, facts, markup and repetition. Then **read every line** for things a script cannot catch:
   - **continuity**: an end-of-week glimpse must not walk the player somewhere not yet reached (D-079);
   - **anchors**: "the lamp" is always the lamp on the ledge; the player has no lamp of their own;
   - anything that explains, hints, or adds a clue-like detail;
   - brief wording copied into the text;
   - filler: a sentence that could sit in any line.

   Make the smallest fix, and record the fixes in `DECISIONS.md` by id only.
5. **Load** with `app/scripts/words/apply.cjs`, then collapse doubled `**`, join any paragraph breaks into one block, re-dump, and confirm 0 mismatches.
6. **Test.** Typecheck, the rule tests, and the screen walk at both phone sizes; the walk fails if any text is off screen or under a button. Then commit (ids only, never story text), push, and build to TestFlight.
7. **Clean up.** Delete every copy of story text from the scratchpad.

## After the text is in

Dan reads on his phone and names any screen that reads badly. That line goes through the same steps as a one-line file.
