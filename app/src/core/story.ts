/**
 * The story's clock and the world's answers (MVP.md slice 2; BALANCING.md §2–5; the story job's §0.2 rules).
 * Pure: the fact log + the authored story in, what has played and what is due out. Nothing here is story content.
 *
 * Two clocks (BALANCING §2): time moves the Site (every minute is distance, uncapped); the story keeps its order
 * (beats arrive in a fixed sequence, as fast as Dan works, D-123; the road never waits on a Key, D-129). Past the story, effort goes to the
 * open route: camps with a view, passage lines and finds. Never a wall (D-039).
 */
import { calendarWeek } from './time';
import * as R from './repeat';
import { ofType } from './facts';
import type { Fact, FactOf, FactBody, Rhythm } from './types';
import type { Beat, Carries, Find, Mark, RecordFragment, Seal, StretchId, Story, Token } from './story-types';

/** Minutes of effort between named places reached on foot: 8 steps (BALANCING §1). */
export const PLACE_GAP = 150;
/** The first place is close, so the first Normal day arrives somewhere (the heart's rule, D-064). */
export const FIRST_GAP = 75;
/** Useful Keys a week (BALANCING §3). */
export const KEYS_A_WEEK = 5;
/** A long stretch on one job in a day, after which switching brings a find (§1). */
export const LONG_STRETCH = 100;
/** A job done with less than this behind it (the dial's shortest delve) moves Dan by its minutes and is done, but brings
    no return: no story step, find or Key, and it doesn't count towards the day's completion (rule 10, D-121). */
export const RETURN_MIN = 5;


/* ---------- what has happened in the story ---------- */

export interface StoryState {
  /** Beats and places that have played (arrivals included). */
  played: Set<string>;
  opened: Set<string>;
  guessed: Map<string, string>;
  given: Set<string>;
  /** Records shown, in the order they were first shown. */
  records: string[];
  week: number;
  /** The calendar week (Monday's game day) the current story week began in. */
  weekBegan: string | null;
  /** Places reached on foot (not by a Key), for the distance to the next. */
  onFoot: number;
  /** The stretch Dan is on: the last place he walked to (an evening at camp never moves it, D-154). */
  stretch: StretchId;
  /** That place's id (null before the first). */
  here: string | null;
  /** The way down is open and walked (D-154): from then on a place at home plays as an evening at camp. */
  departed: boolean;
  passagesShown: string[];
  campsShown: string[];
  /** Every stretch Dan has set foot in (the route loops back): the story plays only there (D-079). */
  visited: Set<StretchId>;
  /** Keys kept for a sealed thing not yet reached (D-079). */
  held: number;
  /** Marks offered for a guess so far (by a beat played or a sealed thing opened). */
  offered: Set<string>;
}

/** Whether Dan is past the way in yet: a step at the first stretch played (before it, there is nowhere to camp). */
export const pastMouth = (s: Story, st: StoryState) => s.beats.some(b => b.kind === 'step' && b.stretch === s.stretches[0].id && st.played.has(b.id));
/** A step the story marks as a place's approach (`before`), not yet played when the place is reached: it plays on the
    way, so a place never comes before the walk to it (D-160, the short-day review). */
export function stepBefore(s: Story, st: StoryState, p: Beat): Beat | undefined {
  /* (only the steps the story marks as its approach, `before`: a step set elsewhere on the stretch is never pulled onto a
     place's screen, the round-4 review) */
  return s.beats.find(b => b.kind === 'step' && b.before === p.id && !b.retired && !st.played.has(b.id)
    && !(st.departed && isTop(s, b.stretch)) && b.req.every(r => met(st, r)));
}
/** A moment at the top that a trip back up (an old save's, D-160) plays on its way: a step or a row the road opens, due
    and not yet played, but only one that leads to a place still waiting at the top (else it waits for a job's return). */
