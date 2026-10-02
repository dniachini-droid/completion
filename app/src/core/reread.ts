/**
 * Re-reading made felt (MORNING-REPORT Part 3 #8): when a beat makes a mark known, the records Dan already found that
 * carry it now read differently. Which records, by id; the screen says how many and lights them until opened. It tells
 * nothing the mark itself doesn't: the records are Dan's own, and they only show the meaning he now holds. Pure.
 */
import { beatOf, markHeld, recordOf, type StoryState } from './story';
import type { Story } from './story-types';

/** The records found so far that carry a mark this beat made known, oldest first. */
export function rereadBy(s: Story, st: StoryState, beat: string): string[] {
  const known = new Set(s.marks.filter(m => m.confirmedBy === beat && markHeld(m, st)).map(m => m.id));
  if (!known.size) return [];
  /* a record this beat itself hands over is new, not re-read */
  const fresh = new Set(beatOf(s, beat)?.carries?.records ?? []);
  return st.records.filter(id => !fresh.has(id) && recordOf(s, id)?.cut?.some(l => l.some(tk => 's' in tk && typeof tk.s === 'string' && known.has(tk.s))));
}
