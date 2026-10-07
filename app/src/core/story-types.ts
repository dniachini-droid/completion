/**
 * The shapes of the story's authored content (DATA_MODEL.md → Authored content; the story job's build notes).
 * Types only: the content itself lives in `content/sealed/` and is never shown to Dan outside the game (D-015).
 *
 * Ids are stable once shipped. Every item says when it may appear: `w` (story week), `o` (order in that week,
 * where order matters) and `req` (ids that must have played first: beats, seals, marks guessed, finds).
 */

/** Where Dan is on the map: a stretch of the route (the story job's §0.3). */
export type StretchId = 'st-mouth' | 'st-hall' | 'st-salt' | 'st-camp' | 'st-stair' | 'st-flight2' | 'st-square'
  | 'st-water' | 'st-reading' | 'st-blast' | 'st-side' | 'st-lower';

export interface Stretch {
  id: StretchId;
  name: string;
  /** The story week it is first walked in. */
  w: number;
  /** Beats that must have played before it can be walked (e.g. the stair after the first word). */
  req: string[];
  /** The top, where Dan sleeps (D-154): once the way down is open, a place here plays as an evening at camp. */
  home?: boolean;
  /** The area it is shown as, when not its own (the Stair's two stretches are one area). */
  area?: StretchId;
  /** The area it opens off, on the Map (the Box Room and the Salt Gallery off the Lamp Hall). */
  parent?: StretchId;
  /** How Dan gets there from camp: one plain sentence, shown when he comes back to it from somewhere else. */
  wayIn?: string;
}

/** One piece of a record cut in the script: a sign, a carved picture, a name-ring, a hand-mark, or plain punctuation. */
export type Token =
  /** A sign (`mk-…` id) and the English it renders as here, in this record's grammar ("moved", "went in"). */
  | { s: string; en: string }
  /** A carved picture: rendered in brackets, e.g. "a lamb". */
  | { pic: string }
  /** A name-ring; `en` is what it renders as once readable (usually the name), else it shows as a ring. */
  | { ring: string; en?: string; s?: string[] }
  /** A hand-mark in a record's corner. */
  /* the Surveyor's own hook, and a maker's (the Reading Room's tablets), are neither his nor hers */
  | { hand: 'his' | 'hers' | 'rod' | 'other' | 'surveyor' | 'maker' }
  /** Punctuation or a joining word the rendering needs ("." ";" ":" "the"); shown only between rendered words. */
  | { p: string };

export interface RecordFragment {
  id: string;
  /** Whose life: the salt-cutter, the linguist, the surveyor, the tally's own hand, the chorus; the copyist, the
      engineer, the makers (weeks 9–14 on). */
  life: 'S' | 'L' | 'V' | 'K' | 'X' | 'C' | 'E' | 'B';
  /** Where it is, as the app says it (plain, physical). */
  where: string;
  /** Cut in the script (rendered from held signs) or written on paper in English (read at once). */
  kind: 'cut' | 'paper';
  /** For cut records: the lines of tokens. */
  cut?: Token[][];
  /** For paper: the text, in paragraphs. */
  paper?: string[];
  /** Her glossary sheet for this record, if she made one (her layer, shown in italics). */
  sheet?: string;
  /** The full authored rendering (every sign held): the check the computed rendering is tested against. Never shown before it's earned. */
  full?: string;
  /** Beat or seal ids where it is first shown. */
  firstShown: string[];
  w: number;
}

/** A sign (a mark): its shape, its guess, its confirmation (the story job's §6). */
export interface Mark {
  id: string;
  /** The English the story uses for it (never shown until held). */
  sign: string;
  w: number;
  /** Its elements, for drawing the glyph (SCRIPT §3), e.g. ['fork', 'cup']. */
  elements: string[];
  /** How the app describes its shape before it is held ("a hook, and a drop leaving it"). */
  shape: string;
  /** Recognised, not guessed (a ring, a hand-mark): no candidates. */
  recognised?: boolean;
  /** Where it is guessed: the beat or seal that offers the four candidates. */
  guessAt?: string;
  /** The carved picture beside it that is the clue ("a carved lamp"). */
  context?: string;
  /** Four candidates, the true one first (the app shuffles). */
  candidates?: string[];
  /** Candidates that count as right (the true one and its true second senses). */
  right?: string[];
  /** The one tempting wrong candidate that gets struck when the confirming beat plays. */
  tempting?: string;
  /** The beat that confirms it. */
  confirmedBy?: string;
  /** The line shown on the marks screen if the tempting guess is struck. */
  struck?: string;
  /** Its right candidates stay guesses after `confirmedBy` (that beat only strikes the tempting one; SCRIPT §7.6). */
  provisional?: boolean;
}

/** A word: marks cut into a blank with the rod, four taps (the story job's §7). */
export interface Word {
  id: string;
  marks: string[];
  /** The beat (a four-tap arrival) where it is cut. */
  beats: string[];
  req: string[];
}

/** What a beat, seal or find carries into the game when it plays. */
export interface Carries {
  records?: string[];
  /** Marks now in view to be guessed (the guess is offered on this beat's screen). */
  guess?: string[];
  /** Marks recognised or partially seen. */
  seen?: string[];
  /** A partial sign (a deep push): its element. */
  partial?: string;
  word?: string;
  /** A sealed thing now in view. */
  inView?: string[];
}

