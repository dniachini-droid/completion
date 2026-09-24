/**
 * The screens' one handle on the game: the fact log, saved as it grows; the clock; what can be seen now.
 * Rules live in core; this file only reads the clock, keeps the save and schedules the phone's alerts.
 */
import { act, alertsAfter, see, settle, type Command } from '../core/game';
import { epochOf, momentOf, type Moment } from '../core/time';
import type { Fact } from '../core/types';
import { prototype as content } from '../content/world/prototype';
import { platform } from '../platform';
import { t } from '../content/copy/en';

export { content };

const SAVE_VERSION = 1;
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
    this.#ticker = window.setInterval(() => this.tick(), 250);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.tick(); });
  }

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

  load(): Fact[] {
    try {
      const s: Save = JSON.parse(platform.store.get(this.saveKey) ?? 'null');
      if (s && s.version === SAVE_VERSION && Array.isArray(s.facts)) return s.facts;
    } catch { /* a broken prototype save starts afresh */ }
    return [];
  }
  save() {
    const s: Save = { version: SAVE_VERSION, content: content.version, facts: this.facts };
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
    return f;
  }

  tick() {
    const before = this.view.run;
    this.now = this.clock();
    if (!before) return;
    const f = settle(this.facts, content, this.now);
    this.append(f);
    const after = this.view.run;
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
    if (!(await platform.notifier.permit())) return;   /* asked once, at the first Begin */
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
  }
  reset() {
    platform.store.remove(this.saveKey);
    if (this.proto.rehearsal) { this.setRehearsal(true); return; }
    this.facts = [];
    this.do({ do: 'open' });
  }
}

export const game = new Game();
