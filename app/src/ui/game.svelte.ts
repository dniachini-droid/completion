/**
 * The screens' one handle on the game: the fact log, saved as it grows; the clock; what can be seen now.
 * Rules live in core; this file only reads the clock, keeps the save and schedules the phone's alerts.
 */
import { act, alertsAfter, see, settle, type Command, type RunView } from '../core/game';
import type { RunMark } from '../core/run';
import { panelOf } from './panel';
import { epochOf, momentOf, type Moment } from '../core/time';
import type { Fact, Job, Rhythm } from '../core/types';
import { content } from '../content/world';
import { platform } from '../platform';
import { t } from '../content/copy/en';
import { COPIES_KEPT, COPY_PREFIX, copyDue, copyName, readSave, SAVE_VERSION, type Save } from '../core/save';
import { alertsDue, nudgeDay, NUDGE_HOUR, type Alert } from '../core/reminders';
import { calendarOf } from '../core/week';

export { content };


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
/** Reminders' ids (D-107): the week ahead's, laid out again on every change; and "Again in 10 min"'s, left alone by that.
    With the delve's, well under the 64 alerts a phone keeps waiting at once. */
const REMIND_IDS = Array.from({ length: 30 }, (_, i) => 200 + i);
const AGAIN_IDS = Array.from({ length: 6 }, (_, i) => 240 + i);
/** The re-entry nudge's one alert (D-113). */
const NUDGE_ID = 250;
/** How far ahead the calendar is read (D-115). */
const CAL_DAYS = 14;

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
    if (platform.away.first !== null) this.away(platform.away.first);
    this.append(settle(this.facts, content, this.now));
    this.do({ do: 'open' });
    this.panel();
    void this.reminders();
    void this.weekly();
    void this.drain();
    void this.readCalendar();
    platform.calendar.onChange(() => void this.readCalendar());
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
    const left = await platform.away.take();
    this.now = this.clock();
    if (left !== null) this.away(left);
    this.append(settle(this.facts, content, this.now));
    const today = this.view.day;
    if (!this.facts.some(f => f.type === 'opened' && f.day === today)) { this.do({ do: 'open' }); this.woke++; }
    else this.tick();
    this.native();
    void this.reminders();
    void this.weekly();
    void this.drain();
    void this.readCalendar();
    this.panel();   /* the panel may have run past what it knew while the app was away: put it right */
  }

  /** Lines said to Siri, typed in Shortcuts or sent from the Action button become jobs (D-113, D-117): written first,
      then cleared; a line written but not cleared (the app closed in between) is recognised by its id next time. */
  #draining = false;
  async drain() {
    if (this.#draining) return;
    this.#draining = true;
    try {
      const lines = await platform.inbox.take();
      if (!lines.length) return;
      this.do({ do: 'takeInbox', lines });
      await platform.inbox.clear(lines.map(x => x.id));
    } finally { this.#draining = false; }
  }

  /** The phone's calendar, read-only (D-115): the next two weeks, read on opening, on return and when it changes;
      written down only when it changed. Nothing is read while it's off. */
  async readCalendar() {
    if (!calendarOf(this.facts).on) return;
    const events = await platform.calendar.events(CAL_DAYS);
    this.do({ do: 'calendarRead', events, days: CAL_DAYS });
  }

  /** Dan went into another app at `leftAt` (the phone's ms) and is back now: the delve paused where he left (D-094).
      The phone silenced the delve's alerts when he left, so `do` sets them again from what is true now. */
  away(leftAt: number) {
    this.#watched = '-';   /* the phone stopped watching when it saw him leave: it is told again */
    this.do({ do: 'away', from: this.gameMs(leftAt), to: this.clockMs() });
  }

  /** A job as Dan has it now (his edits and the jobs he added included). */
  job(id: string) { return this.view.content.jobs.find(j => j.id === id); }

  /** What was just deleted, for its Undo (D-125): shown until Dan goes to another screen. */
  deleted = $state<{ job: Job; rhythm: Rhythm | null; on?: string } | null>(null);
  /** A job that couldn't be deleted because its delve is under way: said once, where Dan tried (D-126 review). */
  cantDelete = $state<string | null>(null);
  /** Delete a job from everywhere (Dan, D-125): the minutes it already counted for stay. Never the job of a delve that
      is running or paused: its end still has to be answered. */
  remove(id: string) {
    const job = this.job(id);
    if (!job) return;
    if (this.view.run?.job.id === id) { this.deleted = null; this.cantDelete = job.name; return; }
    this.cantDelete = null;
    this.deleted = { job: { ...job }, rhythm: this.view.content.rhythms.find(r => r.job === id) ?? null };
    this.do({ do: 'removeJob', id });
  }
  /** Delete a done record (Dan: "just delete the record of the job, not the minutes"): a repeating job keeps repeating
      and only that day's record goes; a one-off, finished, goes altogether. */
  removeDone(id: string, on: string) {
    const job = this.job(id);
    if (!job) return;
    if (!this.view.content.rhythms.some(r => r.job === id)) { this.remove(id); return; }
    this.deleted = { job: { ...job }, rhythm: null, on };
    this.do({ do: 'hideDone', job: id, on });
  }
  undoRemove() {
    const d = this.deleted;
    if (!d) return;
    this.deleted = null;
    if (d.on) this.do({ do: 'hideDone', job: d.job.id, on: d.on, back: true });
    else this.do({ do: 'saveJob', job: d.job, rhythm: d.rhythm });
  }

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

  /** The save, read and brought up to this build's version (DATA_MODEL.md → migrations). A save this build can't use
      (unreadable, or from a newer version) is copied aside first, so nothing Dan did is ever lost by an update; a newer
      version's save is never written over (D-080). An older one is upgraded, after a copy of it is kept. */
  load(): Fact[] {
    const saves = platform.saves, raw = saves.get(this.saveKey);
    if (raw === null) return [];
    const read = readSave(raw);
    if (read && read.from !== SAVE_VERSION) {
      saves.keep(`${this.saveKey}.v${read.from}`, raw);
      saves.write(this.saveKey, read.save);
    }
    if (read) return read.save.facts;
    const key = `${this.saveKey}.kept.${platform.now().getTime()}`;
    saves.keep(key, raw);
    this.keptAside = key;
    return [];
  }
  #backedUp = '';
  /** The facts written as they happen: on the phone only the new ones, each time in one step (D-106). */
  save() {
    const saves = platform.saves;
    /* once a day, yesterday's save is copied to a backup before today's writes (D-080) */
    const day = this.view?.day ?? '';
    if (day && day !== this.#backedUp) {
      const prev = saves.get(this.saveKey);
      if (prev) saves.keep(`${this.saveKey}.backup`, prev);
      this.#backedUp = day;
    }
    const s: Save = { version: SAVE_VERSION, content: content.version, facts: this.facts };
    saves.write(this.saveKey, s);
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
    if (['startRun', 'skipBreather', 'stepAway', 'resume', 'finishHere', 'away'].includes(cmd.do) || (before && !this.view.run)) { void this.alerts(); this.panel(); }
    this.native();
    if (f.length) void this.reminders();
    return f;
  }

  /* ---- leaving the app during a delve (D-094) ---- */
  #watched = '';
  /** The phone watches for another app only while a delve or breather runs (not while paused, not between runs). */
  native() {
    const r = this.view.run, on = !!r && r.phase !== 'held', key = on ? `${r!.seq}` : '';
    if (key === this.#watched) return;
    this.#watched = key;
    platform.away.watch(on, ALERT_IDS);
  }
  /** The phone's clock (ms) as the game's (the rehearsal runs 60 times faster). */
  gameMs(real: number): number {
    const p = this.proto;
    return p.rehearsal ? p.anchorFake + (real - p.anchorReal) * REHEARSAL_SPEED : real;
  }

  #minute = 0;
  #second = 0;
  tick() {
    /* in the background, or just back and not yet told how long Dan was away: nothing is settled (D-094) */
    if (document.hidden || this.#waking) return;
    const before = this.view.run;
    /* with no delve running, the clock only matters by the minute: the view is not rebuilt four times a second */
    const ms = this.clockMs(), m = Math.floor(ms / 60_000), s = Math.floor(ms / 1000);
    if (!before && m === this.#minute) return;
    /* during a delve, by the second: the countdown shows whole seconds, so the view is rebuilt once a second, not four
       times (the tick still looks four times a second, so each new second shows within a quarter of it) (D-100) */
    if (before && s === this.#second) return;
    this.#minute = m; this.#second = s;
    this.now = this.clock();
    if (!before) {
      if (!this.facts.some(f => f.type === 'opened' && f.day === this.view.day)) this.wake();   /* past 04:00 with the app open */
      return;
    }
    const f = settle(this.facts, content, this.now);
    this.append(f);
    const after = this.view.run;
    this.native();
    if (!after || after.phase !== before.phase || after.k !== before.k) this.panel();
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
    const list = alertsAfter({ startedAt: r.startedAt, minutes: r.minutes, count: r.count }, this.marks(r), epochOf(this.now));
    for (const [i, a] of list.slice(0, ids.length).entries()) {
      await platform.notifier.at(ids[i], this.realDate(a.at), t(a.what === 'delveEnd' ? 'notify.delveEnd.title' : 'notify.breatherEnd.title'),
        t(a.what === 'delveEnd' ? 'notify.delveEnd.body' : 'notify.breatherEnd.body'));
    }
  }

  /** The reminders Dan asked for (D-107), laid out for the week ahead: worked out by the rules (core/reminders.ts),
      and put on the phone again only when the list changes. Nothing is asked of the phone until one is wanted. */
  #reminded = '';
  #reminding: Promise<void> = Promise.resolve();
  reminders() { return (this.#reminding = this.#reminding.then(() => this.#remind()).catch(() => {})); }
  async #remind() {
    if (!platform.notifier.locked) return;
    const list = alertsDue(content, this.facts, this.clock()).slice(0, REMIND_IDS.length);
    const words = list.map(a => ({ a, ...this.remindWords(a) }));
    /* the re-entry nudge (D-113): a nudge set earlier whose time has passed came while the app was closed */
    const st = platform.store, set = Number(st.get('nudge.at') ?? 0);
    if (set && set <= platform.now().getTime()) { st.set('nudge.last', st.get('nudge.day') ?? ''); st.remove('nudge.at'); }
    const nday = nudgeDay(this.facts, st.get('nudge.last') || null);
    const nwhen = nday ? this.realDate(new Date(+nday.slice(0, 4), +nday.slice(5, 7) - 1, +nday.slice(8, 10), NUDGE_HOUR, 0).getTime()) : null;
    const nudge = nwhen && nwhen.getTime() > platform.now().getTime() ? nwhen : null;
    const key = JSON.stringify([words.map(w => [w.a.date, w.a.clock, w.title, w.body]), nudge?.getTime() ?? 0]);
    if (key === this.#reminded) return;
    this.#reminded = key;
    await platform.notifier.cancel([...REMIND_IDS, NUDGE_ID]);
    if (!nudge) st.remove('nudge.at');
    if (!list.length && !nudge) return;
    if (!(await platform.notifier.permit())) { this.alertsOff = true; return; }
    if (nudge) {
      await platform.notifier.at(NUDGE_ID, nudge, t('nudge.title'), t('nudge.body'));
      st.set('nudge.at', String(nudge.getTime())); st.set('nudge.day', nday!);
    }
    for (const [i, w] of words.entries()) {
      const [y, m, d] = w.a.date.split('-').map(Number), [h, min] = w.a.clock.split(':').map(Number);
      const when = this.realDate(new Date(y, m - 1, d, h, min).getTime());
      await platform.notifier.remind(REMIND_IDS[i], when, w.title, w.body, { label: t('remind.again'), ids: AGAIN_IDS });
    }
  }
  /** A reminder's words, in the app's voice. */
  remindWords(a: Alert): { title: string; body: string } {
    if (a.kind === 'bedtime') return { title: t('remind.bed.title', { time: a.time }), body: t(`remind.bed.${a.lead as 0 | 15 | 60}`) };
    /* a date (D-114): its words never say "late" or count days */
    if (a.kind === 'by') return { title: this.job(a.job ?? '')?.name ?? '', body: t(a.lead ? 'remind.by.before' : 'remind.by.day') };
    return { title: this.job(a.job ?? '')?.name ?? '', body: t(`remind.job.${a.lead as 0 | 15 | 60}`, { time: a.time }) };
  }

  /** Dan's marks on a run (Start it now, Pause, Back to the delve), as the run's rules read them. */
  marks(r: RunView): RunMark[] {
    return this.facts.filter(f => f.seq > r.seq && ['breatherSkipped', 'delveHeld', 'delveResumed'].includes(f.type))
      .map(f => ({ kind: f.type === 'breatherSkipped' ? 'skip' : f.type === 'delveHeld' ? 'hold' : 'resume', at: epochOf(f.at) }));
  }

  /** The delve's panel on the lock screen and in the Dynamic Island (D-095): shown while a run is on, redrawn only when
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

  /* ---- copies of the save (D-107) ---- */
  /** The save as a file: the same text the phone keeps, readable by `readSave` on any later build. */
  copyText(): string { return JSON.stringify({ version: SAVE_VERSION, content: content.version, facts: this.facts } satisfies Save); }
  /** Save a copy: the phone's share sheet (Files, iCloud Drive…). */
  saveCopy() { return platform.copies.share(copyName(this.view.day), this.copyText()); }
  /** Once a week, a copy into the app's Documents folder, which the Files app shows; the last four kept. The real save only. */
  async weekly() {
    if (!platform.app || this.proto.rehearsal) return;
    try {
      const day = this.view.day;
      if (copyDue(await platform.copies.list(COPY_PREFIX), day)) await platform.copies.keep(copyName(day), this.copyText(), COPY_PREFIX, COPIES_KEPT);
    } catch { /* no copy this time; the next opening tries again */ }
  }
  /** Restore from a copy: what Dan has now is kept aside first (never overwritten), then the copy becomes the save and
      the game opens on it as on a cold start. */
  restore(s: Save) {
    const saves = platform.saves, now = saves.get(this.saveKey);
    if (now) saves.keep(`${this.saveKey}.before-restore.${platform.now().getTime()}`, now);
    saves.write(this.saveKey, s);
    this.facts = s.facts;
    this.now = this.clock();
    this.append(settle(this.facts, content, this.now));
    this.do({ do: 'open' });
    this.#watched = '-'; this.native();
    this.panel();
    void this.alerts();
    void this.reminders();
  }

  /* ---- prototype controls ---- */
  setRehearsal(on: boolean) {
    const real = platform.now().getTime(), d = new Date(real);
    d.setHours(8, 0, 0, 0);    /* a rehearsal starts at 08:00 today, so the whole day is ahead of it */
    this.proto = { rehearsal: on, anchorReal: real, anchorFake: d.getTime() };
    platform.store.set(PROTO_KEY, JSON.stringify(this.proto));
    this.facts = on ? [] : this.load();
    if (on) platform.saves.remove('save.rehearsal');
    this.now = this.clock();
    this.append(settle(this.facts, content, this.now));
    this.do({ do: 'open' });
    void this.alerts();   /* the other save's alerts go; this one's come back */
    this.#watched = '-'; this.native();
    this.panel();
  }
  reset() {
    /* even a wipe keeps one copy aside, so a slip can be undone (D-080) */
    const prev = platform.saves.get(this.saveKey);
    if (prev) platform.saves.keep(`${this.saveKey}.wiped`, prev);
    platform.saves.remove(this.saveKey);
    if (this.proto.rehearsal) { this.setRehearsal(true); return; }
    this.facts = [];
    this.do({ do: 'open' });
    this.panel();
  }
}

export const game = new Game();
