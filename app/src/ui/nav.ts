import { t, type CopyKey } from '../content/copy/en';
/* Where the screens can go. The argument is a job id (set, cant), a fact's seq (step, arrival) a record id (records),
   a mark id (marks), a calendar week (week, daybook) or a rhythm id (rhythms). */
export type Screen = 'today' | 'set' | 'delve' | 'step' | 'arrival' | 'cant' | 'proto' | 'map' | 'records' | 'marks' | 'stair'
  | 'morning' | 'welcome' | 'daybook' | 'week' | 'rhythms' | 'settings' | 'satchel' | 'errands' | 'opened';
/** 'back' returns to the screen this one was opened from (Today, if none): the arrow at the top left, the phone's
    own back (the browser's, or a swipe from the left edge in the app) (review 2, D-088). */
export type Go = (to: Screen | 'back', arg?: string | number) => void;
export interface Back { screen: Screen; arg?: string | number }
/** "Back to the Map", "Back to today", "Back to Tax return": one way of saying it everywhere (N polish). */
/* each screen's name as it reads inside a sentence: "Back to the Satchel", "Back to this week", never "Back to Satchel"
   or "Back to This week" (deep review C#12); a job's or a place's own name stays as it is */
const IN_SENTENCE: [CopyKey, CopyKey][] = [['nav.satchel', 'in.satchel'], ['records.nav', 'in.records'], ['marks.nav', 'in.marks'],
  ['rhythms.label', 'in.rhythms'], ['nav.daybook', 'in.daybook'], ['week.label', 'in.week'], ['week.next', 'in.weekNext'],
  ['week.later', 'in.weekLater'], ['set.label', 'in.set'], ['arrive.label', 'in.arrive'], ['errand.title', 'in.errand'],
  ['delve.label', 'in.delve'], ['morning.label', 'in.morning'], ['welcome.label', 'in.welcome'], ['nav.proto', 'in.proto']];
export const backTo = (label: string) => {
  if (label === t('map.nav')) return t('opened.toMap');
  if (label === t('delve.today')) return t('delve.toToday');
  const k = IN_SENTENCE.find(([name]) => t(name) === label);
  return t('arrive.back', { to: k ? t(k[1]) : label });
};
