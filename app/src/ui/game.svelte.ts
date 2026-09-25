/**
 * The screens' one handle on the game: the fact log, saved as it grows; the clock; what can be seen now.
 * Rules live in core; this file only reads the clock, keeps the save and schedules the phone's alerts.
 */
import { act, alertsAfter, see, settle, type Command } from '../core/game';
import { BREATHER_MIN } from '../core/run';
import { epochOf, momentOf, type Moment } from '../core/time';
import type { Fact } from '../core/types';
import { content } from '../content/world';
import { platform } from '../platform';
import { t } from '../content/copy/en';

export { content };

const SAVE_VERSION = 2;   /* 2: the story (slice 2); older prototype saves start afresh */
interface Save { version: number; content: string; facts: Fact[]; }

/* ---- the prototype's rehearsal: minutes pass 60 times faster, on a separate throwaway save (PROTOTYPE_NOTES.md) ---- */
interface Proto { rehearsal: boolean; anchorReal: number; anchorFake: number; }
const PROTO_KEY = 'proto.settings';
function loadProto(): Proto {
  try { const p = JSON.parse(platform.store.get(PROTO_KEY) ?? ''); if (typeof p?.rehearsal === 'boolean') return p; } catch { /* */ }
  return { rehearsal: false, anchorReal: 0, anchorFake: 0 };
}
export const REHEARSAL_SPEED = 60;
/** The delve's alerts' ids on the phone: one per delve and breather end (alerts). */
const ALERT_IDS = Array.from({ length: 24 }, (_, i) => 100 + i);

class Game {
  proto = $state<Proto>(loadProto());
  facts = $state<Fact[]>([]);
  now = $state<Moment>('2000-01-01T00:00:00Z');
  view = $derived(see(this.facts, content, this.now));
  #ticker = 0;

  constructor() {
    this.now = this.clock();
    this.facts = this.load();
    /* the phone closed the app while Dan was in another one: that time is taken off first (D-094) */
    if (platform.delve.first !== null) this.away(platform.delve.first);
    this.append(settle(this.facts, content, this.now));
    this.do({ do: 'open' });
    this.#ticker = window.setInterval(() => this.tick(), 250);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) void this.wake(); });
    window.addEventListener('focus', () => void this.wake());
    this.native();
  }

