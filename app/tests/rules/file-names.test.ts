/**
 * The TestFlight build runs on a Mac, whose disk ignores upper and lower case: `errands.svelte.ts` and `Errands.svelte`
 * are one file there, so `import './errands.svelte'` found the component and the build failed (2026-09-30). No two
 * files under src/ may differ only in case, nor may a `.svelte.ts` module share its import name with a component.
 */
import { describe, expect, it } from 'vitest';

/* every file under src/, by its path (listed by the bundler, never loaded) */
const files = () => Object.keys(import.meta.glob('../../src/**/*'));

describe('File names that a Mac can tell apart', () => {
  it('no two files under src/ are the same name but for case, or import as the same name', () => {
    const seen = new Map<string, string>(), clash: string[] = [];
    for (const f of files()) {
      for (const key of new Set([f.toLowerCase(), f.toLowerCase().replace(/\.svelte\.ts$/, '.svelte')])) {
        const was = seen.get(key);
        if (was && was !== f) clash.push(`${was} / ${f}`); else seen.set(key, f);
      }
    }
    expect(clash).toEqual([]);
  });
});