export function tripStep(s: Story, st: StoryState, push = false): Beat | undefined {
  const road = roadSeals(s);
  return s.beats.find(b => (b.kind === 'step' || (b.kind === 'stepKey' && !!b.seal && road.has(b.seal) && !st.opened.has(b.seal)))
    && !b.retired && !b.portable && !st.played.has(b.id) && isErrand(s, st, b) && inWeek(st, b) && b.req.every(r => met(st, r))
    && ((after) => { const n = nextPlace(s, after, push); return !!n && isErrand(s, after, n); })({
      ...st, played: new Set([...st.played, b.id]), opened: new Set([...st.opened, ...(b.seal ? [b.seal] : [])]) }));
}
/** The kinds of beat that are places Dan arrives at. */
const PLACE_KINDS = new Set(['arrival', 'arrivalKey', 'word']);
export function storyState(facts: Fact[], s: Story): StoryState {
  const played = new Set<string>(), opened = new Set<string>(), given = new Set<string>(), guessed = new Map<string, string>();
  const records: string[] = [], passagesShown: string[] = [], campsShown: string[] = [];
  let week = 1, weekBegan: string | null = null, onFoot = 0, stretch: StretchId = s.stretches[0].id, held = 0;
  let here: string | null = null, departed = false;
  const visited = new Set<StretchId>([stretch]);
  /* the last place reached on each stretch */
  const lastOn = new Map<StretchId, string>();
  /* the row the road opened last (its moment, a step on the road, moves Dan as a step does; a Key's never does) */
  let road: string | null = null;
  /* the jobs said done, and the last place reached (a job's step moves him only if its job reached no place) */
  const dones: number[] = [];
  let lastArrival = -1;
  for (const f of facts) {
    switch (f.type) {
      case 'beatPlayed': {
        played.add(f.id); if (f.passage) passagesShown.push(f.passage);
        /* a place now that an earlier build played as a step on the way (an old save's, D-160): Dan has been there, so
           he is there, as if he had arrived (never at the top once he has gone down) */
        const b = beatOf(s, f.id);
        /* a step told in a room Dan has been to (a job's moment in one room while he was in another): he went
           there for it, so he is there, and camps there (D-160, the short-day review); never at the top once he has gone
           down, nor a page he carries */
        /* (only a job's own return: a step on the way, played with a place, never moves him off it) */
        /* (nor one whose job also reached a place: its return plays before that place's screen, so the place is where he
           ends up, the round-3 review's B1) */
        const sameJob = dones.length > 0 && lastArrival > (dones[dones.length - 2] ?? -1);
        if (b && f.job !== undefined && !sameJob && (b.kind === 'step' || (b.kind === 'stepKey' && b.seal === road)) && !b.portable && b.stretch !== stretch && lastOn.has(b.stretch) && !(departed && isTop(s, b.stretch))) {
          stretch = b.stretch; here = lastOn.get(b.stretch)!;
        }
        if (b && !b.retired && PLACE_KINDS.has(b.kind) && !(departed && isTop(s, b.stretch)) && s.route.some(r => r.places.some(p => p.id === b.id))) {
          visited.add(b.stretch); stretch = b.stretch; here = b.id; lastOn.set(b.stretch, b.id);
          if (!isHome(s, b.stretch) && b.stretch !== 'st-mouth') departed = true;
        }
        break;
      }
      case 'arrived':
        if (f.kind === 'place') {
          played.add(f.id); lastArrival = f.seq;
          /* an evening costs no walking (D-154); a place reached on foot before evenings existed was walked, and stays so */
          /* (nor a trip back up, an old save's: not walked to, D-160) */
          if (f.how !== 'key' && f.how !== 'evening' && f.how !== 'trip') onFoot++;
          const b = beatOf(s, f.id);
          if (b) {
            visited.add(b.stretch);
            /* where Dan is: the last place walked to; a place at home once the way down is open is an evening (an old save's
               too, whatever it was called then), so it never moves him (D-154) */
            /* (nor a place a Key opened in another area: a trip there he chose, which leaves him where he was, D-160) */
            /* (a place an earlier build had that is a step now, an old save's: he is on its stretch, at the last place there) */
            if (!PLACE_KINDS.has(b.kind)) { if (!(departed && isTop(s, b.stretch)) && lastOn.has(b.stretch)) { stretch = b.stretch; here = lastOn.get(b.stretch)!; } }
            else if (!(f.how === 'evening' || (departed && isTop(s, b.stretch)) || (f.how === 'key' && here !== null && areaOf(s, b.stretch) !== areaOf(s, stretch)))) { stretch = b.stretch; here = b.id; lastOn.set(b.stretch, b.id); }
            if (!isHome(s, b.stretch) && b.stretch !== 'st-mouth') departed = true;
          }
        } else if (f.kind === 'camp') campsShown.push(f.id);
        break;
      case 'jobDone': dones.push(f.seq); break;
      case 'sealOpened': opened.add(f.seal); road = f.how === 'road' ? f.seal : null; break;
      case 'markGuessed': guessed.set(f.mark, f.guess); break;
      case 'findGiven': given.add(f.id); break;
      case 'recordShown': if (!records.includes(f.id)) records.push(f.id); break;
      case 'keyHeld': held++; break;
      case 'keyUsed': held--; break;
      case 'storyWeekBegan': week = f.w; weekBegan = calendarWeek(f.day); break;
    }
  }
  /* what an earlier build's beats already gave an old save: held, as played (D-160) */
  const had = (id: string) => id.startsWith('seal-') ? opened.has(id) : played.has(id);
  /* (a place with a row that a save held this way has seen past: its row counts as open too, or the road would wait on it) */
  for (const b of s.beats) if (!played.has(b.id) && ((b.absorbs?.length && b.absorbs.every(had)) || b.heldBy?.some(had))) { played.add(b.id); if (b.heldBy?.some(had) && b.seal) opened.add(b.seal); }
  const offered = new Set<string>();
  for (const b of s.beats) if (played.has(b.id)) b.carries?.guess?.forEach(m => offered.add(m));
  for (const x of s.seals) if (opened.has(x.id)) x.carries?.guess?.forEach(m => offered.add(m));
  return { played, opened, guessed, given, records, week, weekBegan, onFoot, stretch, here, departed, passagesShown, campsShown, visited, held, offered };
}

/* ---------- the areas (D-154) ---------- */

const stretchOf = (s: Story, id: StretchId) => s.stretches.find(x => x.id === id);
/** The top, where Dan sleeps: the Lamp Hall and the rooms off it. */
export const isHome = (s: Story, id: StretchId) => !!stretchOf(s, id)?.home;
/** The area a stretch is shown as (the Stair's two stretches are one). */
export const areaOf = (s: Story, id: StretchId): StretchId => stretchOf(s, id)?.area ?? id;
/** An area's name, as every screen shows it. */
export const areaName = (s: Story, id: StretchId): string => stretchOf(s, areaOf(s, id))?.name ?? '';
/** Whether a place at the top plays after the way down was taken: only in a save from before D-160, as a told trip back
    up that leaves Dan where he was (D-160: no evenings at camp; the story finishes the top before he leaves it). */