  /** Counts each return to the app that began a new game day, so the screens can show what waits (App.svelte). */
  woke = $state(0);
  #waking: Promise<void> | null = null;
  /** Back from the background (the app is rarely closed on a phone): the time spent in another app taken off the
      delve (D-094), then the clock's facts, and a new day's opening, with its morning, week close, welcome back and
      story week, exactly as a cold start would (review finding, D-080). */
  wake() { return (this.#waking ??= this.#wake().finally(() => { this.#waking = null; })); }
  async #wake() {
    const left = await platform.delve.take();
    this.now = this.clock();
    if (left !== null) this.away(left);
    this.append(settle(this.facts, content, this.now));
    const today = this.view.day;
    if (!this.facts.some(f => f.type === 'opened' && f.day === today)) { this.do({ do: 'open' }); this.woke++; }
    else this.tick();
    this.native();
  }

  /** Dan went into another app at `leftAt` (the phone's ms) and is back now: the delve paused where he left (D-094).
      The phone silenced the delve's alerts when he left, so they are set again from what is true now. */
  away(leftAt: number) {
    this.do({ do: 'away', from: this.gameMs(leftAt), to: this.clockMs() });
    void this.alerts();
  }

  /** A job as Dan has it now (his edits and satchel lines included). */
  job(id: string) { return this.view.content.jobs.find(j => j.id === id); }

  get saveKey() { return this.proto.rehearsal ? 'save.rehearsal' : 'save.v1'; }

  /** The phone's clock, or the rehearsal's quick one. */
  clockMs(): number { return this.gameMs(platform.now().getTime()); }
  clock(): Moment { const ms = this.clockMs(); return momentOf(ms, -new Date(ms).getTimezoneOffset()); }
  /** An instant on the game's clock, as a real Date (for alerts, which need the phone's own time). */
  realDate(ms: number): Date {
    const p = this.proto;
    return new Date(p.rehearsal ? p.anchorReal + (ms - p.anchorFake) / REHEARSAL_SPEED : ms);
  }

  /** The phone refused alerts: the delve says so, rather than promising a sound (review finding, D-080). */
  alertsOff = $state(false);
  /** A save this build couldn't read was kept aside, never overwritten (D-080): the key it was kept under. */
  keptAside = $state<string | null>(null);

  /** The save, read. A save this build can't use (unreadable, or from another version) is copied aside first, so
      nothing Dan did is ever lost by an update; a newer version's save is never written over (D-080). */
  load(): Fact[] {
    const raw = platform.store.get(this.saveKey);
    if (raw === null) return [];
    try {
      const s: Save = JSON.parse(raw);
      if (s && s.version === SAVE_VERSION && Array.isArray(s.facts)) return s.facts;
    } catch { /* kept aside below */ }
    const key = `${this.saveKey}.kept.${platform.now().getTime()}`;
    platform.store.set(key, raw);
    this.keptAside = key;
    return [];
  }
  #backedUp = '';
  save() {
    const s: Save = { version: SAVE_VERSION, content: content.version, facts: this.facts };
    /* once a day, yesterday's save is copied to a backup before today's writes (D-080) */
    const day = this.view?.day ?? '';
    if (day && day !== this.#backedUp) {
      const prev = platform.store.get(this.saveKey);
      if (prev) platform.store.set(`${this.saveKey}.backup`, prev);
      this.#backedUp = day;
    }
    platform.store.set(this.saveKey, JSON.stringify(s));
  }
  append(f: Fact[]) {
    if (!f.length) return;
    this.facts = this.facts.concat(f);
    this.save();
  }

  /** Dan does something: the facts are written at once, in one step. */
  do(cmd: Command): Fact[] {
    this.now = this.clock();
    const before = this.view.run;
    const f = act(this.facts, content, cmd, this.now);
    this.append(f);
    if (['startRun', 'skipBreather', 'stepAway', 'resume', 'finishHere'].includes(cmd.do) || (before && !this.view.run)) void this.alerts();
    this.native();
    return f;
  }

  /* ---- the delve beyond the page: the lock-screen panel and watching for another app (D-094, D-095) ---- */
  #shown = '';
  /** Keeps the phone's panel and its watch in step with the run; only sends when what it shows changes. */
  native() {
    const r = this.view.run;
    const key = r ? `${r.seq}|${r.phase}|${r.k}|${r.phase === 'held' ? r.leftMs : ''}` : '';
    if (key === this.#shown) return;
    this.#shown = key;
    platform.delve.watch(!!r && r.phase !== 'held', ALERT_IDS);
    if (!r) { platform.delve.panel(null); return; }
    const L = r.minutes * 60_000, B = BREATHER_MIN * 60_000, nowMs = this.clockMs(), real = (ms: number) => this.realDate(ms).getTime();
    const delve = (k: number) => r.count === 1 ? t('live.one') : t('live.ofRun', { k: String(k), n: String(r.count) });
    let label = delve(r.k), start = nowMs - r.doneMs, end = nowMs + r.leftMs, rest = false;
    let next: { label: string; start: number; end: number } | null = null;
    if (r.phase === 'breather') {
      label = t('live.breather'); rest = true;
      start = nowMs - (B - r.breatherLeftMs); end = nowMs + r.breatherLeftMs;
      next = { label: delve(r.k + 1), start: real(end), end: real(end + L) };
    } else if (r.k < r.count) next = { label: delve(r.k + 1), start: real(end + B), end: real(end + B + L) };
    platform.delve.panel({
      run: r.seq, job: r.job.name, label: r.phase === 'held' ? t('live.paused') : label,
      start: real(start), end: real(end), rest, paused: r.phase === 'held', left: real(nowMs + r.leftMs) - real(nowMs),
      fraction: r.phase === 'held' ? r.doneMs / L : 0, hint: t('live.paused.hint'),
      next, from: t('live.from'), done: t('live.done'),
      pausedLabel: t('live.paused'),
    });
  }
  /** The phone's clock (ms) as the game's (the rehearsal runs 60 times faster). */
  gameMs(real: number): number {
    const p = this.proto;
    return p.rehearsal ? p.anchorFake + (real - p.anchorReal) * REHEARSAL_SPEED : real;
  }

  #minute = 0;
  tick() {
    /* in the background, or just back and not yet told how long Dan was away: nothing is settled (D-094) */
    if (document.hidden || this.#waking) return;
    const before = this.view.run;
    /* with no delve running, the clock only matters by the minute: the view is not rebuilt four times a second */
    const m = Math.floor(this.clockMs() / 60_000);
    if (!before && m === this.#minute) return;
    this.#minute = m;
    this.now = this.clock();
    if (!before) {
      if (!this.facts.some(f => f.type === 'opened' && f.day === this.view.day)) this.wake();   /* past 04:00 with the app open */
      return;
    }
    const f = settle(this.facts, content, this.now);
    this.append(f);
    const after = this.view.run;
    this.native();
    /* the end is heard while the page is open (with the phone locked, the app's alert does it) */
    if (f.some(x => x.type === 'stepsGained')) platform.sound.chime('delveEnd');
    else if (before.phase === 'breather' && after?.phase === 'delve') platform.sound.chime('breatherEnd');
  }

  /** One alert per delve and breather end from now on; none while held, none after the run (ARCHITECTURE → the delve's end).
      In a rehearsal they come 60 times sooner, so trial (b) takes seconds, not a whole delve. */
  async alerts() {
    const ids = ALERT_IDS;
    await platform.notifier.cancel(ids);
    const r = this.view.run;
    if (!r || !platform.notifier.locked) return;
    if (!(await platform.notifier.permit())) { this.alertsOff = true; return; }   /* asked once, at the first Begin */
    this.alertsOff = false;
    const marks = this.facts.filter(f => f.seq > r.seq && ['breatherSkipped', 'delveHeld', 'delveResumed'].includes(f.type))
      .map(f => ({ kind: f.type === 'breatherSkipped' ? 'skip' : f.type === 'delveHeld' ? 'hold' : 'resume', at: epochOf(f.at) } as const));
    const list = alertsAfter({ startedAt: r.startedAt, minutes: r.minutes, count: r.count }, marks, epochOf(this.now));
    for (const [i, a] of list.slice(0, ids.length).entries()) {
      await platform.notifier.at(ids[i], this.realDate(a.at), t(a.what === 'delveEnd' ? 'notify.delveEnd.title' : 'notify.breatherEnd.title'),
        t(a.what === 'delveEnd' ? 'notify.delveEnd.body' : 'notify.breatherEnd.body'));
    }
  }

  /* ---- prototype controls ---- */
  setRehearsal(on: boolean) {
    const real = platform.now().getTime(), d = new Date(real);
    d.setHours(8, 0, 0, 0);    /* a rehearsal starts at 08:00 today, so the whole day is ahead of it */
    this.proto = { rehearsal: on, anchorReal: real, anchorFake: d.getTime() };
    platform.store.set(PROTO_KEY, JSON.stringify(this.proto));
    this.facts = on ? [] : this.load();
    if (on) platform.store.remove('save.rehearsal');
    this.now = this.clock();
    this.append(settle(this.facts, content, this.now));
    this.do({ do: 'open' });
    void this.alerts();   /* the other save's alerts go; this one's come back */
    this.#shown = '-'; this.native();
  }
  reset() {
    /* even a wipe keeps one copy aside, so a slip can be undone (D-080) */
    const prev = platform.store.get(this.saveKey);
    if (prev) platform.store.set(`${this.saveKey}.wiped`, prev);
    platform.store.remove(this.saveKey);
    if (this.proto.rehearsal) { this.setRehearsal(true); return; }
    this.facts = [];
    this.do({ do: 'open' });
  }
}

export const game = new Game();
