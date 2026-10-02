/* Where a job Dan already has is, in one line: the Satchel's box and the Week's + say the same (deep review B17). */
import { t, dayShort } from '../content/copy/en';
import type { satchelView } from '../core/game';
import type { Job } from '../core/types';

export function haveWords(j: Job, s: ReturnType<typeof satchelView>): string {
  if (s.recurring.some(x => x.id === j.id)) return t('satchel.have.recurring', { job: j.name });
  const waits = s.waiting.find(x => x.job.id === j.id);
  if (waits) return t('satchel.have.waiting', { job: j.name, day: dayShort(waits.until) });
  const coming = s.coming.find(x => x.job.id === j.id);
  if (coming) return t('satchel.have.coming', { job: j.name, day: dayShort(coming.day) });
  return t(s.noDay.some(x => x.id === j.id) ? 'satchel.have.noDay' : 'satchel.have.today', { job: j.name });
}
