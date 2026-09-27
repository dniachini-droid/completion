/**
 * The hostile review (docs/reviews/BREAK-IT.md): does any calendar-week timing still hold the story back (D-123: one
 * continuous story, unlocked by work, no weeks)? Since D-129 (option C) the road never waits on a Key: this probe checks
 * a heavy worker gets further than a light one, and that far fewer days end with no next place in reach than the review's
 * 19 of 21. Ids and numbers only.
 */
import { describe, expect, it } from 'vitest';
import { env, appendFileSync } from './node';
import { heavy } from './heavy';
import { aheadOfDan, outOfOrder } from '../rules/guards';

/** Places the minutes alone would reach (the first at 75, then every 150). */
const byMinutes = (walked: number) => walked < 75 ? 0 : Math.floor((walked - 75) / 150) + 1;

describe.skipIf(!env.REVIEW_SLOW)('pace: a heavy worker and the calendar (D-129)', () => {
  it('eight hours a day for three weeks: the road never waits on a Key, and far fewer days end with nowhere in reach', () => {
    const light = heavy(21, 3), big = heavy(21, 8);
    const report = (h: number, rows: typeof big.rows) => {
      const last = rows.at(-1)!, none = rows.filter(r => r.nextAt === null).length;
      const line = `${h} h a day for 21 days: ${last.walked} minutes walked, ${last.placesOnFoot} places on foot (${byMinutes(last.walked)} by minutes alone), `
        + `story week ${last.storyWeek}, ${none} of 21 days ended with no next place in reach`;
      console.log(line);
      if (env.PACE_OUT) appendFileSync(env.PACE_OUT, line + '\n' + rows.map(r => `${r.day} w${r.storyWeek} walked ${r.walked} next ${r.nextAt ?? 'none'} onFoot ${r.placesOnFoot} `
        + `keys ${r.keysThisWeek} held ${r.held} keyOnly ${r.keyOnly.join(',') || '-'} | ${r.why}`).join('\n') + '\n');
      return { last, none };
    };
    const l = report(3, light.rows), b = report(8, big.rows);
    /* the review: 19 of 21 days at eight hours ended with no next place in reach, all waiting on a Key */
    expect(b.none).toBeLessThanOrEqual(6);   /* 5 at D-129: each waits on a story step, one per finished job (D-123) */
    /* nothing on the road ever waits on a row only a Key opens */
    expect(big.rows.flatMap(r => r.keyOnly)).toEqual([]);
    expect(light.rows.flatMap(r => r.keyOnly)).toEqual([]);
    /* more work goes further into the story */
    expect(b.last.storyWeek).toBeGreaterThan(l.last.storyWeek);
    expect(b.last.placesOnFoot).toBeGreaterThan(l.last.placesOnFoot + 30);
    /* the minutes set the pace: within a few places of what they alone would reach (the review: 27 of 67) */
    expect(b.last.placesOnFoot).toBeGreaterThanOrEqual(byMinutes(b.last.walked) - 3);
    /* and the story keeps its order and its places (D-079) */
    for (const run of [light, big]) { expect(aheadOfDan(run.facts)).toEqual([]); expect(outOfOrder(run.facts)).toEqual([]); }
  }, 600_000);
  it('with no repeating jobs at all (no Keys but the floor), the road goes as far', () => {
    /* four jobs of Dan's own a day, as many as the repeating ones and the one-off above: a step plays per job done */
    const none = heavy(21, 8, false, 4), withKeys = heavy(21, 8);
    expect(none.facts.filter(f => f.type === 'keyEarned' && !f.rhythm.startsWith('floor:'))).toEqual([]);
    expect(none.rows.at(-1)!.storyWeek).toBeGreaterThanOrEqual(withKeys.rows.at(-1)!.storyWeek - 1);
    expect(none.rows.flatMap(r => r.keyOnly)).toEqual([]);
    expect(aheadOfDan(none.facts)).toEqual([]);
    expect(outOfOrder(none.facts)).toEqual([]);
  }, 600_000);
});