export type BeatKind =
  | 'morning'      /* the day-1 screen, before any job */
  | 'step'         /* after a main job, in order */
  | 'stepKey'      /* plays when its sealed thing opens: on the road in its turn, or by a Key (D-129) */
  | 'arrival'      /* a named place, at day complete */
  | 'arrivalKey'   /* a named place that plays when its sealed thing opens on the road (D-129) */
  | 'word'         /* a four-tap arrival: a word is cut */
  | 'deep'         /* a High day's deep push */
  | 'camp'         /* bedtime kept: the camp line, and something waiting in the morning */
  | 'close';       /* the week close's glimpse */

export interface Beat {
  id: string;
  kind: BeatKind;
  w: number;
  /** Order within the week (ARR table order). Steps wait for the nearest arrival above them in their week's table. */
  o: number;
  /** The place's name (arrivals). */
  name?: string;
  /** The line or scene (for words, the taps are in `taps`). */
  line?: string;
  taps?: string[];
  /** A small choice: two one-tap options; never gates progress. */
  choice?: [string, string];
  /** The sealed thing whose Key plays it (stepKey, arrivalKey). */
  seal?: string;
  /** What must have played first (beats, seals, marks guessed). */
  req: string[];
  stretch: StretchId;
  painting?: string;
  carries?: Carries;
  /** The morning after (camp beats): what is waiting (the author's note). */
  morning?: string;
  /** The record the morning after points back to (camp beats), when the note names one: the Morning screen's "read". */
  morningRecord?: string;
  /** Not played once this has (a camp line or a glimpse the story has moved past). */
  until?: string;
  /** Its own line says how Dan came here (a turn-off, or a return that says its way): no way-in line over it (D-154). */
  said?: boolean;
  /** A turn-off on the way back up: a return its own words give the reason for, labelled "On the way back" (D-154). */
  turnOff?: boolean;
  /** Read wherever Dan is (her notebook, carried with him from the Day 6 page): never held for an evening at camp, never
      captioned with an area (D-155). */
  portable?: boolean;
}

/** A named place with no fragment, added by the story job (a `pl-` id). Plays as an arrival. */
export interface PlaceBeat extends Beat { kind: 'arrival'; name: string; line: string; }

/** The route: for each story week, its five named places in arrival order. `k` marks a place that plays when its sealed
    row opens (on the road, in its turn, with no Key since D-129). */
export interface RouteWeek { w: number; places: { id: string; k?: boolean }[]; }

/** A sealed thing: a count that fills when it opens (the story job's §5; NICHES): a niche by a Key, a row on the road
    (D-129). */
export interface Seal {
  id: string;
  w: number;
  /** Key order within its week. */
  o: number;
  where: string;
  stretch: StretchId;
  /** The step that plays when it opens (a `b-` beat id if authored there; otherwise the composed line below). */
  beat?: string;
  line?: string;
  /** A place that plays when this row opens (a (K) arrival; on the road since D-129). */
  arrival?: string;
  /** No Key: seen in the open. */
  seenOnly?: boolean;
  carries?: Carries;
  /** Carries neither a sign nor a record: a surplus Key may open it a week early. */
  plain?: boolean;
  /** Opens on the road, in its turn, with no Key: its line is written for its own week (D-129). */
  road?: boolean;
  /** In something Dan carries (her notebook's pocket, her folder): opened wherever he is, never a trip back up (D-160). */
  portable?: boolean;
}

export interface Find {
  id: string;
  stretch: StretchId;
  w: number;
  req: string[];
  line: string;
  /** Stops being given once this has played. */
  until?: string;
  /** A told line (a `tl-` record) it carries. */
  told?: string;
}

export interface CampView {
  id: string;
  stretch: StretchId;
  w: number;
  req: string[];
  /** Stops being offered once this has played. */
  until?: string;
  name: string;
  line: string;
  /** The one thing to look at: a find, or a line re-surfaced. */
  look: { find: string } | { line: string };
}

export interface Passage { id: string; stretch: StretchId; req: string[]; until?: string; line: string; }

export interface Teaser { id: string; w: number; req: string[]; until?: string; line: string; }

export interface WeekCloseLine { id: string; w: number; req: string[]; line: string; }
export interface SoFar { id: string; /** The first week close of this month (by story week). */ w: number; lines: string[];
  /** The lines with their own ids and conditions: each shows only if its beats have played (the first five that have). */
  items?: WeekCloseLine[]; }
export interface OpenQuestion { id: string; w: number; line: string; /** The beats it needs. */ req?: string[]; /** Not asked once this has played. */ until?: string; }

export interface Story {
  version: string;
  stretches: Stretch[];
  route: RouteWeek[];
  beats: Beat[];
  seals: Seal[];
  records: RecordFragment[];
  marks: Mark[];
  words: Word[];
  finds: Find[];
  camps: CampView[];
  passages: Passage[];
  teasers: Teaser[];
  learned: WeekCloseLine[];
  soFar: SoFar[];
  openQuestions: OpenQuestion[];
}