export const isEvening = (_s: Story, _st: StoryState, _b: { stretch: StretchId }) => false;
/** The top: the Lamp Hall and the rooms off it, and the Mouth above them (D-160). */
export const isTop = (s: Story, id: StretchId) => isHome(s, id) || id === 'st-mouth';
/** A place or moment at the top, once Dan has gone down: a trip back up (D-160), never where he camps. */
export const isErrand = (s: Story, st: StoryState, b: { stretch: StretchId }) => st.departed && isTop(s, b.stretch);

export const beatOf = (s: Story, id: string): Beat | undefined => s.beats.find(b => b.id === id);
export const sealOf = (s: Story, id: string): Seal | undefined => s.seals.find(x => x.id === id);
export const markOf = (s: Story, id: string): Mark | undefined => s.marks.find(m => m.id === id);
export const recordOf = (s: Story, id: string): RecordFragment | undefined => s.records.find(r => r.id === id);
/** The record a story week's morning points back to (its camp line's `morningRecord`), if Dan holds it; else null
    (deep review S#13). `morning` is the morning's id, `b-wN.morning`. */
export function morningRecord(s: Story, morning: string, held: readonly string[]): string | null {
  const id = beatOf(s, morning.replace(/\.morning$/, '.camp'))?.morningRecord;
  return id && held.includes(id) ? id : null;
}
/** Which of the records kept in one place this is (the notebook's pages, the log's entries), 1 on, in the story's order;
    null when it is the only one there. Their titles differ by it (the flow review, L C3). */
export function recordNumber(s: Story, id: string): number | null {
  const r = recordOf(s, id);
  if (!r) return null;
  const same = s.records.filter(x => x.where.toLowerCase() === r.where.toLowerCase());
  return same.length > 1 ? same.indexOf(r) + 1 : null;
}

/** Whether an id in a `req` list is satisfied: a beat or place played, a seal opened, a mark offered (a guess is
    optional, so the story never waits on one; the word asks it before the first tap), a find given. */
export function met(st: StoryState, id: string): boolean {
  if (id.startsWith('seal-')) return st.opened.has(id);
  if (id.startsWith('mk-')) return st.guessed.has(id) || st.offered.has(id);
  if (id.startsWith('fd-')) return st.given.has(id);
  return st.played.has(id);
}
const allMet = (st: StoryState, req: string[]) => req.every(r => met(st, r));

/** Beats that may play a story week early, as soon as their req is met (the first word, weeks 2–3, D-013). */
const EARLY = new Set(['b-3.A']);
const inWeek = (st: StoryState, b: { id: string; w: number }) => b.w <= st.week || (EARLY.has(b.id) && b.w === st.week + 1);

/* ---------- the road and the niches (D-129) ---------- */

const roadCache = new WeakMap<Story, Set<string>>();
/**
 * The sealed rows the road takes with it (Dan, D-129, option C): opened on foot, in the story's order, with no Key. They
 * are the rows that play a place on the route, the ones that carry a sign to guess (signs come in the story's order,
 * never late, D-013), and every row something on the road needs first (a place, a step, a word, a stretch, or a road
 * row's own step): the story's main line never waits on the calendar. Every other row (the niches: a record, an object,
 * a line, a side step) opens only with a Key, as before.
 */
export function roadSeals(s: Story): Set<string> {
  const hit = roadCache.get(s);
  if (hit) return hit;
  const road = new Set<string>();
  const needs: string[] = [];
  const need = (ids: string[]) => { for (const r of ids) needs.push(r); };
  const places = new Set(s.route.flatMap(r => r.places.map(p => p.id)));
  for (const b of s.beats) if (places.has(b.id) || b.kind === 'step' || b.kind === 'word') need([b.id, ...b.req]);
  for (const w of s.words) need(w.req);
  for (const x of s.stretches) need(x.req);
  const offers = (x: Seal) => [...(x.carries?.guess ?? []), ...(x.beat ? beatOf(s, x.beat)?.carries?.guess ?? [] : [])];
  const take = (x: Seal) => {
    if (road.has(x.id) || x.seenOnly) return;
    road.add(x.id);
    const b = beatOf(s, x.beat ?? x.arrival ?? '');
    if (b) need(b.req);
  };
  /* a row that settles a sign the road offers comes in the sign's order too (a guess is never left standing) */
  const settles = (x: Seal) => x.beat ? s.marks.some(m => m.confirmedBy === x.beat) : false;
  for (const x of s.seals) if ((x.arrival && places.has(x.arrival)) || offers(x).length || x.road || settles(x)) take(x);
  const seen = new Set<string>();
  while (needs.length) {
    const id = needs.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const b = beatOf(s, id);
    if (b) { need(b.req); if (b.seal) { const x = sealOf(s, b.seal); if (x) take(x); } }
    const x = id.startsWith('seal-') ? sealOf(s, id) : undefined;
    if (x) take(x);
    /* a mark the road needs comes with the row that offers it */
    if (id.startsWith('mk-')) for (const y of s.seals) if (offers(y).includes(id)) take(y);
  }
  roadCache.set(s, road);
  return road;
}
/** Whether a sealed row opens on the road, with no Key (D-129). */
export const onRoad = (s: Story, id: string | undefined) => !!id && roadSeals(s).has(id);
/** A road row opens in the order Keys opened it (story week, then row), so a place never comes before the sign it
    confirms, or a row before the one it follows (D-129). */
