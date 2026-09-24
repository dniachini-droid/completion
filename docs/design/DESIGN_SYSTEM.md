# Design System

> The look chosen in Phase 4: **direction D, the combined look** (D-032), built from Dan's screen-by-screen picks. Source of truth for values: `directions/d-combined/direction.css`; this page explains them. Spoiler-free.
> Status: **draft for Dan's approval**, 2026-09-24. Mock-up values, not final code (no tech stack until Phase 7).

## The rule in one line
The world is a full-screen painting in violet light; a crisp, precise interface sits on top of it; the day turns from violet to gold.

## World
- **Always full-bleed.** Every screen is a painted scene edge to edge. **Never a scene inside a box or window** (Dan, four times).
- **Painted, not drawn:** lit masses, texture, haze and depth, one light source per scene, one vanishing point. No outlined objects. Strokes belong to the interface only.
- **The Lamp Hall is one painting** (`hall.js`), reused behind morning, word-cutting, camp and the stair, framed by camera position.
- **Nebula fog** drifts slowly on most screens; faster in the delve.
- **The clay lamp is always lit** and is the one warm thing present from the first minute.

## Colour
| Role | Token | Value | Used for |
|---|---|---|---|
| Night | `--night`, `--stone-0…3` | #05050c → #2b2e56 | the dark and the stone |
| Violet (the working day) | `--violet`, `--violet-hi`, `--cold` | #8f86ff, #d9d6ff, #8fa8ff | light in the place, fog, **the main button**, selection |
| Light edges | `--edge…--edge-4` | violet-white at 62% → 10% | boxes, rules, hairlines |
| Gold (the day turned) | `--gold`, `--gold-hi`, `--amber` | #f2c170, #ffe6b8, #e8954a | the arrival, camp, the main button once the day is done |
| Flame | `--flame` | #ffc766 | the clay lamp only |
| Ink | `--ink`, `--ink-2`, `--ink-3` | #f2f3fb, #c7c9e6, #a3a6cc | text; the smallest labels still ≥ 4.5:1 |

**What colour means:** violet is the place and the work in progress. Gold arrives as the day completes: a trace in the morning, the floor at the arrival, the hall at camp. Gold is never used for exits or secondary actions. **No red anywhere.**

## Type
| Role | Face | Where |
|---|---|---|
| The stone speaks | **Cinzel** (carved capitals), letter-spaced | place names, labels ("NEXT ——"), buttons |
| Your own life | **Spectral** (plain print), sentence case | sentences, jobs, times, the daybook |
Sizes: anything that matters ≥ 16 px; carved labels ≥ 14 px. Fonts are open-licence and vendored (`fonts/`).

## Layout
- **One centred column**, 24 px gutter (20 px on small phones), 8 px rhythm. Everything aligns to it; rows of links span edge to edge with equal gaps.
- **Holds at 360 × 780** as well as 390 × 844. The main action sits in the lower third, within thumb reach.
- Content (text, records, marks) sits **in the open** on the scene, washed by soft scrims, not in panels.

## Components
| Piece | What it is |
|---|---|
| **Main button** (`.btn`) | A crisp box of violet light with a fine bright edge and corner brackets; a slow breath. Gold once the day has turned. One per screen. |
| **Quiet button** (`.btn-quiet`) | The same box, unlit. For Swap, Change, secondary choices. |
| **Label with line** (`.label-line`) | "NEXT ——", "AHEAD ——", "THIS MARK ——": carved capitals and a hairline. |
| **Selectable boxes** (`.seg`) | Low / Normal / High, guess choices. The chosen one lights. |
| **Line icon + word** (`.icon-link`) | Map, Satchel, Daybook, Camp. |
| **Boxed panel** (`.box` + `.ticks`) | Only where Dan asked: the map's description, the cut's word. |
| **Job rows** (`.row`, `.pip`) | The day's jobs on hairlines; state on the right ("done this morning", "two delves"). |
| **The ring** | The delve timer (D-028) and the length dial (D-033); the only progress shape in the app. |

## Never
Red; counts of undone things; badges; streak numbers; progress bars; a scene in a frame; outlined illustration; exits styled like the main action; fantasy-speak in the app's own voice (copy is placeholder until the language pass, D-031).
