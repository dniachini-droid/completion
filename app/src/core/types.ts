/**
 * The shapes the rules work with (DATA_MODEL.md). Content types only: no content lives here.
 */
import type { Moment } from './time';
import type { Story } from './story-types';

export type Capacity = 'low' | 'normal' | 'high';

/** Anything Dan does (DATA_MODEL.md → Job). Dan's own data; the prototype preloads a throwaway set. */
export interface Job {
  id: string;
  name: string;
  /** A delve job runs on the ring; any other is begun, then marked done (D-041). */
  delve: boolean;
  /** Usual length in minutes: a no-timer job earns this (BALANCING §1). */
  length: number;
  /** Old saves only: a "usual session", read as the job's minutes (D-124). */
  enoughAt?: number;
  /** "I tend to put this off" (D-030, P5). */
  avoided?: boolean;
  /** Repeating delves are done at enough; one-offs and no-timer jobs when Dan says so (PLANNER.md). */
  doneBy: 'enough' | 'dan';
  /** The tiny physical first step "I can't start" offers (TOOLS.md). */
  firstStep?: string;
  /** A line from the satchel or the week (TOOLS §2): offered on Today only when planned for the day. */
  item?: boolean;
  /** Wanted by this date (YYYY-MM-DD): a satchel line or a one-off (D-114). Never a red mark or a count (D-038). */
  by?: string;
  /** One line of Dan's own: where he stopped, or anything to keep with the job (D-112). */
  note?: string;
  /** Dan's list for the job, a line at a time (a shopping list: "shampoo", then "milk" days later) (D-126). */
  list?: string;
  /** The list's lines struck off in the delve under way (their places in the list): they go when it ends (D-126). */
  struck?: number[];
  /** Its rhythm was stopped (set by `live`): it leaves Today, the plan and Choose a delve until it repeats again. */
  stopped?: boolean;
}

/** What repeats (PLANNER.md → Rhythms; DATA_MODEL.md → Rhythm). Dan's own data; editing arrives with the planner (slice 4). */
export interface Rhythm {
  id: string;
  /** The job each session is. */
  job: string;
  /** N a week… */
  times?: number;
  /** …or on set weekdays (0 Sunday … 6 Saturday)… */
  days?: number[];
  /** …or once every 2 weeks… */
  every?: 2;
  /** …or monthly: a day of the month (31: the last day of a shorter month), or its nth weekday (nth -1: the last)… (D-114) */
  monthly?: { day: number } | { nth: 1 | 2 | 3 | 4 | -1; weekday: number };
  /** …or yearly, on "MM-DD" (birthdays, renewals)… */
  yearly?: string;
  /** …or every N days since it was last done. */
  everyDays?: number;
  /** An appointment's time, "18:00". */
  time?: string;
}

export interface Content {
  version: string;
  jobs: Job[];
  rhythms: Rhythm[];
  story: Story;
  /** The content as shipped, before Dan's edits (set by `live`, core/week.ts). */
  base?: Content;
}

/** One entry in the fact log (ARCHITECTURE.md → How state works). Appended, never edited. */
export type Fact = { seq: number; at: Moment; day: string } & FactBody;