const roadTurn = (s: Story, st: StoryState, x: Seal) =>
  s.seals.every(y => !onRoad(s, y.id) || st.opened.has(y.id) || y.w > x.w || (y.w === x.w && y.o >= x.o));

/* ---------- the route: places reached on foot ---------- */

/** Minutes of effort from the start to the next place reached on foot. */
export const nextPlaceAt = (st: StoryState) => st.onFoot === 0 ? FIRST_GAP : FIRST_GAP + st.onFoot * PLACE_GAP;
/** Minutes of effort from the start to the last place reached on foot (0 before the first). */
export const lastPlaceAt = (st: StoryState) => st.onFoot === 0 ? 0 : FIRST_GAP + (st.onFoot - 1) * PLACE_GAP;
/** The side chamber on the road: halfway between the last place reached on foot and the next, the same distance
    whatever the delves' lengths or jobs (Dan, D-122). */
export const chamberAt = (st: StoryState) => Math.ceil((lastPlaceAt(st) + nextPlaceAt(st)) / 2);

/**
 * The next named place that can be reached on foot, in route order: this story week's first (places whose req is not
 * met are skipped for now); then next week's plain places (never a story arrival ahead of its week) (MVP_CONTENT §0.2).
 * A place a Key used to play is on foot too (D-129).
 */
export function nextPlace(s: Story, st: StoryState, _push = false): Beat | null {
  for (const rw of s.route) {
    for (const p of rw.places) {
      if (st.played.has(p.id)) continue;
      const b = beatOf(s, p.id);
      if (!b) continue;
      /* a place a Key used to play is reached on foot now, once its sealed thing could be opened (D-129) */
      if (p.k) {
        const x = b.seal ? sealOf(s, b.seal) : undefined;
        if (x && st.opened.has(x.id)) continue;
        if (x && (!mayOpen(s, st, x) || !roadTurn(s, st, x))) return null;
      }
      /* next week's plain places may come early, but only the next one along the way, in the area Dan is in (D-123, D-154) */
      const ahead = rw.w === st.week + 1 && p.id.startsWith('pl-') && areaOf(s, b.stretch) === areaOf(s, st.stretch);
      if (!(inWeek(st, b) || ahead)) return null;
      if (b.kind === 'word' && !EARLY.has(b.id) && b.w > st.week) return null;
      /* never skipped for a place further on, in another area: what it waits for plays on the way (D-129) */
      return allMet(st, b.req) ? b : null;
    }
  }
  return null;
}

/** No evenings at camp (D-160): kept for an old save's evening, read again, only. */
export const nextEvening = (_s: Story, _st: StoryState): Beat | null => null;
/** The story moments an old save's evening at camp held, read again (D-154, D-160): at the top. */
export const eveningMoment = (s: Story, id: string) => { const b = beatOf(s, id) ?? lineRow(s, id); return !!b && isHome(s, b.stretch); };
const lineRow = (s: Story, id: string) => { const x = sealOf(s, id); return x && !x.beat && !x.arrival ? { id: x.id, stretch: x.stretch } : undefined; };

/** Where Dan camps when he goes to sleep (D-160): where he is. At a view of the place he last reached (its `near`), one he
    hasn't camped at yet (one that stops being offered first, so it isn't lost); else at that place itself. Never a view at
    the top once he has gone down, and never one of another place: the camp is always where Today says he is. */
export function campHere(s: Story, st: StoryState, _sinceLast = 0): { at: 'place'; id: string } | { at: 'view'; id: string; find?: string; line?: string } {
  /* before the first place: past the way in, at a view of the first stretch (a short first day, D-160) */
  if (!st.here) { const m = s.camps.filter(c => c.stretch === s.stretches[0].id && !c.near), v = m.find(c => !st.campsShown.includes(c.id)) ?? m[m.length - 1] ?? s.camps[0]; return { at: 'view', id: v.id, ...viewLook(v) }; }
  /* (a place folded into another since, where an old save stands: the views of the places he has reached on its stretch) */
  const hb = beatOf(s, st.here);
  /* (the latest such place in route order: the one he is nearest, the round-4 review) */
  const latest = hb?.retired ? s.route.flatMap(r => r.places).filter(p => beatOf(s, p.id)?.stretch === hb.stretch && st.played.has(p.id)).pop()?.id : undefined;
  const at = new Set([hb?.retired && latest ? latest : st.here]);
  const near = s.camps.filter(c => !!c.near && at.has(c.near) && c.w <= st.week && allMet(st, c.req) && !(c.until && met(st, c.until))
    && !(st.departed && isTop(s, c.stretch)));
  const fresh = near.filter(c => !st.campsShown.includes(c.id));
  const pick = fresh.find(c => c.until) ?? fresh[0];
  if (pick) return { at: 'view', id: pick.id, ...viewLook(pick) };
  /* all used: the one camped at longest ago, said again briefly (never a bare night, the review's round 2) */
  const last = (id: string) => st.campsShown.lastIndexOf(id);
  const again = [...near].sort((a, b) => last(a.id) - last(b.id))[0];
  return again ? { at: 'view', id: again.id } : { at: 'place', id: st.here };
}
const viewLook = (c: { look: { find: string } | { line: string } }) => 'find' in c.look ? { find: c.look.find } : { line: c.look.line };

