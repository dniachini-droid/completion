/* Where the screens can go. The argument is a job id (set, cant) or a fact's seq (step). */
export type Screen = 'today' | 'set' | 'delve' | 'step' | 'arrival' | 'cant' | 'proto';
export type Go = (to: Screen, arg?: string | number) => void;
