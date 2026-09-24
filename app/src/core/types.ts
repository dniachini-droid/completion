/**
 * The shapes the rules work with (DATA_MODEL.md). Content types only: no content lives here.
 */
import type { Moment } from './time';

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
}

/** A named place on the route (DATA_MODEL.md → Place). `at` is where it sits, in minutes of effort from the start. */
export interface Place {
  id: string;
  name: string;
  line: string;
  /** One plain sentence about the sealed thing ahead, shown on Today while this is where Dan stands. */
  ahead: string;
  painting: string;
  at: number;
}

/** A camp with a view: a short day's arrival, always with one thing to look at (BALANCING §4). */
export interface Camp { id: string; name: string; look: string; }

export interface Content {
  version: string;
  jobs: Job[];
  /** In order down the route; the first is where Dan starts. */
  route: Place[];
  camps: Camp[];
  /** Short lines shown as a step plays; reused in turn (the open route, BALANCING §5). */
  passages: string[];
  /** "I can't start": a line from just ahead, never new story (P4). */
  teasers: string[];
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
  | { type: 'seen'; what: 'step' | 'arrival'; ref: number }
  /* what the world gave (worked out once, then kept) */
  | { type: 'stepsGained'; minutes: number; job: string; run?: number }
  | { type: 'dayCompleted' }
  | { type: 'arrived'; kind: 'place' | 'camp'; id: string };

export type FactOf<T extends FactBody['type']> = Fact & Extract<FactBody, { type: T }>;
