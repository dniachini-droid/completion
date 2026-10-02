/**
 * The screens' one handle on the game: the fact log, saved as it grows; the clock; what can be seen now.
 * Rules live in core; this file only reads the clock, keeps the save and schedules the phone's alerts.
 */
import { act, alertsAfter, runs, see, settle, type Command, type RunView } from '../core/game';
import type { RunMark } from '../core/run';
import { panelOf } from './panel';
import { steady } from './taps';
import { epochOf, momentOf, type Moment } from '../core/time';
import type { Fact, Job, Rhythm } from '../core/types';
import { content } from '../content/world';
import { platform } from '../platform';
import { t } from '../content/copy/en';
import { COPIES_KEPT, copyDue, copyName, factsSound, readSave, SAVE_VERSION, WEEKLY_PREFIX, weeklyName, whyUnreadable, type Save } from '../core/save';
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
  /* raw: the log is only ever replaced, never changed in place, so it is not watched fact by fact (deep review F#1) */
  facts = $state.raw<Fact[]>([]);
  /* the true log, plain: a screen's teardown reads a signal's value from before the tap that closed it, so every write
     works from this field, never from the signal; a teardown can then never shrink the log (deep review NEW-1) */
  #log: Fact[] = [];
  /** The log as it is now, whoever asks (a teardown included). */
  get log(): Fact[] { return this.#log; }
  #setLog(log: Fact[]) { this.#log = log; this.facts = log; }
  now = $state<Moment>('2000-01-01T00:00:00Z');
  view = $derived(see(this.facts, content, this.now));
  #ticker = 0;

  constructor() {
    this.now = this.clock();
    this.#setLog(this.load());
    /* the phone closed the app while Dan was in another one: that time is taken off first (D-094) */
    if (platform.away.first !== null) { this.away(platform.away.first); void this.forget(platform.away.first); }
    this.append(settle(this.#log, content, this.now));
    this.do({ do: 'open' });
    this.panel();
    void this.reminders();
    void this.weekly();
    void this.drain();
    void this.readCalendar();
    platform.calendar.onChange(() => void this.readCalendar());
    platform.inbox.onAdd?.(() => void this.drain());
    this.#beat();
    document.addEventListener('visibilitychange', () => { if (!document.hidden) void this.wake(); });
    window.addEventListener('focus', () => void this.wake());
    this.native();
  }

  /** Counts each time the log was replaced (Restore, a wipe, the rehearsal), so the screens forget what they kept by a
      fact's number (C#19). */
  logs = $state(0);
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
    if (left !== null) { this.away(left); void this.forget(left); }
    this.append(settle(this.#log, content, this.now));
    const today = this.view.day;
    if (!this.#log.some(f => f.type === 'opened' && f.day === today)) { this.do({ do: 'open' }); this.woke++; }
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
      /* written to the save before it leaves the inbox: an app killed in between loses nothing (P#8) */
      await (platform.saves as { flush?: () => Promise<void> }).flush?.().catch(() => {});
      await platform.inbox.clear(lines.map(x => x.id));
    } finally { this.#draining = false; }
  }

  /** The phone's calendar, read-only (D-115): the next two weeks, read on opening, on return and when it changes;
      written down only when it changed. Nothing is read while it's off. */
  async readCalendar() {
    if (!calendarOf(this.#log).on) return;
    /* a read that failed (or was refused) is no read: never written as an empty calendar (deep review P#6, C#6) */
    const events = await platform.calendar.events(CAL_DAYS);
    if (events === null) return;
    this.do({ do: 'calendarRead', events, days: CAL_DAYS });
  }

  /** Dan went into another app at `leftAt` (the phone's ms) and is back now: the delve paused where he left (D-094).
      The phone silenced the delve's alerts when he left, so `do` sets them again from what is true now. */
  away(leftAt: number) {
    this.#watched = '-';   /* the phone stopped watching when it saw him leave: it is told again */
    this.do({ do: 'away', from: this.gameMs(leftAt), to: this.clockMs() });
  }

  /** The time away written to the save: then the phone may forget it (P#8). */
  async forget(at: number) {
    await (platform.saves as { flush?: () => Promise<void> }).flush?.().catch(() => {});
    await platform.away.clear?.(at);
  }

  /** A job as Dan has it now (his edits and the jobs he added included). */
  job(id: string) { return this.view.content.jobs.find(j => j.id === id); }

  /** What was just deleted, for its Undo (D-125): shown until Dan goes to another screen. */
  deleted = $state<{ job: Job; rhythm: Rhythm | null; on?: string } | null>(null);
  /** A job that couldn't be deleted because its delve is under way: said once, where Dan tried (D-126 review). */
  cantDelete = $state<{ job: string; ended: boolean } | null>(null);
  /** Delete a job from everywhere (Dan, D-125): the minutes it already counted for stay. Never the job of a delve that
      is running or paused: its end still has to be answered. */
  remove(id: string) {
    /* the list moves under the finger: a quick second tap is not a second Delete (break-it review 3) */
    steady();
    const job = this.job(id);
    if (!job) return;
    /* nor the job whose delve's end is still to be answered (break-it review, R5) */
    /* nor an errand of a run under way, or of one whose end is still to be looked at (D-139) */
    const v = this.view;
    const running = v.run?.job.id === id || !!v.run?.errands?.some(e => e.job.id === id);
    /* (a delve already over, its end still to answer, is said as that, never "in a delve", deep review C#13) */
    if (running || v.runEnd?.job.id === id || v.runEnd?.errands?.some(e => e.job.id === id)) { this.deleted = null; this.cantDelete = { job: job.name, ended: !running }; return; }
    this.cantDelete = null;
    this.deleted = { job: { ...job }, rhythm: this.view.content.rhythms.find(r => r.job === id) ?? null };
    this.do({ do: 'removeJob', id });
  }
  /** Delete a done record (Dan: "just delete the record of the job, not the minutes"): a repeating job keeps repeating
      and only that day's record goes; a one-off, finished, goes altogether. */
  removeDone(id: string, on: string) {
    steady();
    const job = this.job(id);
    if (!job) return;
    if (!this.view.content.rhythms.some(r => r.job === id)) { this.remove(id); return; }
    this.deleted = { job: { ...job }, rhythm: null, on };
    this.do({ do: 'hideDone', job: id, on });
  }
  undoRemove() {
    steady();
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
  /** The save can't be used by this build (deep review B15): from a newer version, or broken. Nothing is written over it
      and the game does not start on it: the screen says so, and offers a copy of it. */
  blocked = $state<'newer' | 'broken' | null>(null);

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
    /* never a fresh game written over it (B15): the game stays shut on this save until a build can read it */
    this.blocked = whyUnreadable(raw) ?? 'broken';
    return [];
  }
  #backedUp = '';
  /** The facts written as they happen: on the phone only the new ones, each time in one step (D-106). */
  save() {
    /* a save this build can't read is never written over (B15) */
    if (this.blocked) return;
    const saves = platform.saves;
    /* once a day, yesterday's save is copied to a backup before today's writes (D-080); the day it was made is kept, so
       a restart never makes it again (deep review P#15) */
    const day = this.view?.day ?? '';
    if (day && day !== this.#backedUp) {
      this.#backedUp = day;
      const dayKey = `${this.saveKey}.backupDay`;
      if (platform.store.get(dayKey) !== day) {
        const prev = saves.get(this.saveKey);
        if (prev) saves.keep(`${this.saveKey}.backup`, prev);
        platform.store.set(dayKey, day);
      }
    }
    const s: Save = { version: SAVE_VERSION, content: content.version, facts: this.#log };
    saves.write(this.saveKey, s);
  }
  append(f: Fact[]) {
    if (!f.length) return;
    this.#setLog(this.#log.concat(f));
    this.save();
  }

  /** Dan does something: the facts are written at once, in one step. */
  do(cmd: Command): Fact[] {
    if (this.blocked) return [];
    /* a tap on the delve in the moment the return from another app is being taken waits for it, so the time away is never
       counted as delving (deep review C#5); only these, whose callers never read what they wrote */
    if (this.#waking && ['finishHere', 'stepAway', 'resume', 'skipBreather'].includes(cmd.do)) { void this.#waking.then(() => this.do(cmd)); return []; }
    this.now = this.clock();
    const before = this.view.run;
    const f = act(this.#log, content, cmd, this.now);
    this.append(f);
    /* any change of the run, whatever the command (Delve now, the Satchel's, the errand run…), lays out its alerts and
       panel again: a list of commands missed some (deep review C#1) */
    const after = this.view.run;
    if (before?.seq !== after?.seq || before?.phase !== after?.phase || before?.k !== after?.k || cmd.do === 'away') { void this.alerts(); this.panel(); }
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
  /** The clock looks once a second, just after each whole second of the phone's clock, so a delve's countdown shows
      each new second at once and the phone is woken once a second rather than four times (D-132). A rehearsal's
      clock runs 60 times faster: it still looks four times a second. */
  #beat() {
    const wait = this.proto.rehearsal ? 250 : 1000 - (platform.now().getTime() % 1000) + 15;
    this.#ticker = window.setTimeout(() => { try { this.tick(); } finally { this.#beat(); } }, wait);
  }
  tick() {
    /* in the background, or just back and not yet told how long Dan was away: nothing is settled (D-094) */
    if (document.hidden || this.#waking) return;
    const before = this.view.run;
    /* with no delve running, the clock only matters by the minute: the view is not rebuilt four times a second */
    const ms = this.clockMs(), m = Math.floor(ms / 60_000), s = Math.floor(ms / 1000);
    if (!before && m === this.#minute) return;
    /* during a delve, by the second: the countdown shows whole seconds, so the view is rebuilt once a second (D-100);
       the clock looks just after each whole second, so each new second shows at once (D-132) */
    if (before && s === this.#second) return;
    this.#minute = m; this.#second = s;
    this.now = this.clock();
    if (!before) {
      if (!this.#log.some(f => f.type === 'opened' && f.day === this.view.day)) this.wake();   /* past 04:00 with the app open */
      return;
    }
    const f = settle(this.#log, content, this.now);
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
  /* one batch at a time, in order, as the reminders are: a Pause in the middle of the first Begin's batch never leaves
     its alerts behind (deep review B16, C#7) */
  #alerting: Promise<void> = Promise.resolve();
  alerts() { return (this.#alerting = this.#alerting.then(() => this.#alerts()).catch(() => {})); }
  async #alerts() {
    const ids = ALERT_IDS;
    await platform.notifier.cancel(ids);
    if (!this.view.run || !platform.notifier.locked) return;
    if (!(await platform.notifier.permit())) { this.alertsOff = true; return; }   /* asked once, at the first Begin */
    /* the run as it is now, after the waits above */
    const r = this.view.run;
    if (!r) return;
    this.alertsOff = false;
    const list = alertsAfter({ startedAt: r.startedAt, minutes: r.minutes, count: r.count }, this.marks(r), epochOf(this.now));
    for (const [i, a] of list.slice(0, ids.length).entries()) {
      /* one that fails never stops the rest (deep review P#24) */
      await platform.notifier.at(ids[i], this.realDate(a.at), t(a.what === 'delveEnd' ? 'notify.delveEnd.title' : 'notify.breatherEnd.title'),
        t(a.what === 'delveEnd' ? 'notify.delveEnd.body' : 'notify.breatherEnd.body')).catch(() => {});
    }
  }

  /** The reminders Dan asked for (D-107), laid out for the week ahead: worked out by the rules (core/reminders.ts),
      and put on the phone again only when the list changes. Nothing is asked of the phone until one is wanted. */
  #reminded = '';
  #snoozeChecked = '';
  #reminding: Promise<void> = Promise.resolve();
  reminders() { return (this.#reminding = this.#reminding.then(() => this.#remind()).catch(() => {})); }
  async #remind() {
    if (!platform.notifier.locked) return;
    const list = alertsDue(content, this.#log, this.clock()).slice(0, REMIND_IDS.length);
    const words = list.map(a => ({ a, ...this.remindWords(a) }));
    /* the re-entry nudge (D-113): a nudge set earlier whose time has passed came while the app was closed */
    const st = platform.store, set = Number(st.get('nudge.at') ?? 0);
    if (set && set <= platform.now().getTime()) { st.set('nudge.last', st.get('nudge.day') ?? ''); st.remove('nudge.at'); }
    const nday = nudgeDay(this.#log, st.get('nudge.last') || null);
    const nwhen = nday ? this.realDate(new Date(+nday.slice(0, 4), +nday.slice(5, 7) - 1, +nday.slice(8, 10), NUDGE_HOUR, 0).getTime()) : null;
    const nudge = nwhen && nwhen.getTime() > platform.now().getTime() ? nwhen : null;
    /* the instants too, not only the wall-clock times: after a time-zone change they are laid out again (P#2) */
    const instant = (w: { a: Alert }) => { const [y, m, d] = w.a.date.split('-').map(Number), [h, min] = w.a.clock.split(':').map(Number); return this.realDate(new Date(y, m - 1, d, h, min).getTime()).getTime(); };
    const key = JSON.stringify([words.map(w => [w.a.date, w.a.clock, w.title, w.body, instant(w)]), nudge?.getTime() ?? 0]);
    /* a snooze ("Again in 10 min", laid out by the phone) for a job since done or deleted is cancelled (B12, P#7a) */
    /* (looked at only when what is done, or the jobs, changed: not a call to the phone on every tap) */
    const doneKey = `${[...this.view.done].join()}|${this.view.content.jobs.map(j => j.id).join()}`;
    if (doneKey !== this.#snoozeChecked) {
      this.#snoozeChecked = doneKey;
      const snoozed = await platform.notifier.pending(AGAIN_IDS);
      const stale = snoozed.filter(x => x.job && (!this.job(x.job) || this.view.done.has(x.job))).map(x => x.id);
      if (stale.length) await platform.notifier.cancel(stale).catch(() => {});
    }
    if (key === this.#reminded) return;
    await platform.notifier.cancel([...REMIND_IDS, NUDGE_ID]);
    if (!nudge) st.remove('nudge.at');
    if (!list.length && !nudge) { this.#reminded = key; return; }
    if (!(await platform.notifier.permit())) { this.alertsOff = true; return; }
    if (nudge) {
      await platform.notifier.at(NUDGE_ID, nudge, t('nudge.title'), t('nudge.body'));
      st.set('nudge.at', String(nudge.getTime())); st.set('nudge.day', nday!);
    }
    for (const [i, w] of words.entries()) {
      const [y, m, d] = w.a.date.split('-').map(Number), [h, min] = w.a.clock.split(':').map(Number);
      const when = this.realDate(new Date(y, m - 1, d, h, min).getTime());
      await platform.notifier.remind(REMIND_IDS[i], when, w.title, w.body, { label: t('remind.again'), ids: AGAIN_IDS }, w.a.job ?? undefined);
    }
    /* only once they are all laid out: a refusal or a failure part-way is tried again next time (P#9) */
    this.#reminded = key;
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
    return this.#log.filter(f => f.seq > r.seq && ['breatherSkipped', 'delveHeld', 'delveResumed'].includes(f.type))
      .map(f => ({ kind: f.type === 'breatherSkipped' ? 'skip' : f.type === 'delveHeld' ? 'hold' : 'resume', at: (f.type === 'delveHeld' ? f.from : undefined) ?? epochOf(f.at) }));
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
  copyText(): string { return JSON.stringify({ version: SAVE_VERSION, content: content.version, facts: this.#log } satisfies Save); }
  /** Save a copy: the phone's share sheet (Files, iCloud Drive…). */
  saveCopy() { return platform.copies.share(copyName(this.view.day), this.copyText()); }
  /** Once a week, a copy into the app's Documents folder, which the Files app shows; the last four kept. The real save only. */
  async weekly() {
    if (!platform.app || this.proto.rehearsal || this.blocked) return;
    try {
      const day = this.view.day;
      if (copyDue(await platform.copies.list(WEEKLY_PREFIX), day)) await platform.copies.keep(weeklyName(day), this.copyText(), WEEKLY_PREFIX, COPIES_KEPT);
    } catch { /* no copy this time; the next opening tries again */ }
  }
  /** Restore from a copy: what Dan has now is kept aside first (never overwritten), then the copy becomes the save and
      the game opens on it as on a cold start. */
  /** Whether a save can be restored: every fact shaped as one, and the game runs on it (deep review B14). */
  canRestore(s: Save): boolean { return factsSound(s.facts) && runs(s.facts, content, this.clock()); }
  restore(s: Save): boolean {
    /* tried on the rules before anything is written; refused plainly if it can't run */
    if (!this.canRestore(s)) return false;
    s = $state.snapshot(s) as Save;
    this.blocked = null;
    this.logs++;
    const saves = platform.saves, now = saves.get(this.saveKey);
    if (now) saves.keep(`${this.saveKey}.before-restore.${platform.now().getTime()}`, now);
    saves.write(this.saveKey, s);
    this.#setLog(s.facts);
    this.now = this.clock();
    this.append(settle(this.#log, content, this.now));
    this.do({ do: 'open' });
    this.#watched = '-'; this.native();
    this.panel();
    void this.alerts();
    void this.reminders();
    return true;
  }

  /* ---- prototype controls ---- */
  setRehearsal(on: boolean) {
    const real = platform.now().getTime(), d = new Date(real);
    d.setHours(8, 0, 0, 0);    /* a rehearsal starts at 08:00 today, so the whole day is ahead of it */
    this.proto = { rehearsal: on, anchorReal: real, anchorFake: d.getTime() };
    platform.store.set(PROTO_KEY, JSON.stringify(this.proto));
    this.logs++;
    this.#setLog(on ? [] : this.load());
    if (on) platform.saves.remove('save.rehearsal');
    this.now = this.clock();
    this.append(settle(this.#log, content, this.now));
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
    this.#setLog([]);
    this.logs++;
    this.do({ do: 'open' });
    this.panel();
    void this.alerts();   /* a wiped delve's alerts go too (C#19) */
  }
}

export const game = new Game();
