/**
 * The screens' one handle on the game: the fact log, saved as it grows; the clock; what can be seen now.
 * Rules live in core; this file only reads the clock, keeps the save and schedules the phone's alerts.
 */
import { act, alertsAfter, see, settle, type Command, type RunView } from '../core/game';
import type { RunMark } from '../core/run';
import { panelOf } from './panel';
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

class Game {
  proto = $state<Proto>(loadProto());
  facts = $state<Fact[]>([]);
  now = $state<Moment>('2000-01-01T00:00:00Z');
  view = $derived(see(this.facts, content, this.now));
  #ticker = 0;

  constructor() {
    this.now = this.clock();
    this.facts = this.load();
    this.append(settle(this.facts, content, this.now));
    this.do({ do: 'open' });
    this.panel();
    this.#ticker = window.setInterval(() => this.tick(), 250);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.wake(); });
    window.addEventListener('focus', () => this.wake());
  }

  /** Counts each return to the app that began a new game day, so the screens can show what waits (App.svelte). */
  woke = $state(0);
  /** Back from the background (the app is rarely closed on a phone): the clock's facts, and a new day's opening, with
      its morning, week close, welcome back and story week, exactly as a cold start would (review finding, D-080). */
  wake() {
    this.now = this.clock();
    this.append(settle(this.facts, content, this.now));
    const today = this.view.day;
    if (!this.facts.some(f => f.type === 'opened' && f.day === today)) { this.do({ do: 'open' }); this.woke++; }
    else this.tick();
    this.panel();   /* the panel may have run past what it knew while the app was away: put it right */
  }

  /** A job as Dan has it now (his edits and satchel lines included). */
  job(id: string) { return this.view.content.jobs.find(j => j.id === id); }

  get saveKey() { return this.proto.rehearsal ? 'save.rehearsal' : 'save.v1'; }

  /** The phone's clock, or the rehearsal's quick one. */
  clockMs(): number {
    const real = platform.now().getTime(), p = this.proto;
    return p.rehearsal ? p.anchorFake + (real - p.anchorReal) * REHEARSAL_SPEED : real;
  }
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
    if (['startRun', 'skipBreather', 'stepAway', 'resume', 'finishHere'].includes(cmd.do) || (before && !this.view.run)) { void this.alerts(); this.panel(); }
    return f;
  }

  #minute = 0;
  tick() {
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
    if (!after || after.phase !== before.phase || after.k !== before.k) this.panel();
    if (document.hidden) return;
    /* the end is heard while the page is open (with the phone locked, the app's alert does it) */
    if (f.some(x => x.type === 'stepsGained')) platform.sound.chime('delveEnd');
    else if (before.phase === 'breather' && after?.phase === 'delve') platform.sound.chime('breatherEnd');
  }

  /** One alert per delve and breather end from now on; none while held, none after the run (ARCHITECTURE → the delve's end).
      In a rehearsal they come 60 times sooner, so trial (b) takes seconds, not a whole delve. */
  async alerts() {
    const ids = Array.from({ length: 24 }, (_, i) => 100 + i);
    await platform.notifier.cancel(ids);
    const r = this.view.run;
    if (!r || !platform.notifier.locked) return;
    if (!(await platform.notifier.permit())) { this.alertsOff = true; return; }   /* asked once, at the first Begin */
    this.alertsOff = false;
    const list = alertsAfter({ startedAt: r.startedAt, minutes: r.minutes, count: r.count }, this.marks(r), epochOf(this.now));
    for (const [i, a] of list.slice(0, ids.length).entries()) {
      await platform.notifier.at(ids[i], this.realDate(a.at), t(a.what === 'delveEnd' ? 'notify.delveEnd.title' : 'notify.breatherEnd.title'),
        t(a.what === 'delveEnd' ? 'notify.delveEnd.body' : 'notify.breatherEnd.body'));
    }
  }

  /** Dan's marks on a run (Start it now, Pause, Back to the delve), as the run's rules read them. */
  marks(r: RunView): RunMark[] {
    return this.facts.filter(f => f.seq > r.seq && ['breatherSkipped', 'delveHeld', 'delveResumed'].includes(f.type))
      .map(f => ({ kind: f.type === 'breatherSkipped' ? 'skip' : f.type === 'delveHeld' ? 'hold' : 'resume', at: epochOf(f.at) }));
  }

  /** The delve's panel on the lock screen and in the Dynamic Island (D-094): shown while a run is on, redrawn only when
      what it says changes (a new delve, a breather, a pause), and gone when the run ends. Its countdown and ring are
      ticked by the phone, so nothing here runs while the phone is locked. */
  #panel = '';
  panel() {
    const r = this.view.run;
    if (!r) {
      if (this.#panel !== 'none') { this.#panel = 'none'; void platform.panel.end(); }   /* also clears one left by a closed app */
      return;
    }
    const p = panelOf(r, this.marks(r), epochOf(this.now), {
      place: this.view.here.name, past: this.view.done.has(r.job.id),
      real: ms => this.realDate(ms).getTime(),
      clock: ms => { const d = new Date(ms); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; },
    });
    const key = JSON.stringify(p);
    if (key === this.#panel) return;
    this.#panel = key;
    void platform.panel.show(p);
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
    this.panel();
  }
  reset() {
    /* even a wipe keeps one copy aside, so a slip can be undone (D-080) */
    const prev = platform.store.get(this.saveKey);
    if (prev) platform.store.set(`${this.saveKey}.wiped`, prev);
    platform.store.remove(this.saveKey);
    if (this.proto.rehearsal) { this.setRehearsal(true); return; }
    this.facts = [];
    this.do({ do: 'open' });
    this.panel();
  }
}

export const game = new Game();
