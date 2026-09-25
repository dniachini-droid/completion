/**
 * The story's clock and the world's answers (MVP.md slice 2; BALANCING.md §2–5; the story job's §0.2 rules).
 * Pure: the fact log + the authored story in, what has played and what is due out. Nothing here is story content.
 *
 * Two clocks (BALANCING §2): time moves the Site (every minute is distance, uncapped); the story keeps its order
 * (beats arrive in a fixed sequence, at most one story week per calendar week). Past the story, effort goes to the
 * open route: camps with a view, passage lines and finds. Never a wall (D-039).
 */
import { calendarWeek } from './time';
import type { Fact, FactOf, FactBody, Rhythm } from './types';
import type { Beat, Carries, Find, Mark, RecordFragment, Seal, StretchId, Story, Token } from './story-types';

/** Minutes of effort between named places reached on foot: 8 steps (BALANCING §1). */
export const PLACE_GAP = 150;
/** The first place is close, so the first Normal day arrives somewhere (the heart's rule, D-064). */
export const FIRST_GAP = 75;
/** Useful Keys a week (BALANCING §3). */
export const KEYS_A_WEEK = 5;
/** The weekly floor: a week with a day complete brings at least this many (§3). */
export const KEY_FLOOR = 2;
/** A long stretch on one job in a day, after which switching brings a find (§1). */
export const LONG_STRETCH = 100;
/** Delves in one sitting that reach a side chamber (§1). */
export const CHAMBER_RUN = 4;

const ofType = <T extends FactBody['type']>(facts: Fact[], type: T) => facts.filter((f): f is FactOf<T> => f.type === type);

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
  /** The stretch Dan is on: the last place's. */
  stretch: StretchId;
  passagesShown: string[];
  campsShown: string[];
  /** Every stretch Dan has set foot in (the route loops back): the story plays only there (D-079). */
  visited: Set<StretchId>;
  /** Keys kept for a sealed thing not yet reached (D-079). */
  held: number;
  /** Marks offered for a guess so far (by a beat played or a sealed thing opened). */
  offered: Set<string>;
}

export function storyState(facts: Fact[], s: Story): StoryState {
  const played = new Set<string>(), opened = new Set<string>(), given = new Set<string>(), guessed = new Map<string, string>();
  const records: string[] = [], passagesShown: string[] = [], campsShown: string[] = [];
  let week = 1, weekBegan: string | null = null, onFoot = 0, stretch: StretchId = s.stretches[0].id, held = 0;
  const visited = new Set<StretchId>([stretch]);
  for (const f of facts) {
    switch (f.type) {
      case 'beatPlayed': played.add(f.id); if (f.passage) passagesShown.push(f.passage); break;
      case 'arrived':
        if (f.kind === 'place') {
          played.add(f.id);
          if (f.how !== 'key') onFoot++;
          const b = beatOf(s, f.id); if (b) { stretch = b.stretch; visited.add(b.stretch); }
        } else campsShown.push(f.id);
        break;
      case 'sealOpened': opened.add(f.seal); break;
      case 'markGuessed': guessed.set(f.mark, f.guess); break;
      case 'findGiven': given.add(f.id); break;
      case 'recordShown': if (!records.includes(f.id)) records.push(f.id); break;
      case 'keyHeld': held++; break;
      case 'keyUsed': held--; break;
      case 'storyWeekBegan': week = f.w; weekBegan = calendarWeek(f.day); break;
    }
  }
  const offered = new Set<string>();
  for (const b of s.beats) if (played.has(b.id)) b.carries?.guess?.forEach(m => offered.add(m));
  for (const x of s.seals) if (opened.has(x.id)) x.carries?.guess?.forEach(m => offered.add(m));
  return { played, opened, guessed, given, records, week, weekBegan, onFoot, stretch, passagesShown, campsShown, visited, held, offered };
}

