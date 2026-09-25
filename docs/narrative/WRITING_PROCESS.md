# How the story's words are written

> **Spoiler-free.** How every story line that goes into the app is written and checked (D-096, which replaced the ChatGPT process of D-084–D-087). Follow it for any new story text, above all **the later weeks** (weeks 8 on), and for any line Dan flags while playing.

## The one test

A line is done when **a reader who knows nothing of the story can explain the screen back correctly**: where they are, what the thing is, what they did, and what seems to be going on. Atmosphere comes second to that (tone: `VOICE.md`, D-086).

## The rules for every line

1. **Say what a thing is first**, in everyday words, then the details. A familiar comparison helps ("a row of small notches, like empty boxes waiting to be ticked").
2. **Say what it appears to be**, as the explorer's impression ("it seems to be some kind of record"). The writer knows the true story and uses it to pick impressions a sharp first-time visitor would really form, never ones that give the hidden truth away.
3. **Every screen says where you are**, what you see, what you do or touch (or that you don't), and what you notice. Movement is explicit. Going back to the same places is fine.
4. **Plain, correct modern British English.** Vary sentences; no stock phrase repeated across screens; refer back briefly rather than describing a thing all over again.
5. **One name per thing**, explained on first sight.
6. **Length:** as long as it takes to explain. Story moments 50–120 words, arrivals up to about 150, finds and passages 20–60, choice buttons 2–6 words, end-of-week lines one or two sentences. Present tense, "you". Notebook pages keep their writer's own voice.
7. **Story rules:** keep every fact; add no new objects, marks, writing, people or causes; carved-shape words, sign renderings, [brackets], *italics*, CAPITALS and quotes stay exact; identical lines stay identical; "the lamp" is only the lamp on the ledge (the player has none); story lines never say "Key" (the app's own labels explain Keys); no pressure or guilt.

## Who does what

- **Claude writes**, with the sealed story to hand, and runs the checks as a multi-agent workflow.
- **Cold readers** (at least two, one on Fable) get only the screens in play order plus a recap of what the player has already seen. They must not open the repository. They explain every screen back and flag any they had to guess at.
- **Dan judges in place:** a week captured from the app as screenshots with the full words under each, never as a list of lines. He sees only what he'd see playing, and only up to where he has played or agreed to read (D-015).

## The steps

1. **Extract.** Dump the lines (`app/scripts/words/dump.ts`) into the scratchpad, never the repository, with each line's plain fact source. Leave out buttons that aren't choices, the taps of a cut word, and location labels.
2. **List the things.** Name every recurring thing, what it is in everyday words, and what it appears to be. Reuse earlier weeks' names.
3. **Write** to the rules above.
4. **Explain back.** The cold readers explain every screen. Rewrite each screen that anyone found unclear, *and* each one they explained wrongly while marking it clear.
5. **Check.** A fact and spoiler check against the plain source and sealed docs (exact find-and-replace fixes), and a final explain-back on Fable. Fix what's left by hand.
6. **Load** with `app/scripts/words/apply.cjs`, collapse doubled `**`, re-dump and confirm 0 mismatches. Keep choice buttons in the app's order.
7. **Test.** Typecheck, the rule tests, and the screen walk; nothing off screen or under a button. Commit with ids only, never story text. Builds for the phone come only from `main` (D-080).
8. **Show Dan** the in-app page for the first week of a batch, then a sample of the rest.
9. **Clean up.** Delete every copy of story text from the scratchpad.

## After the text is in

Dan names any screen that reads badly while playing. That line goes through steps 3–7 on its own.
