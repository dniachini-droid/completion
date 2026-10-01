import { t } from '../content/copy/en';
/* Where the screens can go. The argument is a job id (set, cant), a fact's seq (step, arrival) a record id (records),
   a mark id (marks), a calendar week (week, daybook) or a rhythm id (rhythms). */
export type Screen = 'today' | 'set' | 'delve' | 'step' | 'arrival' | 'cant' | 'proto' | 'map' | 'records' | 'marks' | 'stair'
  | 'morning' | 'welcome' | 'daybook' | 'week' | 'rhythms' | 'settings' | 'satchel' | 'errands' | 'opened';
/** 'back' returns to the screen this one was opened from (Today, if none): the arrow at the top left, the phone's
    own back (the browser's, or a swipe from the left edge in the app) (review 2, D-088). */
export type Go = (to: Screen | 'back', arg?: string | number) => void;
export interface Back { screen: Screen; arg?: string | number }
/** "Back to the Map", "Back to today", "Back to Tax return": one way of saying it everywhere (N polish). */
export const backTo = (label: string) => label === t('map.nav') ? t('opened.toMap') : label === t('delve.today') ? t('delve.toToday') : t('arrive.back', { to: label });
