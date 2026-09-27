/**
 * The hostile review's rules fuzzer (docs/reviews/BREAK-IT.md): random but valid command sequences, with random clock
 * jumps, fed into act / settle / see, with the game's invariants checked after every step. Seeded, so any failure
 * replays exactly. Ids only: no story text is read or printed here.
 */
import { act, see, settle, DIAL, type Command, type View } from '../../src/core/game';
import { calendarWeek, epochOf, gameDay, momentOf } from '../../src/core/time';
import type { Content, Fact, Job, Rhythm } from '../../src/core/types';
import * as W from '../../src/core/week';
import * as R from '../../src/core/reminders';
import * as S from '../../src/core/story';
import { readSave, SAVE_VERSION } from '../../src/core/save';
import { content as C } from '../../src/content/world';

/* ---------- a small seeded random ---------- */

export function rng(seed: number) {
  let a = seed >>> 0;
  const next = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return {
    next,
    int: (lo: number, hi: number) => lo + Math.floor(next() * (hi - lo + 1)),
    pick: <T>(xs: readonly T[]): T => xs[Math.floor(next() * xs.length)],
    chance: (p: number) => next() < p,
  };
}
type Rng = ReturnType<typeof rng>;

/* ---------- the invariants ---------- */

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const validDate = (d: unknown) => typeof d === 'string' && DATE.test(d) && new Date(`${d}T00:00:00Z`).toISOString().slice(0, 10) === d;

export interface Problem { kind: string; detail: string; }