export const beatOf = (s: Story, id: string): Beat | undefined => s.beats.find(b => b.id === id);
export const sealOf = (s: Story, id: string): Seal | undefined => s.seals.find(x => x.id === id);
export const markOf = (s: Story, id: string): Mark | undefined => s.marks.find(m => m.id === id);
export const recordOf = (s: Story, id: string): RecordFragment | undefined => s.records.find(r => r.id === id);

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

/* ---------- the route: places reached on foot ---------- */

/** Minutes of effort from the start to the next place reached on foot. */
export const nextPlaceAt = (st: StoryState) => st.onFoot === 0 ? FIRST_GAP : FIRST_GAP + st.onFoot * PLACE_GAP;

/**
 * The next named place that can be reached on foot, in route order: this story week's first (places whose req is not
 * met are skipped for now); then, only on a deep push (`push`: a High day, a called push, or Keep going after the day's
 * work), next week's plain places (never a story arrival ahead of its week) (MVP_CONTENT §0.2).
 */
export function nextPlace(s: Story, st: StoryState, push = false): Beat | null {
  for (const rw of s.route) {
    for (const p of rw.places) {
      if (p.k || st.played.has(p.id)) continue;
      const b = beatOf(s, p.id);
      if (!b) continue;
      const ahead = push && rw.w === st.week + 1 && p.id.startsWith('pl-');
      if (!(inWeek(st, b) || ahead)) continue;
      if (b.kind === 'word' && !EARLY.has(b.id) && b.w > st.week) continue;
      if (allMet(st, b.req)) return b;
    }
  }
  return null;
}

/** The camp with a view for a day that completes short of the next place: the stretch's next unused view, then an
    unused one back along the route Dan has walked; once all are used, the one seen longest ago (never the same view
    night after night). */
export function nextCamp(s: Story, st: StoryState): { id: string; find?: string; line?: string } {
  const open = s.camps.filter(c => st.visited.has(c.stretch) && c.w <= st.week && allMet(st, c.req) && !(c.until && met(st, c.until)));
  const ok = open.filter(c => c.stretch === st.stretch);
  const fresh = ok.find(c => !st.campsShown.includes(c.id)) ?? open.find(c => !st.campsShown.includes(c.id));
  if (fresh) return { id: fresh.id, ...('find' in fresh.look ? { find: fresh.look.find } : { line: fresh.look.line }) };
  const last = (id: string) => st.campsShown.lastIndexOf(id);
  const first = [...ok, ...open.filter(c => c.stretch !== st.stretch)].sort((a, b) => last(a.id) - last(b.id))[0]
    ?? s.camps.find(c => c.stretch === st.stretch) ?? s.camps[0];
  return { id: first.id, find: pickFind(s, st, 'camp')?.id };
}

/* ---------- steps: what a job's return shows ---------- */

