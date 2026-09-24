/* Where the screens can go. The argument is a job id (set, cant), a fact's seq (step, arrival) a record id (records),
   a mark id (marks), a calendar week (week, daybook) or a rhythm id (rhythms). */
export type Screen = 'today' | 'set' | 'delve' | 'step' | 'arrival' | 'cant' | 'proto' | 'map' | 'records' | 'marks' | 'stair'
  | 'camp' | 'morning' | 'welcome' | 'daybook' | 'week' | 'rhythms' | 'satchel';
export type Go = (to: Screen, arg?: string | number) => void;