/** Every invariant the review checks, on the log as it stands. `view` is the view at `now` (already built). */
export function check(facts: Fact[], view: View, now: string): Problem[] {
  const out: Problem[] = [];
  const bad = (kind: string, detail: string) => out.push({ kind, detail });
  /* the log: seq in order, moments readable, days real dates (a plan change's own day: a date or null, D-125) */
  for (let i = 0; i < facts.length; i++) {
    const f = facts[i];
    if (f.seq !== i + 1) bad('seq', `fact ${i} has seq ${f.seq}`);
    try { epochOf(f.at); } catch { bad('moment', `${f.type}@${f.at}`); }
    if (f.type === 'planChanged') { if (f.day !== null && !validDate(f.day)) bad('day', `planChanged day ${f.day}`); }
    else if (!validDate(f.day)) bad('day', `${f.type} day ${f.day}`);
    if (i && f.type !== 'planChanged' && epochOf(f.at) < epochOf(facts[i - 1].at)) bad('timeOrder', `${facts[i - 1].type}@${facts[i - 1].at} then ${f.type}@${f.at}`);
  }
  /* minutes never negative, never fractional */
  for (const f of facts) {
    if ((f.type === 'stepsGained' || f.type === 'delveEnded' || f.type === 'jobDone') && (!(f.minutes >= 0) || !Number.isInteger(f.minutes))) bad('minutes', `${f.type} ${f.minutes}`);
    if (f.type === 'delveStarted' && !(f.minutes >= 1 && f.minutes <= 90 && f.count >= 1 && f.count <= 8)) bad('runShape', `${f.minutes}×${f.count}`);
  }
  /* a job is never paid twice: one Done per job per day; one end per run; a run's steps never more than it ran or
     than it was set for; the end says what the steps paid */
  const doneKey = new Set<string>();
  for (const f of facts) if (f.type === 'jobDone') { const k = `${f.job}|${f.day}`; if (doneKey.has(k)) bad('doneTwice', k); doneKey.add(k); }
  const runs = facts.filter((f): f is Extract<Fact, { type: 'delveStarted' }> => f.type === 'delveStarted');
  const lastAt = facts.length ? epochOf(facts[facts.length - 1].at) : 0;
  for (const r of runs) {
    const ends = facts.filter(f => f.type === 'delveEnded' && f.run === r.seq) as Extract<Fact, { type: 'delveEnded' }>[];
    if (ends.length > 1) bad('endedTwice', `run ${r.seq}`);
    const paid = facts.filter(f => f.type === 'stepsGained' && f.run === r.seq).reduce((a, f) => a + (f as { minutes: number }).minutes, 0);
    if (paid > r.minutes * r.count) bad('overpaid', `run ${r.seq}: ${paid} > ${r.minutes}×${r.count}`);
    const wall = (Math.max(lastAt, epochOf(now)) - epochOf(r.at)) / 60_000;
    if (paid > wall + 0.01) bad('paidBeyondClock', `run ${r.seq}: ${paid} min paid, ${wall.toFixed(1)} min on the clock`);
    if (ends[0] && ends[0].minutes !== paid) bad('endVsPaid', `run ${r.seq}: end says ${ends[0].minutes}, steps paid ${paid}`);
    if (ends[0]?.job !== undefined && ends[0].job !== r.job) bad('endJob', `run ${r.seq}`);
  }
  /* steps come from a run, or from a night in bed on time */
  for (const f of facts) if (f.type === 'stepsGained' && f.run === undefined && f.job !== 'sleep') bad('stepsWithoutRun', f.job);
  /* the same place is never arrived at twice; Keys at most 5 a calendar week (floor Keys apart) */
  const places = new Set<string>();
  for (const f of facts) if (f.type === 'arrived' && f.kind === 'place') { if (places.has(f.id)) bad('arrivedTwice', f.id); places.add(f.id); }
  const keyWeeks = new Map<string, number>();
  for (const f of facts) if (f.type === 'keyEarned' && !f.rhythm.startsWith('floor:')) keyWeeks.set(calendarWeek(f.day), (keyWeeks.get(calendarWeek(f.day)) ?? 0) + 1);
  for (const [wk, n] of keyWeeks) if (n > S.KEYS_A_WEEK) bad('keysOverWeek', `${wk}: ${n}`);
  /* rule 10: a Done with under RETURN_MIN minutes brings no story step, find or Key (D-117, D-121) */
  for (const d of facts) if (d.type === 'jobDone' && d.minutes < S.RETURN_MIN) {
    if (facts.some(f => (f.type === 'beatPlayed' || f.type === 'findGiven') && f.job === d.seq)) bad('tinyDoneRewarded', `${d.job} ${d.minutes} min`);
    const nextF = facts.find(f => f.seq === d.seq + 1);
    if (nextF?.type === 'keyEarned') bad('tinyDoneKey', `${d.job} ${d.minutes} min`);
  }
  /* a fact's day is its moment's game day, except a run's own facts (kept on the run's day across 04:00, D-120) */
  const runDay = new Set(['stepsGained', 'delveEnded', 'jobDone', 'findGiven', 'beatPlayed', 'arrived', 'recordShown', 'keyEarned', 'keyHeld', 'keyUsed', 'sealOpened', 'dayCompleted', 'storyWeekBegan', 'jobSaved', 'jobBegun']);
  for (const f of facts) if (f.type !== 'planChanged' && !runDay.has(f.type) && f.day !== gameDay(f.at)) bad('dayMismatch', `${f.type} day ${f.day} at ${f.at}`);
  /* the view: the slate names only jobs that exist; the run's job exists */
  const ids = new Set(view.content.jobs.map(j => j.id));
  for (const id of view.slate) if (!ids.has(id)) bad('slateMissingJob', id);
  if (view.next && !ids.has(view.next.job)) bad('nextMissingJob', `${view.next.job} (${view.next.mode})`);
  if (view.run && !ids.has(view.run.job.id)) bad('runMissingJob', view.run.job.id);
  if (view.runEnd && !ids.has(view.runEnd.job.id)) bad('runEndMissingJob', view.runEnd.job.id);
  if (new Set(view.slate).size !== view.slate.length) bad('slateDuplicate', view.slate.join(','));
  /* the Satchel never lists a repeating, done, stopped or deleted job */
  const satchel = W.satchelOf(view.content, facts, view.day);
  const rhythmJobs = new Set(view.content.rhythms.map(r => r.job));
  const everDone = new Set(facts.filter(f => f.type === 'jobDone').map(f => (f as { job: string }).job));
  for (const j of satchel) {
    if (!ids.has(j.id)) bad('satchelDeleted', j.id);
    if (rhythmJobs.has(j.id)) bad('satchelRepeating', j.id);
    if (j.stopped) bad('satchelStopped', j.id);
    /* done: done since it last stopped repeating (satchelOf's own rule); a job done with no rhythm ever is simply done */
    const stoppedLast = [...facts].reverse().find(f => f.type === 'rhythmStopped' && C.rhythms.concat(facts.filter(g => g.type === 'rhythmSaved').map(g => (g as { rhythm: Rhythm }).rhythm)).some(r => r.id === (f as { id: string }).id && r.job === j.id));
    const doneAfter = facts.some(f => f.type === 'jobDone' && f.job === j.id && (!stoppedLast || f.seq > stoppedLast.seq));
    if (doneAfter) bad('satchelDone', j.id);
    if (!stoppedLast && everDone.has(j.id)) bad('satchelDone', j.id);
  }
  if (new Set(satchel.map(j => j.id)).size !== satchel.length) bad('satchelDuplicate', satchel.map(j => j.id).join(','));
  return out;
}