/* ---------- steps: what a job's return shows ---------- */

/** The next ordered step beat (after a main job): this story week's, in table order, each after its arrival. */
export function nextStep(s: Story, st: StoryState): Beat | null {
  return candidateSteps(s, st)[0] ?? null;
}
function candidateSteps(s: Story, st: StoryState): Beat[] {
  /* never about a stretch Dan hasn't been to (D-079); a road row's step plays in its turn, with no Key (D-129), and a
     road row with only a line plays as a step of its own */
  const lineRows: Beat[] = s.seals.filter(x => !x.beat && !x.arrival && onRoad(s, x.id))
    .map(x => ({ id: x.id, kind: 'stepKey', w: x.w, o: x.o, seal: x.id, req: [], stretch: x.stretch }));
  /* (never a retired one: off the route, kept only for old saves' facts, D-160) */
  const steps = [...s.beats, ...lineRows].filter(b => !b.retired && (b.kind === 'step' || roadStep(s, st, b)) && !st.played.has(b.id) && inWeek(st, b) && allMet(st, b.req) && st.visited.has(b.stretch));
  steps.sort((a, b) => a.w - b.w || a.o - b.o);
  return steps;
}

/** A step a Key used to play, whose row the road now opens: once its sealed thing could be opened (D-129). */
function roadStep(s: Story, st: StoryState, b: Beat): boolean {
  if (b.kind !== 'stepKey' || !onRoad(s, b.seal)) return false;
  const x = sealOf(s, b.seal!);
  return !!x && !st.opened.has(x.id) && mayOpen(s, st, x) && roadTurn(s, st, x);
}

/**
 * The story's bits that play on the way to the next place (Dan, D-129: long days never hold a place back). When the
 * minutes have reached the next place and only story bits stand between (a step, or a road row), the next ones in
 * order (as many as stand in the way, across a story week's end) play as Dan walks on and show on that place's arrival, with their records, choices and settled
 * guesses. Null if nothing so near would open the way.
 */
export function onTheWay(s: Story, st: StoryState): Beat[] | null { const w = wayTo(s, st); return w && w.bits.length ? w.bits : null; }
/** The next place Dan is walking to: the next place in reach, or the one the story bits on the way will open (D-129). */
export const placeAhead = (s: Story, st: StoryState): Beat | null => nextPlace(s, st) ?? wayTo(s, st)?.place ?? null;
function wayTo(s: Story, st: StoryState): { bits: Beat[]; place: Beat } | null {
  let t = st;
  const out: Beat[] = [];
  /* as many bits as stand in the way, across a story week's end (bounded by the story's own steps) */
  for (let k = 0; k < s.beats.length + s.seals.length; k++) {
    const place = nextPlace(s, t);
    /* (with nothing between: the next place, a story week on, D-160) */
    if (place) return { bits: out, place };
    const b = nextStep(s, t);
    if (!b) {
      if (weekDone(s, t) && s.route.some(r => r.w === t.week + 1)) { t = { ...t, week: t.week + 1 }; continue; }
      return null;
    }
    out.push(b);
    const x = b.kind === 'stepKey' ? sealOf(s, b.seal!) : undefined;
    const played = new Set(t.played); played.add(b.id);
    const opened = new Set(t.opened); if (x) opened.add(x.id);
    const offered = new Set(t.offered);
    [...(x?.carries?.guess ?? []), ...(b.carries?.guess ?? [])].forEach(m => offered.add(m));
    t = { ...t, played, opened, offered };
  }
  return null;
}

/** A passage line for where Dan is, never repeating on a stretch until its list is used (the open route, §5). */
export function nextPassage(s: Story, st: StoryState): string | null {
  const here = s.passages.filter(p => p.stretch === st.stretch && allMet(st, p.req) && !(p.until && met(st, p.until)));
  if (!here.length) return null;
  /* the first not yet shown; once all have been, the one shown longest ago (a list that grows never repeats early) */
  const fresh = here.find(p => !st.passagesShown.includes(p.id));
  if (fresh) return fresh.id;
  const last = (id: string) => st.passagesShown.lastIndexOf(id);
  return here.reduce((a, b) => (last(b.id) < last(a.id) ? b : a)).id;
}

/* ---------- Keys ---------- */


/**
 * Whether a Key may open this sealed thing now: if a beat brings it into view, that beat has played (MVP_CONTENT §0.2);
 * a place its Key plays waits for that place's own req; anything else waits until Dan has been where it is (D-079).
 */
export function mayOpen(s: Story, st: StoryState, x: Seal): boolean {
  const by = s.beats.filter(b => b.carries?.inView?.includes(x.id));
  if (by.length && !by.some(b => st.played.has(b.id))) return false;
  if (x.arrival) { const b = beatOf(s, x.arrival); return !b || allMet(st, b.req); }
  return st.visited.has(x.stretch);
}

/** The niches a Key can open now, wherever they are: shut, seen, reached, and of a story week begun (a plain one of
    next week too, as a surplus Key opened it before): one of a later week never opens on a stretch the route only loops
    back to (rule 5). Chosen on the Map, or where Dan is (D-142, D-143 A). None depends on another (a rule test pins it),
    so Dan may open them in any order. */
