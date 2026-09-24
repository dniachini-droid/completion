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
  /** …or once every 2 weeks. */
  every?: 2;
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
  | { type: 'jobBegun'; job: string; from: 'app' | 'record' }
  | { type: 'delveStarted'; job: string; minutes: number; count: number }
  | { type: 'breatherSkipped' }
  | { type: 'delveHeld' }
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
  | { type: 'sealOpened'; seal: string }
  | { type: 'findGiven'; id: string; why: 'avoided' | 'switching' | 'chamber' | 'camp' | 'surplus' | 'morning'; job?: number }
  | { type: 'recordShown'; id: string }
  | { type: 'storyWeekBegan'; w: number }
  /* Dan's small choices on a beat (never gating) and his guesses at marks */
  | { type: 'markGuessed'; mark: string; guess: string }
  | { type: 'choiceMade'; beat: string; pick: number }
  | { type: 'recordOpened'; id: string }
  /* the week and the gaps (slice 4): Dan's own rhythms and lines, the plan, bedtime, the week close, absence */
  | { type: 'rhythmSaved'; rhythm: Rhythm; job: Job }
  | { type: 'rhythmStopped'; id: string }
  | { type: 'itemAdded'; id: string; name: string }
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

/** One job placed on a day of the week plan (PLANNER.md). A forecast: moving it earns nothing and loses nothing. */
export interface PlanEntry { id: string; job: string; day: string; time?: string; }

export type FactOf<T extends FactBody['type']> = Fact & Extract<FactBody, { type: T }>;