/** The next ordered step beat (after a main job): this story week's, in table order, each after its arrival. */
export function nextStep(s: Story, st: StoryState): Beat | null {
  /* never about a stretch Dan hasn't been to (D-079) */
  const steps = s.beats.filter(b => b.kind === 'step' && !st.played.has(b.id) && inWeek(st, b) && allMet(st, b.req) && st.visited.has(b.stretch));
  steps.sort((a, b) => a.w - b.w || a.o - b.o);
  return steps[0] ?? null;
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

/** A sealed thing that carries the story: a step or place of its own, a record or a guess (BALANCING §3: story counts first). */
const storySeal = (x: Seal) => !!(x.beat || x.arrival || x.carries?.records?.length || x.carries?.guess?.length);

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

/** The sealed thing the next Key opens: the story's own first (any week up to this one, in order), then the plain ones;
    a surplus opens next week's plain ones. */
export function nextSeal(s: Story, st: StoryState): Seal | null {
  const shut = s.seals.filter(x => !x.seenOnly && !st.opened.has(x.id));
  const order = (a: Seal, b: Seal) => a.w - b.w || a.o - b.o;
  const due = shut.filter(x => x.w <= st.week);
  const early = shut.filter(x => x.w === st.week + 1 && x.plain).sort(order);
  const next = due.filter(storySeal).sort(order)[0] ?? due.filter(x => !storySeal(x)).sort(order)[0] ?? early[0] ?? null;
  /* in the story's own order, and only once it can be reached and seen; otherwise the Key waits (D-079) */
  return next && mayOpen(s, st, next) ? next : null;
}

/** A rhythm's sessions done in the calendar week of `day` (every 2 weeks: in the fortnight). */
export function sessionsIn(facts: Fact[], r: Rhythm, day: string): number {
  const wk = calendarWeek(day);
  return ofType(facts, 'jobDone').filter(f => f.job === r.job && (r.every === 2 ? sameFortnight(calendarWeek(f.day), wk) : calendarWeek(f.day) === wk)).length;
}
const sameFortnight = (a: string, b: string) => Math.floor(Date.parse(a) / (14 * 864e5)) === Math.floor(Date.parse(b) / (14 * 864e5));
/** How many sessions make the rhythm met in its period. */
export const needOf = (r: Rhythm) => r.days ? r.days.length : r.times ?? 1;
export const keysIn = (facts: Fact[], day: string) => ofType(facts, 'keyEarned').filter(f => !f.rhythm.startsWith('floor:') && calendarWeek(f.day) === calendarWeek(day)).length;

/* ---------- finds ---------- */

const stretchOrder = (s: Story) => s.stretches.map(x => x.id);

/** The next find for a reason: the stretch's pool in order, each once, then the stretches back up the route. Side chambers take told lines first. */
export function pickFind(s: Story, st: StoryState, why: string): Find | null {
  const order = stretchOrder(s), at = order.indexOf(st.stretch);
  const ok = (f: Find) => !st.given.has(f.id) && f.w <= st.week && allMet(st, f.req) && !(f.until && met(st, f.until));
  for (let i = at; i >= 0; i--) {
    const pool = s.finds.filter(f => f.stretch === order[i] && ok(f));
    if (!pool.length) continue;
    if (why === 'chamber') { const told = pool.find(f => f.told); if (told) return told; }
    return pool[0];
  }
  for (const id of order) { const f = s.finds.find(x => x.stretch === id && ok(x)); if (f) return f; }
  return null;
}

/* ---------- the story week ---------- */

/** A story week ends when its places and ordered steps have all played (Key rows wait for their Keys). */
export function weekDone(s: Story, st: StoryState): boolean {
  const rw = s.route.find(r => r.w === st.week);
  if (!rw) return false;
  if (!rw.places.every(p => st.played.has(p.id))) return false;
  return s.beats.filter(b => b.w === st.week && b.kind === 'step').every(b => st.played.has(b.id));
}
/** The next story week may begin: this one is done and a later calendar week has begun (at most one a week). */
export const mayAdvance = (s: Story, st: StoryState, day: string) =>
  st.weekBegan !== null && weekDone(s, st) && calendarWeek(day) > st.weekBegan && s.route.some(r => r.w === st.week + 1);

/* ---------- what's in view, and "I can't start" ---------- */

/** The sealed thing ahead that Dan can see: the most recent one brought into view and not yet opened. */
export function inView(s: Story, st: StoryState): Seal | null {
  const ids: string[] = [];
  for (const b of s.beats) if (st.played.has(b.id)) ids.push(...(b.carries?.inView ?? []));
  for (let i = ids.length - 1; i >= 0; i--) { const x = sealOf(s, ids[i]); if (x && !x.seenOnly && !st.opened.has(x.id)) return x; }
  return null;   /* nothing named before it has been seen */
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
  const deep = s.beats.filter(b => b.kind === 'deep' && !st.played.has(b.id) && b.w <= st.week && allMet(st, b.req));
  deep.sort((a, b) => a.w - b.w || a.o - b.o);
  return deep[0] ?? null;
}

/** Everything a beat, seal or find carries, as ids (for writing `recordShown` once). */
export function recordsIn(c: Carries | undefined): string[] { return c?.records ?? []; }