export function openable(s: Story, st: StoryState): Seal[] {
  return s.seals.filter(x => !x.seenOnly && !st.opened.has(x.id) && !onRoad(s, x.id) && (x.w <= st.week || (x.plain && x.w === st.week + 1))
    && mayOpen(s, st, x)).sort((a, b) => a.w - b.w || a.o - b.o);
}
/** The locked things the Map shows on a stretch (D-143 A, one definition with Today's link): every niche a Key can open
    there now, and any other the story has brought into view there, still shut (it says "needs a Key"). */
export function lockedOn(s: Story, st: StoryState, where: StretchId): Seal[] {
  const open = openable(s, st).filter(x => x.stretch === where), ids = new Set(open.map(x => x.id));
  const seen = s.seals.filter(x => x.stretch === where && !ids.has(x.id) && !x.seenOnly && !st.opened.has(x.id) && !onRoad(s, x.id)
    && s.beats.some(b => st.played.has(b.id) && b.carries?.inView?.includes(x.id)));
  return [...open, ...seen].sort((a, b) => a.w - b.w || a.o - b.o);
}
/** The niches a Key has opened (never the road's own rows, which play as steps and places), in the order opened: each
    can be read again from the Map under its stretch (D-143 B). */
export function openedNiches(s: Story, facts: Fact[]): Seal[] {
  const out: Seal[] = [];
  for (const f of facts) if (f.type === 'sealOpened' && f.how !== 'road') { const x = sealOf(s, f.seal); if (x && !onRoad(s, x.id) && !out.includes(x)) out.push(x); }
  return out;
}

/** A rhythm's sessions done in the calendar week of `day` (every 2 weeks: in the fortnight). */
/** Sessions of a rhythm done in its period containing `day` (core/repeat.ts, D-114). */
export const sessionsIn = R.sessionsIn;
/** How many sessions make the rhythm met in its period. */
export const needOf = R.needOf;
export const keysIn = (facts: Fact[], day: string) => ofType(facts, 'keyEarned').filter(f => !f.rhythm.startsWith('floor:') && calendarWeek(f.for ?? f.day) === calendarWeek(day)).length;

/* ---------- finds ---------- */

const stretchOrder = (s: Story) => s.stretches.map(x => x.id);

/** The next find for a reason: the stretch's pool in order, each once, then the stretches back up the route. Side chambers take told lines first. */
export function pickFind(s: Story, st: StoryState, why: string, at0?: StretchId): Find | null {
  const order = stretchOrder(s), at = order.indexOf(st.stretch);
  /* `at`: only a find on that stretch (a stop at a day's end shows what is there, never a thing out of sight, D-154) */
  const ok = (f: Find) => !st.given.has(f.id) && f.w <= st.week && allMet(st, f.req) && !(f.until && met(st, f.until))
    && (!at0 || f.stretch === at0);
  /* never from the top once Dan has gone down (D-160): what he notices is where he is */
  const away = (id: StretchId) => st.departed && isTop(s, id);
  /* at the top, before he goes down: any of its rooms he has been in, the earliest first, so its finds come before he
     leaves them for good (D-160) */
  if (!st.departed && !at0) {
    /* (one that hands over a record first, so no record is left behind at the top; then one in the room he is in) */
    const inRoom = (f: Find) => areaOf(s, f.stretch) === areaOf(s, st.stretch);
    const top = s.finds.filter(f => ok(f) && st.visited.has(f.stretch) && isTop(s, f.stretch))
      .sort((a, b) => (+!inRoom(a) - +!inRoom(b)) || (+!a.told - +!b.told) || a.w - b.w);
    if (why === 'chamber') { const told = top.find(f => f.told); if (told) return told; }
    if (top.length) return top[0];
  }
  /* only in the area he is in: a find describes what is in front of him, never a thing a flight or a lake away (D-160) */
  const here = (id: StretchId) => areaOf(s, id) === areaOf(s, st.stretch);
  for (let i = at; i >= 0; i--) {
    if (away(order[i]) || !here(order[i])) continue;
    const pool = s.finds.filter(f => f.stretch === order[i] && ok(f));
    if (!pool.length) continue;
    if (why === 'chamber') { const told = pool.find(f => f.told); if (told) return told; }
    return pool[0];
  }
  /* never a find from an area Dan has not reached: it would describe a place before he is there */
  for (const id of order) { if (!st.visited.has(id) || away(id) || !here(id)) continue; const f = s.finds.find(x => x.stretch === id && ok(x)); if (f) return f; }
  return null;
}

/* ---------- the story week ---------- */

/** A story week ends when its places and ordered steps have all played, the road's rows among them; the niches wait
    for Keys without holding the story (D-129). */
/** A route place is behind Dan: reached, or (a place a sealed row plays) its row already open in an old save, so it never
    plays now (D-160: an old save that opened the salt's crust before it was a place) */
export const placeDone = (s: Story, st: StoryState, p: { id: string; k?: boolean }) =>
  st.played.has(p.id) || (!!p.k && ((x) => !!x && st.opened.has(x.id))(sealOf(s, beatOf(s, p.id)?.seal ?? '')));
