# Setting the delve's length — a short look at good duration controls

> Phase 4, for D-033 / `game/TOOLS.md` §1. About 20 minutes of reading, 2026-09-24. Not exhaustive; a design note, not a study.

## What I looked at
- **Apple's sleep schedule dial** (Health / Clock): two handles on a 24-hour ring; as you drag, the times change live and *the consequence* (hours of sleep) reads underneath. [Apple Support](https://support.apple.com/guide/iphone/set-up-a-sleep-schedule-iphaf56dceb4/ios), [MacStories](https://www.macstories.net/stories/sleep-tracking-in-watchos-7-and-ios-14-elevated-by-a-user-experience-driven-design/)
- **Forest**: drag a button round a ring to set 10–120 minutes, with the tree in the middle; the number sits below. Lovely metaphor, but a long range on a small ring makes exact values fiddly. [Medium review](https://medium.com/illumination/the-forest-app-get-focused-while-growing-trees-fbddf472b9c1)
- **Flow, Tide, Oak**: calm, few buttons, presets rather than free entry; Flow added presets because people reuse the same few lengths. [Flow listing](https://www.educationalappstore.com/app/flow-focus-pomodoro-timer), [Tide](https://medium.com/@fueled/focus-and-meditate-with-tide-the-best-pomodoro-app-ec2be65e1424), [Oak](https://tidbits.com/2022/09/23/meditate-for-free-with-the-oak-app/)
- **Apple's haptics guidance**: system pickers and sliders "tick" as you pass values; use haptics consistently and sparingly. [HIG: Playing haptics](https://developer.apple.com/design/human-interface-guidelines/playing-haptics), [Haptics on Apple platforms](https://blog.eidinger.info/haptics-on-apple-platforms)
- **Web vibration on iPhone**: Safari has long ignored `navigator.vibrate`; workarounds exist but Apple keeps closing them. [MDN compat issue](https://github.com/mdn/browser-compat-data/issues/29166), [Godot controllers issue](https://github.com/splatterfacegames/godot-phone-mass-controllers/issues/14)
- **Game feel**: responsiveness + readability, anticipation before release, "juice" as the feedback layer. [Game feel survey (arXiv)](https://arxiv.org/pdf/2011.09201), [Egmatic](https://egmatic.com/blog/how-to-make-your-game-feel-good)
- **Reach and targets**: the thumb's easy zone is the lower middle; comfortable targets are about 9–10 mm. [Smashing: Fitts' law in the touch era](https://www.smashingmagazine.com/2022/02/fitts-law-touch-era/), [Parachute: thumb zone](https://parachutedesign.ca/blog/thumb-zone-ux/), [Parhi et al., thumb target study](https://dl.acm.org/doi/10.1145/1152215.1152260)
- **Accessible sliders**: `role="slider"`, a spoken value (`aria-valuetext`), arrows / Home / End. [W3C ARIA patterns](https://www.w3.org/WAI/ARIA/apg/patterns/), [TPGi](https://www.tpgi.com/aria-slider-part-2/)

## Lessons
1. **Show the consequence, not just the number.** The sleep dial's best trick is "7 h 30 min of sleep" updating as you drag. For us: *where it will take you*.
2. **Few stops beat a fine range.** Forest's 10–120 on a ring is fiddly; Flow moved to presets. Dan named four lengths, so the control has **four detents: 25, 30, 45, 60**, and nothing between. One flick per step, no fiddling (P1).
3. **Every detent needs a felt "tick".** Pickers tick as values pass. Here: a pulse of light at the stop, the number re-setting with a small spring, and a vibration where the phone allows.
4. **Don't rely on vibration.** iPhone Safari mostly ignores it, so the visual tick must carry the feeling alone; the real app gets proper haptics in Phase 7.
5. **The thing follows the finger, then settles.** While dragging, the handle tracks the finger freely; on release it eases to the nearest stop. Snapping mid-drag feels sticky.
6. **Big, forgiving grab areas.** A small glowing handle can sit inside a ~48px invisible grab area, and a drag anywhere on the ring or lamp counts, not just on the handle.
7. **Keep it in the thumb's easy zone.** The control and the Start button live in the lower two-thirds; nothing to reach for at the top.
8. **Anticipation, like charging a jump.** The growing light/flame is the "charge"; the release is Start. The preview makes the choice feel like wanting, not configuring.
9. **A non-drag route for everyone.** The four lengths are also tappable labels; arrow keys, Home/End and +/− work; the value is spoken ("45 minutes, past the Salt Gallery").
10. **Calm at the default.** At 25 the screen looks complete and says only where he's heading. The extra reach appears only as he raises it (D-033 risk note).

## The three to prototype, and why
- **A — The dial**: the delve's own ring. Setting it is the same object he'll watch, so the control teaches the timer. Closest to the sleep dial and Forest, which people already know.
- **B — The hall slider**: a horizontal track under a painted hall; the light walks further down the hall as he drags. The most literal "how far it takes you", and the easiest thumb movement.
- **C — The flame**: drag up on the clay lamp; it grows from violet at the core to gold at the tip. The most *ours* and the most tactile, like charging something; risk: less obviously a control, so it needs the labels as a hint.

All three are in `directions/d-combined/delve-set.html` (switch A / B / C at the top).
