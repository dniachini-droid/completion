/* Where the screens can go. The argument is a job id (set, cant), a fact's seq (step, arrival) or a record id (records). */
export type Screen = 'today' | 'set' | 'delve' | 'step' | 'arrival' | 'cant' | 'proto' | 'map' | 'records';
export type Go = (to: Screen, arg?: string | number) => void;