export function weekDone(s: Story, st: StoryState): boolean {
  const rw = s.route.find(r => r.w === st.week);
  if (!rw) return false;
  /* nothing trails: the top is finished before Dan leaves it (D-160) */
  if (!rw.places.every(p => placeDone(s, st, p))) return false;
  return s.beats.filter(b => b.w === st.week && b.kind === 'step' && !b.retired).every(b => st.played.has(b.id))
    && s.seals.every(x => x.w !== st.week || !onRoad(s, x.id) || st.opened.has(x.id));
}
/** The next story week may begin as soon as this one is done: no calendar-week wait, so more work is never held back
    (Dan, D-123; was at most one story week a calendar week). */
export const mayAdvance = (s: Story, st: StoryState, _day?: string) =>
  st.weekBegan !== null && weekDone(s, st) && s.route.some(r => r.w === st.week + 1);

/* ---------- what's in view, and "I can't start" ---------- */

/** The sealed thing ahead that Dan can see: the most recent one brought into view and not yet opened; with `where`, one
    in that stretch first (the one Dan is in: a thing behind him is never called "ahead", D-143). */
export function inView(s: Story, st: StoryState, where?: StretchId): Seal | null {
  const ids: string[] = [];
  for (const b of s.beats) if (st.played.has(b.id)) ids.push(...(b.carries?.inView ?? []));
  const shut = ids.map(id => sealOf(s, id)).filter((x): x is Seal => !!x && !x.seenOnly && !st.opened.has(x.id));
  /* (in the area Dan is in: a lock on another stretch of it is not "behind", D-154) */
  return (where ? shut.filter(x => areaOf(s, x.stretch) === areaOf(s, where)).pop() : undefined) ?? shut.pop() ?? null;   /* nothing named before it has been seen */
}

export function teaser(s: Story, st: StoryState): string | null {
  const ok = s.teasers.filter(x => x.w <= st.week && allMet(st, x.req) && !(x.until && met(st, x.until)));
  return ok.length ? ok[ok.length - 1].line : null;
}

/* ---------- reading: the marks Dan holds (SCRIPT §8.2, §9; the story job's §6) ---------- */

/**
 * A mark as Dan holds it. A guess reads with a question mark until the place confirms it. When the confirming beat
 * plays, a right guess holds; the tempting wrong one is struck (one line on the marks screen) and the mark reads as
 * what it is; a mark never guessed is learned from the place all the same (failure is information, rule 9).
 * A provisional mark's confirming beat only strikes the tempting guess: its right ones stay guesses (SCRIPT §7.6).
 */
export interface MarkHeld {
  /** Dan's guess, if he made one. */
  guess: string | null;
  right: boolean;
  confirmed: boolean;
  struck: boolean;
  /** What it reads as now, in a list of marks (the guess, or its meaning once confirmed). */
  word: string;
  /** Still a guess: shown with a question mark. */
  asGuess: boolean;
}

export function markHeld(m: Mark, st: StoryState): MarkHeld | null {
  const guess = st.guessed.get(m.id) ?? null;
  const confirmed = !!m.confirmedBy && met(st, m.confirmedBy);
  if (guess === null && !confirmed) return null;
  const right = guess === null || !m.right || m.right.includes(guess);
  const struck = confirmed && guess !== null && !right;
  const truth = m.candidates?.[0] ?? m.sign.toLowerCase();
  if (!confirmed) return { guess, right, confirmed, struck, word: guess!, asGuess: true };
  if (m.provisional) return { guess, right, confirmed, struck, word: right && guess ? guess : truth, asGuess: true };
  return { guess, right, confirmed, struck, word: right && guess ? guess : truth, asGuess: false };
}

export function marksHeld(s: Story, st: StoryState): Map<string, MarkHeld> {
  const out = new Map<string, MarkHeld>();
  for (const m of s.marks) { const h = markHeld(m, st); if (h) out.set(m.id, h); }
  return out;
}

export type Rendered = { t: 'word'; text: string; guess: boolean } | { t: 'glyph'; mark: string } | { t: 'pic'; text: string } | { t: 'ring' } | { t: 'hand'; who: string } | { t: 'p'; text: string };

/** Each token as Dan can read it now: a held sign as its English (a guess with a question mark), otherwise its glyph. */
export function render(tokens: Token[], held: Map<string, MarkHeld>, s: Story): Rendered[] {
  return tokens.map((tk): Rendered => {
    if ('ring' in tk) return tk.en && tk.s?.every(x => { const h = held.get(x); return h && h.right && !h.asGuess; }) ? { t: 'word', text: tk.en, guess: false } : { t: 'ring' };
    if ('s' in tk) {
      const h = held.get(tk.s);
      if (!h) return { t: 'glyph', mark: tk.s };
      /* a right guess, or a confirmed mark, reads as this record's own English; an unconfirmed wrong guess as itself */
      return h.right || h.confirmed ? { t: 'word', text: tk.en, guess: h.asGuess } : { t: 'word', text: h.guess!, guess: true };
    }
    if ('pic' in tk) return { t: 'pic', text: tk.pic };
    if ('hand' in tk) return { t: 'hand', who: tk.hand };
    return { t: 'p', text: tk.p };
  });
}

/* ---------- the marks screen: every mark seen (SCRIPT §9; mock-up record.html) ---------- */