/** The save round-trips: written, read back, the same facts and the same view. */
export function roundTrip(facts: Fact[], now: string): Problem[] {
  const raw = JSON.stringify({ version: SAVE_VERSION, content: C.version, facts });
  const back = readSave(raw);
  if (!back) return [{ kind: 'saveUnreadable', detail: `${facts.length} facts` }];
  if (JSON.stringify(back.save.facts) !== JSON.stringify(facts)) return [{ kind: 'saveChanged', detail: 'facts differ after a round trip' }];
  const a = see(facts, C, now), b = see(back.save.facts, C, now);
  const pick = (v: View) => JSON.stringify({ slate: v.slate, done: [...v.done], next: v.next, walked: v.walked, run: v.run?.phase, end: v.runEnd?.seq, arrival: v.arrival?.seq });
  return pick(a) === pick(b) ? [] : [{ kind: 'saveViewDiffers', detail: 'the view differs after a round trip' }];
}

/* ---------- a random player ---------- */

export interface Step { cmd: Command | { do: 'settle' } | { do: 'jump'; min: number } | { do: 'offset'; to: number }; at: string; }

/** Random but valid commands, as the screens could send them, weighted towards the delve loop. */
export function play(seed: number, steps: number, opts: { uiOnly?: boolean; backwards?: boolean } = {}) {
  const r = rng(seed);
  let facts: Fact[] = [];
  let ms = Date.parse('2026-09-28T07:30:00Z') + r.int(0, 7 * 24 * 60) * 60_000;
  let off = 60;
  const log: Step[] = [];
  const problems: (Problem & { step: number })[] = [];
  const now = () => momentOf(ms, off);
  let lastDeleted: { job: Job; rhythm: Rhythm | null; on?: string } | null = null;
  let jobN = 0;

  const apply = (cmd: Command) => {
    const at = now();
    log.push({ cmd, at });
    facts = facts.concat(act(facts, C, cmd, at));
  };

  const choose = (v: View): Command | null => {
    const jobs = v.content.jobs.filter(j => !j.stopped);
    const anyJob = () => jobs.length ? r.pick(jobs).id : 'gym';
    const weekE = () => {
      const wk = r.chance(0.7) ? calendarWeek(v.day) : W.addDays(calendarWeek(v.day), 7);
      const es = W.weekOf(v.content, facts, wk, v.day).days.flatMap(d => d.jobs.filter(j => j.entry && !j.done && d.day >= v.day).map(j => ({ e: j.entry!, wk })));
      return es.length ? r.pick(es) : null;
    };
    const dayAhead = (n = 34) => W.addDays(v.day, r.int(0, n));
    const k = r.int(0, 100);
    if (k < 14) {
      /* the delve set-up: minutes and delves as the dial sets them */
      if (v.run) return r.pick([{ do: 'stepAway' }, { do: 'resume' }, { do: 'skipBreather' }, { do: 'finishHere' }] as Command[]);
      return { do: 'startRun', job: v.next && r.chance(0.5) ? v.next.job : anyJob(), minutes: r.pick(DIAL), count: r.int(1, 4) };
    }
    if (k < 22) return r.pick([{ do: 'stepAway' }, { do: 'resume' }, { do: 'skipBreather' }, { do: 'finishHere' }] as Command[]);
    if (k < 30) return { do: 'done', job: v.run && r.chance(0.5) ? v.run.job.id : v.runEnd && r.chance(0.5) ? v.runEnd.job.id : anyJob(), ...(r.chance(0.3) ? { keepEnd: true } : {}) };
    if (k < 34) { if (v.runEnd) return { do: 'seen', what: 'step', ref: v.runEnd.seq }; if (v.arrival) return { do: 'seen', what: 'arrival', ref: v.arrival.seq }; return { do: 'open' }; }
    if (k < 37) { if (v.arrival) return { do: 'seen', what: 'arrival', ref: v.arrival.seq }; if (v.morning) return { do: 'seen', what: 'morning', ref: v.morning.seq }; if (v.welcome) return { do: 'seen', what: 'welcome', ref: v.welcome.seq }; return null; }
    if (k < 39) {
      /* a guess at a mark on offer */
      const st = S.storyState(facts, C.story), offered = [...st.offered].filter(m => S.mayGuess(C.story, st, m));
      if (!offered.length) return null;
      const m = S.markOf(C.story, r.pick(offered));
      return m?.candidates?.length ? { do: 'guess', mark: m.id, guess: r.pick(m.candidates) } : null;
    }
    if (k < 42) return { do: 'setAside', job: r.pick(v.slate.length ? v.slate : [anyJob()]) };
    if (k < 43) return { do: 'putBack', job: anyJob() };
    if (k < 45) return { do: 'focus', job: anyJob() };
    if (k < 46) return { do: 'swap' };
    if (k < 50) {
      /* add: the Satchel's Put in, + Add, Siri */
      const text = r.pick(['milk', '  ', '- a line', 'x'.repeat(r.int(1, 300)), '😀 emoji', '<b>x</b>', 'a\nb\n\nc']);
      if (r.chance(0.3)) return { do: 'takeInbox', lines: [{ id: `ref-${r.int(1, 30)}`, text }] };
      return { do: 'addItems', lines: [text] };
    }
    if (k < 53) {
      /* Delete, as the screens do it: never the job of a delve under way */
      const cands = opts.uiOnly === false ? jobs : jobs.filter(j => j.id !== v.run?.job.id);
      if (!cands.length) return null;
      const j = r.pick(cands);
      const doneDays = [...new Set(facts.filter(f => f.type === 'jobDone' && f.job === j.id).map(f => f.day))];
      const rh = v.content.rhythms.find(x => x.job === j.id) ?? null;
      if (doneDays.length && rh && r.chance(0.5)) { const on = r.pick(doneDays); lastDeleted = { job: { ...j }, rhythm: null, on }; return { do: 'hideDone', job: j.id, on }; }
      lastDeleted = { job: { ...j }, rhythm: rh };
      return { do: 'removeJob', id: j.id };
    }
    if (k < 55) {
      /* Undo */
      const d = lastDeleted; lastDeleted = null;
      if (!d) return null;
      return d.on ? { do: 'hideDone', job: d.job.id, on: d.on, back: true } : { do: 'saveJob', job: d.job, rhythm: d.rhythm };
    }
    if (k < 58) {
      /* a list: typed, edited, emptied, very long */
      const lines = Array.from({ length: r.int(0, 8) }, () => r.pick(['milk', 'shampoo', '~ tilde', '   ', 'y'.repeat(r.int(1, 900))]));
      return { do: 'listJob', job: anyJob(), list: lines.join('\n') };
    }
    if (k < 61) {
      /* strike a line in the delve under way (or anywhere, which must be refused) */
      const j = v.run ? v.content.jobs.find(x => x.id === v.run!.job.id) : r.pick(jobs);
      const n = (j?.list ?? '').split('\n').filter(l => l.trim()).length;
      return { do: 'strikeLine', job: j?.id ?? 'gym', k: r.int(-1, n) };
    }
    if (k < 64) {
      const e = weekE();
      if (!e) return { do: 'planWeek', week: calendarWeek(v.day) };
      /* a move within its own week, or "Not this week" (the Week's own rules; another week goes by planJob) */
      if (r.chance(0.35)) return { do: 'movePlan', entry: e.e, day: null };
      return { do: 'movePlan', entry: e.e, day: W.addDays(e.wk, r.int(0, 6)), ...(r.chance(0.2) ? { time: r.pick(['09:00', '18:30', null]) } : {}) };
    }
    if (k < 67) return { do: 'planJob', job: anyJob(), day: dayAhead(), ...(r.chance(0.2) ? { time: '07:15' } : {}) };
    if (k < 69) return { do: 'addToWeek', line: r.pick(['call', ' ', 'z'.repeat(200)]), day: W.addDays(calendarWeek(v.day), r.int(0, 13)) };
    if (k < 71) return r.chance(0.5) ? { do: 'planWeek', week: r.pick([calendarWeek(v.day), W.addDays(calendarWeek(v.day), 7)]) } : { do: 'replan' };
    if (k < 73) {
      /* the job editor: a new job, or an edit, with or without a rhythm */
      const base = r.chance(0.4) || !jobs.length ? { id: `j-${seed}-${++jobN}`, name: 'New job', delve: true, length: 30, doneBy: 'dan' as const } : { ...r.pick(jobs) };
      const job: Job = { ...base, name: r.pick([base.name, ' ', 'Renamed', 'n'.repeat(400)]), length: r.pick([1, 5, 30, 999, 12.6]) };
      if (r.chance(0.2)) job.by = dayAhead(10);
      const rh: Rhythm | null = r.chance(0.4) ? r.pick<Rhythm>([
        { id: `r-${job.id}`, job: job.id, times: r.int(1, 7) }, { id: `r-${job.id}`, job: job.id, days: [r.int(0, 6)] },
        { id: `r-${job.id}`, job: job.id, every: 2 }, { id: `r-${job.id}`, job: job.id, everyDays: r.int(1, 10) },
        { id: `r-${job.id}`, job: job.id, monthly: { day: 31 } }, { id: `r-${job.id}`, job: job.id, yearly: '02-29' },
        { id: `r-${job.id}`, job: job.id, days: [4], time: '18:00' }]) : null;
      if (rh) job.doneBy = 'enough';
      return { do: 'saveJob', job, rhythm: rh };
    }
    if (k < 74) { const rh = v.content.rhythms; return rh.length ? { do: 'stopRhythm', id: r.pick(rh).id } : null; }
    if (k < 76) return r.chance(0.5) ? { do: 'noteJob', job: anyJob(), note: r.pick(['', 'where I stopped', 'q'.repeat(500)]) } : { do: 'firstStep', job: anyJob(), step: r.pick(['', 'Shoes on']) };
    if (k < 78) return { do: 'goodnight' };
    if (k < 79) return { do: 'bedtime', time: r.pick(['22:30', '23:00', '01:30', '03:59']) };
    if (k < 80) return { do: 'callDeep' };
    if (k < 81) return { do: 'capacity', capacity: r.pick(['low', 'normal', 'high'] as const) };
    if (k < 83) {
      const its = W.items(facts, v.day);
      if (!its.length) return { do: 'lookAhead', finished: r.chance(0.5) };
      const it = r.pick(its);
      return r.pick([{ do: 'keepItem', id: it.id }, { do: 'somedayItem', id: it.id }, { do: 'tick', id: it.id }, { do: 'dropItem', id: it.id }] as Command[]);
    }
    if (k < 84) return { do: 'pinWeek', job: r.chance(0.2) ? null : anyJob() };
    if (k < 85) { if (v.close) return { do: 'closeRead', week: v.close.week }; return { do: 'offerAnswered', week: calendarWeek(v.day) }; }
    if (k < 87) return r.chance(0.5) ? { do: 'remind', target: r.pick([`r:${v.content.rhythms[0]?.id ?? 'x'}`, `d:${anyJob()}`, 'bedtime']), lead: r.pick([0, 15, 60, 1440, null] as const) } : { do: 'reminders', on: r.chance(0.5) };
    if (k < 88) return { do: 'nudge', on: r.chance(0.5) };
    if (k < 89) return { do: 'calendarShow', on: r.chance(0.7), calendars: r.chance(0.5) ? null : ['work'] };
    if (k < 90) {
      const d = v.day, ev = Array.from({ length: r.int(0, 4) }, (_, i) => ({ id: `e${i}`, cal: r.pick(['work', 'home']), title: 'busy', start: `${W.addDays(d, r.int(0, 6))}T${String(r.int(0, 23)).padStart(2, '0')}:00`, end: `${W.addDays(d, r.int(0, 8))}T${String(r.int(0, 23)).padStart(2, '0')}:30`, allDay: r.chance(0.3) }));
      return { do: 'calendarRead', events: ev, days: 14 };
    }
    if (k < 91) return { do: 'cantStart', job: anyJob() };
    if (k < 92) return { do: 'begin', job: anyJob() };
    if (k < 93) return { do: 'unbegin', job: anyJob() };
    return { do: 'open' };
  };

  const step = (i: number) => {
    /* the clock: mostly a few minutes; sometimes hours, a night, days away; now and then a trip abroad or a clock change */
    const c = r.int(0, 100);
    let jump = c < 55 ? r.int(0, 6) : c < 80 ? r.int(7, 60) : c < 92 ? r.int(61, 12 * 60) : c < 98 ? r.int(12 * 60, 4 * 24 * 60) : r.int(4 * 24 * 60, 12 * 24 * 60);
    if (opts.backwards && r.chance(0.03)) jump = -r.int(1, 180);
    ms += jump * 60_000;
    if (jump) log.push({ cmd: { do: 'jump', min: jump }, at: now() });
    if (r.chance(0.01)) { off = r.pick([60, 0, -300, 540]); log.push({ cmd: { do: 'offset', to: off }, at: now() }); }
    /* the app coming back: it was in another app for the jump (a delve pauses where he left, D-094), then settles */
    if (jump > 0 && r.chance(0.4)) apply({ do: 'away', from: ms - jump * 60_000, to: ms });
    else if (r.chance(0.5)) { log.push({ cmd: { do: 'settle' }, at: now() }); facts = facts.concat(settle(facts, C, now())); }
    if (r.chance(0.15)) apply({ do: 'open' });
    const v = see(facts, C, now());
    const cmd = choose(v);
    if (cmd) apply(cmd);
    const v2 = see(facts, C, now());
    for (const p of check(facts, v2, now())) problems.push({ ...p, step: i });
    R.alertsDue(v2.content, facts, now());
  };

  apply({ do: 'open' });
  for (let i = 0; i < steps; i++) {
    try { step(i); } catch (e) { problems.push({ kind: 'threw', detail: String((e as Error)?.stack ?? e).split('\n').slice(0, 4).join(' | '), step: i }); break; }
  }
  return { facts, log, problems, now: now() };
}
