/** The story, assembled (D-015: sealed; types in core/story-types.ts). */
import type { Story } from '../../core/story-types';
import { stretches, route } from './route';
import { beats } from './beats';
import { camps } from './camps';
import { seals } from './seals';
import { records } from './records';
import { marks } from './marks';
import { words } from './words';
import { finds } from './finds';
import { passages } from './passages';
import { teasers } from './teasers';
import { learned, soFar as soFarBare, soFarLines, openQuestions as questionsBare, openQuestionReq } from './weekclose';

const soFar = soFarBare.map(m => ({ ...m, items: soFarLines.filter(l => l.w === m.w) }));
const openQuestions = questionsBare.map(q => ({ ...q, req: openQuestionReq[q.id] ?? [] }));

/** One apostrophe on screen (deep review S#9): the files mix the straight one with the curly one the cut taps, the
    places' labels and the app's own words use, so every straight apostrophe inside or closing a word is made curly here.
    Ids carry none, and double quotes are left as they are. */
export const curl = (t: string): string => t.replace(/(\w)'(?=\w)/g, '$1’').replace(/s'(?!\w)/g, 's’');
function typeset<T>(o: T): T {
  if (typeof o === 'string') return curl(o) as T;
  if (Array.isArray(o)) return o.map(typeset) as T;
  if (o && typeof o === 'object') return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeset(v)])) as T;
  return o;
}

export const story: Story = typeset({
  version: 'mvp-1',
  stretches, route, beats, seals, records, marks, words, finds, camps, passages, teasers, learned, soFar, openQuestions,
});