export interface MarkSeen {
  id: string;
  /** held: confirmed; guess: guessed, not yet confirmed; open: may be guessed now; seen: not known yet; name: a ring;
      part: only an element of it has been seen (a deep push's partial sign). */
  state: 'held' | 'guess' | 'open' | 'seen' | 'name' | 'part';
  held: MarkHeld | null;
  /** The element seen alone, if a partial sign of it was found. */
  part: string | null;
  /** The struck line, if Dan's guess was struck. */
  struck: string | null;
}

/** Where each mark was first offered for a guess, and the partial signs and marks seen, from what has played. */
function carriedMarks(s: Story, st: StoryState) {
  const offered = new Set<string>(), seen = new Set<string>(), partOf = new Map<string, string>();
  const take = (c: Carries | undefined) => {
    c?.guess?.forEach(m => offered.add(m));
    c?.seen?.forEach(m => { seen.add(m); if (c.partial) partOf.set(m, c.partial); });
  };
  for (const b of s.beats) if (st.played.has(b.id)) take(b.carries);
  for (const x of s.seals) if (st.opened.has(x.id)) take(x.carries);
  return { offered, seen, partOf };
}

/** The marks cut in some records (a guessable mark's id, once each, in order). */
export function marksIn(s: Story, records: string[]): string[] {
  const out: string[] = [];
  for (const r of records) for (const line of recordOf(s, r)?.cut ?? []) for (const tk of line)
    if ('s' in tk && typeof tk.s === 'string' && !out.includes(tk.s) && markOf(s, tk.s)?.candidates?.length) out.push(tk.s);
  return out;
}
/** Where each mark was first seen: the first place reached whose records carry it (D-077: a guess points back to it). */
export function seenAt(s: Story, places: string[]): Map<string, string> {
  const out = new Map<string, string>();
  for (const id of places) {
    const b = beatOf(s, id);
    for (const m of marksIn(s, b?.carries?.records ?? [])) if (!out.has(m)) out.set(m, id);
  }
  return out;
}

/** Every mark Dan has met, in the order he met it: in a record shown, offered for a guess, seen, or a part of it. */
export function marksSeen(s: Story, st: StoryState): MarkSeen[] {
  const { offered, seen, partOf } = carriedMarks(s, st);
  const order: string[] = [];
  const add = (id: string) => { if (!order.includes(id) && markOf(s, id)) order.push(id); };
  for (const r of st.records) {
    const rec = recordOf(s, r);
    for (const line of rec?.cut ?? []) for (const tk of line) {
      if ('ring' in tk) add('mk-ring');
      else if ('s' in tk) add(tk.s);
      else if ('hand' in tk && tk.hand === 'his') add('mk-hand');   /* his hand-mark; hers is another shape (b-2.B) */
    }
  }
  for (const m of s.marks) if (offered.has(m.id) || seen.has(m.id) || st.guessed.has(m.id)) add(m.id);
  return order.map((id): MarkSeen => {
    const m = markOf(s, id)!, held = markHeld(m, st);
    const struck = held?.struck ? m.struck ?? null : null;
    const part = !held && !offered.has(id) ? partOf.get(id) ?? null : null;
    let state: MarkSeen['state'];
    /* a recognised mark is named once the story points it out (the ring, from the first); until then it is a shape */
    if (m.recognised && (id === 'mk-ring' || seen.has(id) || offered.has(id))) state = 'name';
    else if (held) state = held.asGuess ? 'guess' : 'held';
    else if (offered.has(id) && m.candidates?.length) state = 'open';
    else if (part) state = 'part';
    else state = 'seen';
    return { id, state, held, part, struck };
  });
}

/** May Dan guess (or change his guess at) this mark now? Offered, has candidates, and not yet confirmed. */
export function mayGuess(s: Story, st: StoryState, id: string): boolean {
  const m = markOf(s, id);
  if (!m?.candidates?.length || (m.confirmedBy && met(st, m.confirmedBy))) return false;
  return carriedMarks(s, st).offered.has(id) || st.guessed.has(id);
}

/** The marks a beat (or a sealed thing's step) settles when it plays: each guess held, or struck with its line. */
export function settledBy(s: Story, st: StoryState, beat: string): { mark: string; held: MarkHeld; struck: string | null }[] {
  return s.marks.filter(m => m.confirmedBy === beat).flatMap(m => {
    const h = markHeld(m, st);
    if (!h || h.guess === null) return [];   /* only a guess settles; a mark never guessed is simply learned */
    if (m.provisional && !h.struck) return [];
    return [{ mark: m.id, held: h, struck: h.struck ? m.struck ?? null : null }];
  });
}

/* ---------- the deep push (a High day): places a normal day doesn't reach, sometimes part of a sign ---------- */

/** The next deep beat that may play: this story week's, in order, its req met. */
export function nextDeep(s: Story, st: StoryState): Beat | null {
  /* never one at the top once Dan has gone down (D-160): a deep push is where he is */
  const deep = s.beats.filter(b => b.kind === 'deep' && !b.retired && !st.played.has(b.id) && b.w <= st.week && allMet(st, b.req) && !(st.departed && isTop(s, b.stretch)));
  deep.sort((a, b) => a.w - b.w || a.o - b.o);
  return deep[0] ?? null;
}

/** Everything a beat, seal or find carries, as ids (for writing `recordShown` once). */
export function recordsIn(c: Carries | undefined): string[] { return c?.records ?? []; }
