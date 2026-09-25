/**
 * The painting choice (PAINTING_BRIEFS.md; D-067): a place shows its own painting once it is painted from its brief,
 * else its stretch's stand-in. Ids only (D-015).
 */
import { describe, expect, it } from 'vitest';
import { PAINTED, STAND_IN, paintingOf } from '../../src/core/game';
import { paintings } from '../../src/ui/paintings';
import { content as C } from '../../src/content/world';

describe('paintings', () => {
  it('the painted places and the paintings the app carries are the same list', () => {
    const own = Object.keys(paintings).filter(k => k.startsWith('pt-')).map(k => k.slice(3)).sort();
    expect(own).toEqual([...PAINTED].sort());
  });
  it('every painted place is a real place or camp', () => {
    const ids = new Set([...C.story.beats.map(b => b.id), ...C.story.camps.map(k => k.id)]);
    for (const id of PAINTED) expect(ids.has(id), id).toBe(true);
  });
  it('every stand-in is carried', () => {
    for (const p of Object.values(STAND_IN)) expect(paintings[p], p).toBeDefined();
  });
  it('a painted place shows its own painting; any other, its stretch\'s stand-in', () => {
    for (const b of C.story.beats) {
      const p = paintingOf(b.id, b.stretch);
      expect(p).toBe(PAINTED.has(b.id) ? `pt-${b.id}` : STAND_IN[b.stretch]);
      expect(paintings[p], b.id).toBeDefined();
    }
    expect(paintingOf(null, 'st-hall')).toBe(STAND_IN['st-hall']);
  });
});