export type FactBody =
  /* what Dan did */
  | { type: 'opened' }
  | { type: 'capacityChosen'; capacity: Capacity; suggested: Capacity }
  | { type: 'swapped'; from: string; to: string }
  /** Taken off today's list ("Not today"): it stays Dan's, and comes back tomorrow or once he begins it again. */
  | { type: 'setAside'; job: string }
  /** Chosen as the next job after the day's work is done (a tap on it, D-077). */
  | { type: 'picked'; job: string }
  /** A job set aside and then put back on today's list (an undo of "Not today", Dan's own). */
  | { type: 'putBack'; job: string }
  | { type: 'jobBegun'; job: string; from: 'app' | 'record' }
  /** Begin taken back ("I haven't started"): the job is no longer under way, as if Begin had never been tapped. */
  | { type: 'beginUndone'; job: string }
  /** `errands`: an errand run (D-139): several jobs in one delve, struck off as they are done; `job` is then ERRAND_RUN */
  | { type: 'delveStarted'; job: string; minutes: number; count: number; errands?: string[] }
  /** An errand struck off (or back) in the errand run `run` (D-139) */
  | { type: 'errandStruck'; run: number; job: string }
  /** An errand's share of its run's minutes (D-139): the job's own count, never the road's (the run moved Dan once) */
  | { type: 'errandShare'; run: number; job: string; minutes: number }
  /** An errand run's errands counted, at its end, once Dan has struck off what got done (D-139) */
  | { type: 'errandsCounted'; run: number }
  | { type: 'breatherSkipped' }
  /** Paused: by hand (Pause), or by going into another app (why 'away', D-094), stamped when Dan left. */
  | { type: 'delveHeld'; why?: 'away' }
  | { type: 'delveResumed' }
  | { type: 'delveEnded'; job: string; minutes: number; how: 'ranOut' | 'finishedHere'; run: number }
  /** `today`: of `minutes`, those delved on the record's own day, when fewer (a one-off's carried minutes, D-133) */
  /** `errand`: struck off in that errand run (D-139) */
  | { type: 'jobDone'; job: string; minutes: number; today?: number; ticked?: number; errand?: number }
  /** "Not done after all" (D-131): the latest done record of the job on `on` no longer counts; what it earned stays */
  | { type: 'doneUndone'; job: string; on: string }
  /** Tonight's "Tomorrow starts with" (D-131): the job Today opens with on `on` (the next game day); null: as planned */
  | { type: 'firstChosen'; job: string | null; on: string }
  /** "Waiting on…" (D-137): a one-off Dan can't finish until someone replies, set aside until `until` (a game day), with
      an optional line of who or what (`who`: "the vet"). Set again: "Still waiting", a new date */
  | { type: 'waitSet'; job: string; until: string; who?: string }
  /** "Back to it" (D-137): an ordinary job again */
  | { type: 'waitEnded'; job: string }
  | { type: 'cantStartUsed'; job: string }
  | { type: 'seen'; what: 'step' | 'arrival' | 'morning' | 'welcome'; ref: number }
  /* what the world gave (worked out once, then kept) */
  /** `tick`: minutes Dan gave a job he ticked off without a delve (D-134) */
  | { type: 'stepsGained'; minutes: number; job: string; run?: number; tick?: true }
  | { type: 'dayCompleted' }
  | { type: 'arrived'; kind: 'place' | 'camp'; id: string; how?: 'foot' | 'key' }
  /* the story (slice 2): each written once, when it happens */
  | { type: 'beatPlayed'; id: string; job?: number; passage?: string }
  | { type: 'keyEarned'; rhythm: string }
  /** A Key earned while nothing Dan has reached is sealed: kept, and used on the next arrival that has one (D-079). */
  | { type: 'keyHeld' }
  | { type: 'keyUsed' }
  /** `road`: opened by the road on foot, with no Key (D-129). */
  | { type: 'sealOpened'; seal: string; how?: 'road' }
  | { type: 'findGiven'; id: string; why: 'avoided' | 'switching' | 'chamber' | 'camp' | 'surplus' | 'morning' | 'dated'; job?: number }
  | { type: 'recordShown'; id: string }
  | { type: 'storyWeekBegan'; w: number }
  /* Dan's small choices on a beat (never gating) and his guesses at marks */
  | { type: 'markGuessed'; mark: string; guess: string }
  | { type: 'choiceMade'; beat: string; pick: number }
  | { type: 'recordOpened'; id: string }
  /* the week and the gaps (slice 4): Dan's own rhythms and lines, the plan, bedtime, the week close, absence */
  | { type: 'rhythmSaved'; rhythm: Rhythm; job: Job }
  | { type: 'rhythmStopped'; id: string }
  /** A job edited or added by itself (the job editor, D-112): its whole new shape. Removed: gone from every list. */
  | { type: 'jobSaved'; job: Job }
  | { type: 'jobRemoved'; id: string }
  /* a done record deleted (D-125): that day's record of a repeating job leaves the lists; its minutes stay. `back`: Undo */
  | { type: 'doneHidden'; job: string; on: string; back?: boolean }
  /** The week's look-ahead in the Daybook (D-116): a line kept or put to someday by hand, the one thing that matters
      most this week (null: nothing in particular), and whether the look-ahead was opened and finished (the test's notes). */
  | { type: 'itemKept'; id: string }
  | { type: 'itemSomeday'; id: string }
  | { type: 'weekPinned'; week: string; job: string | null }
  | { type: 'lookAheadSeen'; week: string; finished: boolean }
  /** The phone's calendar, read-only (D-115): shown or not, and which calendars (null: all). */
  | { type: 'calendarChosen'; on: boolean; calendars: string[] | null }
  /** What the calendar held for the days ahead when it was last read: written only when it changed, so a plan made
      from it can always be explained later (ARCHITECTURE → facts). Events never become jobs and earn nothing. */
  | { type: 'calendarRead'; from: string; to: string; events: CalEvent[] }
  /** The re-entry nudge, off unless Dan turns it on (D-113) */
  | { type: 'nudgeChosen'; on: boolean }
  /** `via`: said to Siri, Shortcuts or the Action button; `ref`: that line's own id, so it is never added twice (D-113);
      `from`: a job Dan had before, picked in the Satchel's box (D-136): the new job starts with its list, note, first
      step, avoided mark and minutes; or parked mid-delve, `run` being that delve's run (D-138) */
  | { type: 'itemAdded'; id: string; name: string; via?: 'siri' | 'park'; ref?: string; from?: string; run?: number }
  /** "No thanks" to the Satchel's "keeps coming back" offer (D-136): never asked again for that name (as nameKey has it) */
  | { type: 'repeatDeclined'; name: string }
  | { type: 'itemTicked'; id: string }
  | { type: 'itemDropped'; id: string }
  | { type: 'planMade'; week: string; entries: PlanEntry[] }
  | { type: 'planChanged'; entry: string; day: string | null; time?: string | null }
  | { type: 'planAdded'; entry: PlanEntry }
  | { type: 'bedtimeSet'; time: string }
  | { type: 'goodnight'; kept: boolean }
  | { type: 'deepCalled' }
  | { type: 'weekClosed'; week: string; n: number; learned: string[]; soFar: string[]; glimpse: string | null; seals: string[] }
  | { type: 'closeRead'; week: string }
  | { type: 'offerAnswered'; week: string }
  | { type: 'welcomed'; since: string; question: string | null }
  /* reminders (D-107): opt-in, one per item, only for things with a time (core/reminders.ts); null turns one off */
  /** lead: minutes before a time; for a date (`d:<job>`, D-114) 0 is its morning and 1440 the day before */
  | { type: 'reminderSet'; target: string; lead: 0 | 15 | 60 | 1440 | null }
  | { type: 'remindersSwitched'; on: boolean }

/** One event from the phone's calendar (D-115): local wall-clock times ("YYYY-MM-DDTHH:MM"), all-day ones by date. */
export interface CalEvent { id: string; cal: string; title: string; start: string; end: string; allDay: boolean; }

/** One job placed on a day of the week plan (PLANNER.md). A forecast: moving it earns nothing and loses nothing. */
export interface PlanEntry { id: string; job: string; day: string; time?: string; }

export type FactOf<T extends FactBody['type']> = Fact & Extract<FactBody, { type: T }>;
