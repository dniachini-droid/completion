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
export const PLACE_GAP = 200;
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
}

export function storyState(facts: Fact[], s: Story): StoryState {
  const played = new Set<string>(), opened = new Set<string>(), given = new Set<string>(), guessed = new Map<string, string>();
  const records: string[] = [], passagesShown: string[] = [], campsShown: string[] = [];
  let week = 1, weekBegan: string | null = null, onFoot = 0, stretch: StretchId = s.stretches[0].id;
  for (const f of facts) {
    switch (f.type) {
      case 'beatPlayed': played.add(f.id); if (f.passage) passagesShown.push(f.passage); break;
      case 'arrived':
        if (f.kind === 'place') {
          played.add(f.id);
          if (f.how !== 'key') onFoot++;
          const b = beatOf(s, f.id); if (b) stretch = b.stretch;
        } else campsShown.push(f.id);
        break;
      case 'sealOpened': opened.add(f.seal); break;
      case 'markGuessed': guessed.set(f.mark, f.guess); break;
      case 'findGiven': given.add(f.id); break;
      case 'recordShown': if (!records.includes(f.id)) records.push(f.id); break;
      case 'storyWeekBegan': week = f.w; weekBegan = calendarWeek(f.day); break;
    }
  }
  return { played, opened, guessed, given, records, week, weekBegan, onFoot, stretch, passagesShown, campsShown };
}

export const beatOf = (s: Story, id: string): Beat | undefined => s.beats.find(b => b.id === id);
export const sealOf = (s: Story, id: string): Seal | undefined => s.seals.find(x => x.id === id);
export const markOf = (s: Story, id: string): Mark | undefined => s.marks.find(m => m.id === id);
export const recordOf = (s: Story, id: string): RecordFragment | undefined => s.records.find(r => r.id === id);

/** Whether an id in a `req` list is satisfied: a beat or place played, a seal opened, a mark guessed, a find given. */
export function met(st: StoryState, id: string): boolean {
  if (id.startsWith('seal-')) return st.opened.has(id);
  if (id.startsWith('mk-')) return st.guessed.has(id);
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
 * met are skipped for now); then, as a deep push, next week's plain places (never a story arrival ahead of its week).
 */
export function nextPlace(s: Story, st: StoryState): Beat | null {
  for (const rw of s.route) {
    for (const p of rw.places) {
      if (p.k || st.played.has(p.id)) continue;
      const b = beatOf(s, p.id);
      if (!b) continue;
      const ahead = rw.w === st.week + 1 && p.id.startsWith('pl-');
      if (!(inWeek(st, b) || ahead)) continue;
      if (b.kind === 'word' && !EARLY.has(b.id) && b.w > st.week) continue;
      if (allMet(st, b.req)) return b;
    }
  }
  return null;
}

/** The camp with a view for a day that completes short of the next place: the stretch's next unused view. */
export function nextCamp(s: Story, st: StoryState): { id: string; find?: string; line?: string } {
  const ok = s.camps.filter(c => c.stretch === st.stretch && c.w <= st.week && allMet(st, c.req) && !(c.until && met(st, c.until)));
  const fresh = ok.find(c => !st.campsShown.includes(c.id));
  if (fresh) return { id: fresh.id, ...('find' in fresh.look ? { find: fresh.look.find } : { line: fresh.look.line }) };
  const first = ok[0] ?? s.camps.find(c => c.stretch === st.stretch) ?? s.camps[0];
  return { id: first.id, find: pickFind(s, st, 'camp')?.id };
}

/* ---------- steps: what a job's return shows ---------- */

/** The next ordered step beat (after a main job): this story week's, in table order, each after its arrival. */
export function nextStep(s: Story, st: StoryState): Beat | null {
  const steps = s.beats.filter(b => b.kind === 'step' && !st.played.has(b.id) && inWeek(st, b) && allMet(st, b.req));
  steps.sort((a, b) => a.w - b.w || a.o - b.o);
  return steps[0] ?? null;
}

/** A passage line for where Dan is, never repeating on a stretch until its list is used (the open route, §5). */
export function nextPassage(s: Story, st: StoryState): string | null {
  const here = s.passages.filter(p => p.stretch === st.stretch && allMet(st, p.req) && !(p.until && met(st, p.until)));
  if (!here.length) return null;
  const used = st.passagesShown.filter(id => here.some(p => p.id === id)).length;
  return here[used % here.length].id;
}

/* ---------- Keys ---------- */

/** The sealed thing the next Key opens: the story's own first, in order; a surplus opens next week's plain ones. */
export function nextSeal(s: Story, st: StoryState): Seal | null {
  const shut = s.seals.filter(x => !x.seenOnly && !st.opened.has(x.id));
  const due = shut.filter(x => x.w <= st.week).sort((a, b) => a.w - b.w || a.o - b.o);
  if (due.length) return due[0];
  const early = shut.filter(x => x.w === st.week + 1 && x.plain).sort((a, b) => a.o - b.o);
  return early[0] ?? null;
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
  for (let i = ids.length - 1; i >= 0; i--) if (!st.opened.has(ids[i])) return sealOf(s, ids[i]) ?? null;
  return nextSeal(s, st);
}

export function teaser(s: Story, st: StoryState): string | null {
  const ok = s.teasers.filter(x => x.w <= st.week && allMet(st, x.req) && !(x.until && met(st, x.until)));
  return ok.length ? ok[ok.length - 1].line : null;
}

/* ---------- reading: a record rendered at the marks Dan holds ---------- */

export interface MarkHeld { guess: string; right: boolean; confirmed: boolean; struck: boolean; }

export function marksHeld(s: Story, st: StoryState): Map<string, MarkHeld> {
  const out = new Map<string, MarkHeld>();
  for (const [id, guess] of st.guessed) {
    const m = markOf(s, id);
    if (!m) continue;
    const right = !m.right || m.right.includes(guess);
    const confirmed = !!m.confirmedBy && met(st, m.confirmedBy);
    out.set(id, { guess, right, confirmed, struck: confirmed && !right });
  }
  return out;
}

export type Rendered = { t: 'word'; text: string; guess: boolean } | { t: 'glyph'; mark: string } | { t: 'pic'; text: string } | { t: 'ring' } | { t: 'hand'; who: string } | { t: 'p'; text: string };

/** Each token as Dan can read it now: a held sign as its English (a guess with a question mark), otherwise its glyph. */
export function render(tokens: Token[], held: Map<string, MarkHeld>, s: Story): Rendered[] {
  return tokens.map((tk): Rendered => {
    if ('ring' in tk) return tk.en && tk.s?.every(x => held.get(x)?.right) ? { t: 'word', text: tk.en, guess: false } : { t: 'ring' };
    if ('s' in tk) {
      const h = held.get(tk.s);
      if (!h || h.struck) return { t: 'glyph', mark: tk.s };
      /* a right guess reads as this record's own English; a wrong one as the guess itself, until it is struck */
      return h.right ? { t: 'word', text: tk.en, guess: !h.confirmed } : { t: 'word', text: h.guess, guess: true };
    }
    if ('pic' in tk) return { t: 'pic', text: tk.pic };
    if ('hand' in tk) return { t: 'hand', who: tk.hand };
    return { t: 'p', text: tk.p };
  });
}

/** Everything a beat, seal or find carries, as ids (for writing `recordShown` once). */
export function recordsIn(c: Carries | undefined): string[] { return c?.records ?? []; }
