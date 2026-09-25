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
import b2AUrl from '../../paint/places/img/pt-b-2.A.webp?url';
import b2AMeta from '../../paint/places/img/pt-b-2.A.json';
import w2SmoothUrl from '../../paint/places/img/pt-pl-w2-smooth-place.webp?url';
import w2SmoothMeta from '../../paint/places/img/pt-pl-w2-smooth-place.json';
import w1NicheUrl from '../../paint/places/img/pt-pl-w1-pick-niche.webp?url';
import w1NicheMeta from '../../paint/places/img/pt-pl-w1-pick-niche.json';
import pb_5_AUrl from '../../paint/places/img/pt-b-5.A.webp?url';
import pb_5_AMeta from '../../paint/places/img/pt-b-5.A.json';
import ppl_w5_ledge_lipUrl from '../../paint/places/img/pt-pl-w5-ledge-lip.webp?url';
import ppl_w5_ledge_lipMeta from '../../paint/places/img/pt-pl-w5-ledge-lip.json';
import ppl_w5_second_landingUrl from '../../paint/places/img/pt-pl-w5-second-landing.webp?url';
import ppl_w5_second_landingMeta from '../../paint/places/img/pt-pl-w5-second-landing.json';
import pb_7_AUrl from '../../paint/places/img/pt-b-7.A.webp?url';
import pb_7_AMeta from '../../paint/places/img/pt-b-7.A.json';
import pb_7_BUrl from '../../paint/places/img/pt-b-7.B.webp?url';
import pb_7_BMeta from '../../paint/places/img/pt-b-7.B.json';
import ppl_w6_square_galleryUrl from '../../paint/places/img/pt-pl-w6-square-gallery.webp?url';
import ppl_w6_square_galleryMeta from '../../paint/places/img/pt-pl-w6-square-gallery.json';
import pb_6_BUrl from '../../paint/places/img/pt-b-6.B.webp?url';
import pb_6_BMeta from '../../paint/places/img/pt-b-6.B.json';
import ppl_w6_folderUrl from '../../paint/places/img/pt-pl-w6-folder.webp?url';
import ppl_w6_folderMeta from '../../paint/places/img/pt-pl-w6-folder.json';
import pcv_02Url from '../../paint/places/img/pt-cv-02.webp?url';
import pcv_02Meta from '../../paint/places/img/pt-cv-02.json';
import pcv_10Url from '../../paint/places/img/pt-cv-10.webp?url';
import pcv_10Meta from '../../paint/places/img/pt-cv-10.json';
import pcv_11Url from '../../paint/places/img/pt-cv-11.webp?url';
import pcv_11Meta from '../../paint/places/img/pt-cv-11.json';
import pcv_12Url from '../../paint/places/img/pt-cv-12.webp?url';
import pcv_12Meta from '../../paint/places/img/pt-cv-12.json';
import pcv_13Url from '../../paint/places/img/pt-cv-13.webp?url';
import pcv_13Meta from '../../paint/places/img/pt-cv-13.json';
import pcv_14Url from '../../paint/places/img/pt-cv-14.webp?url';
import pcv_14Meta from '../../paint/places/img/pt-cv-14.json';

export interface Painting { url: string; meta: unknown; focus: number; }
export const paintings: Record<string, Painting> = {
  'sample-well-stair': { url: wellUrl, meta: wellMeta, focus: .65 },
  'sample-rib-gallery': { url: ribUrl, meta: ribMeta, focus: .52 },
  'sample-pool-dome': { url: poolUrl, meta: poolMeta, focus: .62 },
  'pt-b-1.A': { url: b1AUrl, meta: b1AMeta, focus: .47 },
  'pt-b-1.B': { url: b1BUrl, meta: b1BMeta, focus: .49 },
  'pt-b-1.C': { url: b1CUrl, meta: b1CMeta, focus: .6 },
  'pt-b-2.A': { url: b2AUrl, meta: b2AMeta, focus: .48 },
  'pt-pl-w2-smooth-place': { url: w2SmoothUrl, meta: w2SmoothMeta, focus: .48 },
  'pt-pl-w1-pick-niche': { url: w1NicheUrl, meta: w1NicheMeta, focus: .5 },
  'pt-b-5.A': { url: pb_5_AUrl, meta: pb_5_AMeta, focus: .5 },
  'pt-pl-w5-ledge-lip': { url: ppl_w5_ledge_lipUrl, meta: ppl_w5_ledge_lipMeta, focus: .44 },
  'pt-pl-w5-second-landing': { url: ppl_w5_second_landingUrl, meta: ppl_w5_second_landingMeta, focus: .52 },
  'pt-b-7.A': { url: pb_7_AUrl, meta: pb_7_AMeta, focus: .38 },
  'pt-b-7.B': { url: pb_7_BUrl, meta: pb_7_BMeta, focus: .5 },
  'pt-pl-w6-square-gallery': { url: ppl_w6_square_galleryUrl, meta: ppl_w6_square_galleryMeta, focus: .49 },
  'pt-b-6.B': { url: pb_6_BUrl, meta: pb_6_BMeta, focus: .48 },
  'pt-pl-w6-folder': { url: ppl_w6_folderUrl, meta: ppl_w6_folderMeta, focus: .57 },
  'pt-cv-02': { url: pcv_02Url, meta: pcv_02Meta, focus: .58 },
  'pt-cv-10': { url: pcv_10Url, meta: pcv_10Meta, focus: .45 },
  'pt-cv-11': { url: pcv_11Url, meta: pcv_11Meta, focus: .4 },
  'pt-cv-12': { url: pcv_12Url, meta: pcv_12Meta, focus: .37 },
  'pt-cv-13': { url: pcv_13Url, meta: pcv_13Meta, focus: .61 },
  'pt-cv-14': { url: pcv_14Url, meta: pcv_14Meta, focus: .62 },
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
