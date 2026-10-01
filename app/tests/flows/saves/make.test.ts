/**
 * The saves some flows start from (a save further in than a fresh one, made with the game's own rules). Run only to make
 * them again, after the story or the rules change: MAKE_SAVES=1 npx vitest run tests/flows/saves/make.test.ts
 * Ids only (D-015): a save holds the story's ids, never its words.
 */
import { it } from 'vitest';
import { env, writeFileSync } from '../../review/node';
import { heavy } from '../../review/heavy';
import { see } from '../../../src/core/game';
import * as S from '../../../src/core/story';
import { content as C } from '../../../src/content/world';
import { SAVE_VERSION } from '../../../src/core/save';

const out = (name: string, facts: unknown[]) =>
  writeFileSync(new URL(`./${name}.json`, import.meta.url).pathname, JSON.stringify({ version: SAVE_VERSION, content: C.version, facts }) + '\n');

it.skipIf(!env.MAKE_SAVES)('keys: two hours a day for ten days, the Map never used, so Keys are kept and something can take one', () => {
  const { facts } = heavy(10, 2, true, 1, { noMap: true });
  const v = see(facts, C, facts[facts.length - 1].at), st = S.storyState(facts, C.story);
  if (!v.keys || !v.keyUse || !S.openable(C.story, st).length) throw new Error(`no Key to use: ${v.keys} kept, ${v.keyUse}`);
  out('keys', facts);
});

it.skipIf(!env.MAKE_SAVES)('word: three hours a day until the first word is reached, its screen not yet looked at', () => {
  const { facts } = heavy(24, 3, true, 1, { noMap: true });
  const at = facts.findIndex(f => f.type === 'arrived' && C.story.beats.find(b => b.id === f.id)?.kind === 'word');
  if (at < 0) throw new Error('no word reached');
  /* the save as it stood when the word was reached: that command's facts, and no look at it */
  const upTo = facts.filter((f, i) => i <= at || (f.at === facts[at].at && f.type !== 'seen'));
  out('word', upTo);
});

it.skipIf(!env.MAKE_SAVES)('months: four months of play, three hours a day, Keys used on the Map (the battery check on a played save, deep review U4)', () => {
  const { facts } = heavy(120, 3, true, 2);
  out('months', facts);
}, 300_000);
