# Prototype notes (Phase 8)

> What is temporary, rough or unproven in the prototype, so none of it becomes permanent by accident (CURRENT_STATE → Phase 8 objective). Spoiler-free. Each line says when it gets fixed.

| What | Why it's like this | Fixed when |
|---|---|---|
| The trials screen (`app/src/ui/Trials.svelte`) | A throwaway test bench for trials (b) and (c), not a game screen | Replaced by Today in the heart slice |
| Its words (`content/copy/en.ts`) | Placeholder, like all copy before the language pass (D-046) | The language pass |
| The app icon | A crop of an invented sample painting | When the app has its name (`narrative/NAMES.md`) |
| The working app name "Real Life RPG" | Apple needs one to make the record | Same |
| The delve alert uses the phone's default sound | The delve's own sound isn't made yet | Heart slice or later, if play shows sound matters |
| Storage is the browser's own (localStorage), throwaway | The real save (SQLite, the fact log) comes with the heart slice | Heart slice |
| Screens checked in Chromium at phone size, not WebKit | The container has only Chromium; TEST_STRATEGY asks for WebKit | Dan's phone checks each build; add WebKit to CI when the flow tests arrive |
| The painting kit samples bake in 10–80 s each; no scene of a real place yet | Real places wait for the sealed story-fix session (D-060) | After the story-fix session |
| Cloud signing (D-063) is unproven | First run pending Dan's secrets | The first TestFlight build |
