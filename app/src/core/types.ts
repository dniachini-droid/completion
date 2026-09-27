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
  /** Delve minutes in a day that count as its session (the Course: 50). Defaults to `length`. */
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
  | { type: 'delveStarted'; job: string; minutes: number; count: number }
  | { type: 'breatherSkipped' }
  /** Paused: by hand (Pause), or by going into another app (why 'away', D-094), stamped when Dan left. */
  | { type: 'delveHeld'; why?: 'away' }
  | { type: 'delveResumed' }
  | { type: 'delveEnded'; job: string; minutes: number; how: 'ranOut' | 'finishedHere'; run: number }
  | { type: 'jobDone'; job: string; minutes: number }
  | { type: 'cantStartUsed'; job: string }
  | { type: 'seen'; what: 'step' | 'arrival' | 'morning' | 'welcome'; ref: number }
  /* what the world gave (worked out once, then kept) */
  | { type: 'stepsGained'; minutes: number; job: string; run?: number }
  | { type: 'dayCompleted' }
  | { type: 'arrived'; kind: 'place' | 'camp'; id: string; how?: 'foot' | 'key' }
  /* the story (slice 2): each written once, when it happens */
  | { type: 'beatPlayed'; id: string; job?: number; passage?: string }
  | { type: 'keyEarned'; rhythm: string }
  /** A Key earned while nothing Dan has reached is sealed: kept, and used on the next arrival that has one (D-079). */
  | { type: 'keyHeld' }
  | { type: 'keyUsed' }
  | { type: 'sealOpened'; seal: string }
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
  /** The re-entry nudge, off unless Dan turns it on (D-113) */
  | { type: 'nudgeChosen'; on: boolean }
  /** `via`: said to Siri, Shortcuts or the Action button; `ref`: that line's own id, so it is never added twice (D-113) */
  | { type: 'itemAdded'; id: string; name: string; via?: 'siri'; ref?: string }
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

/** One job placed on a day of the week plan (PLANNER.md). A forecast: moving it earns nothing and loses nothing. */
export interface PlanEntry { id: string; job: string; day: string; time?: string; }

export type FactOf<T extends FactBody['type']> = Fact & Extract<FactBody, { type: T }>;
