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
import { learned, soFar, openQuestions } from './weekclose';

export const story: Story = {
  version: 'mvp-1',
  stretches, route, beats, seals, records, marks, words, finds, camps, passages, teasers, learned, soFar, openQuestions,
};
