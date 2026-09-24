/* The baked paintings the app carries (TECH_DECISIONS.md → paintings). The kit's three invented samples stand in for places not yet painted. */
import wellUrl from '../../paint/view/img/sample-well-stair.webp?url';
import wellMeta from '../../paint/view/img/sample-well-stair.json';
import ribUrl from '../../paint/view/img/sample-rib-gallery.webp?url';
import ribMeta from '../../paint/view/img/sample-rib-gallery.json';
import poolUrl from '../../paint/view/img/sample-pool-dome.webp?url';
import poolMeta from '../../paint/view/img/sample-pool-dome.json';
/* the real places, painted from their briefs (sealed, D-015: ids only; core/game.ts PAINTED lists them) */
import b1AUrl from '../../paint/places/img/pt-b-1.A.webp?url';
import b1AMeta from '../../paint/places/img/pt-b-1.A.json';
import b1BUrl from '../../paint/places/img/pt-b-1.B.webp?url';
import b1BMeta from '../../paint/places/img/pt-b-1.B.json';
import b1CUrl from '../../paint/places/img/pt-b-1.C.webp?url';
import b1CMeta from '../../paint/places/img/pt-b-1.C.json';

export interface Painting { url: string; meta: unknown; focus: number; }
export const paintings: Record<string, Painting> = {
  'sample-well-stair': { url: wellUrl, meta: wellMeta, focus: .65 },
  'sample-rib-gallery': { url: ribUrl, meta: ribMeta, focus: .52 },
  'sample-pool-dome': { url: poolUrl, meta: poolMeta, focus: .62 },
  'pt-b-1.A': { url: b1AUrl, meta: b1AMeta, focus: .47 },
  'pt-b-1.B': { url: b1BUrl, meta: b1BMeta, focus: .49 },
  'pt-b-1.C': { url: b1CUrl, meta: b1CMeta, focus: .6 },
};

/** Frame a painting so its light sits in the open gap between the words (the morning mock-up lifts the lamp the same way).
    Scaled as little as possible, never so far that an edge shows. */
export function lift(p: Painting, want = .5): { s: number; t: number } {
  for (let s = 1; s <= 1.3001; s += .01) {
    const t = want - .5 - s * (p.focus - .5);
    if (Math.abs(t) <= (s - 1) / 2) return { s, t };
  }
  const s = 1.3; return { s, t: Math.sign(want - p.focus) * .15 };
}
