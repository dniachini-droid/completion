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
import ppl_w5_worn_stepsUrl from '../../paint/places/img/pt-pl-w5-worn-steps.webp?url';
import ppl_w5_worn_stepsMeta from '../../paint/places/img/pt-pl-w5-worn-steps.json';
import pb_5_BUrl from '../../paint/places/img/pt-b-5.B.webp?url';
import pb_5_BMeta from '../../paint/places/img/pt-b-5.B.json';
import pb_7_CUrl from '../../paint/places/img/pt-b-7.C.webp?url';
import pb_7_CMeta from '../../paint/places/img/pt-b-7.C.json';
import pcv_15Url from '../../paint/places/img/pt-cv-15.webp?url';
import pcv_15Meta from '../../paint/places/img/pt-cv-15.json';
import pcv_03Url from '../../paint/places/img/pt-cv-03.webp?url';
import pcv_03Meta from '../../paint/places/img/pt-cv-03.json';
import pcv_04Url from '../../paint/places/img/pt-cv-04.webp?url';
import pcv_04Meta from '../../paint/places/img/pt-cv-04.json';
import pcv_05Url from '../../paint/places/img/pt-cv-05.webp?url';
import pcv_05Meta from '../../paint/places/img/pt-cv-05.json';
import pcv_07Url from '../../paint/places/img/pt-cv-07.webp?url';
import pcv_07Meta from '../../paint/places/img/pt-cv-07.json';
import pcv_08Url from '../../paint/places/img/pt-cv-08.webp?url';
import pcv_08Meta from '../../paint/places/img/pt-cv-08.json';
import pcv_09Url from '../../paint/places/img/pt-cv-09.webp?url';
import pcv_09Meta from '../../paint/places/img/pt-cv-09.json';
import ppl_w2_above_the_ringUrl from '../../paint/places/img/pt-pl-w2-above-the-ring.webp?url';
import ppl_w2_above_the_ringMeta from '../../paint/places/img/pt-pl-w2-above-the-ring.json';
import ppl_w2_box_by_the_cotUrl from '../../paint/places/img/pt-pl-w2-box-by-the-cot.webp?url';
import ppl_w2_box_by_the_cotMeta from '../../paint/places/img/pt-pl-w2-box-by-the-cot.json';
import pb_3_AUrl from '../../paint/places/img/pt-b-3.A.webp?url';
import pb_3_AMeta from '../../paint/places/img/pt-b-3.A.json';
import pb_3_BUrl from '../../paint/places/img/pt-b-3.B.webp?url';
import pb_3_BMeta from '../../paint/places/img/pt-b-3.B.json';
import pb_3_CUrl from '../../paint/places/img/pt-b-3.C.webp?url';
import pb_3_CMeta from '../../paint/places/img/pt-b-3.C.json';
import pb_4_AUrl from '../../paint/places/img/pt-b-4.A.webp?url';
import pb_4_AMeta from '../../paint/places/img/pt-b-4.A.json';
import pb_4_BUrl from '../../paint/places/img/pt-b-4.B.webp?url';
import pb_4_BMeta from '../../paint/places/img/pt-b-4.B.json';
import pb_2_BUrl from '../../paint/places/img/pt-b-2.B.webp?url';
import pb_2_BMeta from '../../paint/places/img/pt-b-2.B.json';
import ppl_w1_below_the_lampUrl from '../../paint/places/img/pt-pl-w1-below-the-lamp.webp?url';
import ppl_w1_below_the_lampMeta from '../../paint/places/img/pt-pl-w1-below-the-lamp.json';
import ppl_w3_far_endUrl from '../../paint/places/img/pt-pl-w3-far-end.webp?url';
import ppl_w3_far_endMeta from '../../paint/places/img/pt-pl-w3-far-end.json';
import pcv_06Url from '../../paint/places/img/pt-cv-06.webp?url';
import pcv_06Meta from '../../paint/places/img/pt-cv-06.json';
import pb_4_CUrl from '../../paint/places/img/pt-b-4.C.webp?url';
import pb_4_CMeta from '../../paint/places/img/pt-b-4.C.json';
import ppl_w3_salt_litUrl from '../../paint/places/img/pt-pl-w3-salt-lit.webp?url';
import ppl_w3_salt_litMeta from '../../paint/places/img/pt-pl-w3-salt-lit.json';
import ppl_w4_recess_above_the_cotUrl from '../../paint/places/img/pt-pl-w4-recess-above-the-cot.webp?url';
import ppl_w4_recess_above_the_cotMeta from '../../paint/places/img/pt-pl-w4-recess-above-the-cot.json';
import ppl_w6_wall_shelfUrl from '../../paint/places/img/pt-pl-w6-wall-shelf.webp?url';
import ppl_w6_wall_shelfMeta from '../../paint/places/img/pt-pl-w6-wall-shelf.json';
import pcv_01Url from '../../paint/places/img/pt-cv-01.webp?url';
import pcv_01Meta from '../../paint/places/img/pt-cv-01.json';
import ppl_w4_hollowUrl from '../../paint/places/img/pt-pl-w4-hollow.webp?url';
import ppl_w4_hollowMeta from '../../paint/places/img/pt-pl-w4-hollow.json';

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
  'pt-pl-w5-worn-steps': { url: ppl_w5_worn_stepsUrl, meta: ppl_w5_worn_stepsMeta, focus: .6 },
  'pt-b-5.B': { url: pb_5_BUrl, meta: pb_5_BMeta, focus: .47 },
  'pt-b-7.C': { url: pb_7_CUrl, meta: pb_7_CMeta, focus: .44 },
  'pt-cv-15': { url: pcv_15Url, meta: pcv_15Meta, focus: .49 },
  'pt-cv-03': { url: pcv_03Url, meta: pcv_03Meta, focus: .5 },
  'pt-cv-04': { url: pcv_04Url, meta: pcv_04Meta, focus: .5 },
  'pt-cv-05': { url: pcv_05Url, meta: pcv_05Meta, focus: .5 },
  'pt-cv-07': { url: pcv_07Url, meta: pcv_07Meta, focus: .5 },
  'pt-cv-08': { url: pcv_08Url, meta: pcv_08Meta, focus: .5 },
  'pt-cv-09': { url: pcv_09Url, meta: pcv_09Meta, focus: .5 },
  'pt-pl-w2-above-the-ring': { url: ppl_w2_above_the_ringUrl, meta: ppl_w2_above_the_ringMeta, focus: .5 },
  'pt-pl-w2-box-by-the-cot': { url: ppl_w2_box_by_the_cotUrl, meta: ppl_w2_box_by_the_cotMeta, focus: .5 },
  'pt-b-3.A': { url: pb_3_AUrl, meta: pb_3_AMeta, focus: .32 },
  'pt-b-3.B': { url: pb_3_BUrl, meta: pb_3_BMeta, focus: .5 },
  'pt-b-3.C': { url: pb_3_CUrl, meta: pb_3_CMeta, focus: .49 },
  'pt-b-4.A': { url: pb_4_AUrl, meta: pb_4_AMeta, focus: .48 },
  'pt-b-4.B': { url: pb_4_BUrl, meta: pb_4_BMeta, focus: .48 },
  'pt-b-2.B': { url: pb_2_BUrl, meta: pb_2_BMeta, focus: .48 },
  'pt-pl-w1-below-the-lamp': { url: ppl_w1_below_the_lampUrl, meta: ppl_w1_below_the_lampMeta, focus: .53 },
  'pt-pl-w3-far-end': { url: ppl_w3_far_endUrl, meta: ppl_w3_far_endMeta, focus: .27 },
  'pt-cv-06': { url: pcv_06Url, meta: pcv_06Meta, focus: .67 },
  'pt-b-4.C': { url: pb_4_CUrl, meta: pb_4_CMeta, focus: .5 },
  'pt-pl-w3-salt-lit': { url: ppl_w3_salt_litUrl, meta: ppl_w3_salt_litMeta, focus: .47 },
  'pt-pl-w4-recess-above-the-cot': { url: ppl_w4_recess_above_the_cotUrl, meta: ppl_w4_recess_above_the_cotMeta, focus: .39 },
  'pt-pl-w6-wall-shelf': { url: ppl_w6_wall_shelfUrl, meta: ppl_w6_wall_shelfMeta, focus: .5 },
  'pt-cv-01': { url: pcv_01Url, meta: pcv_01Meta, focus: .43 },
  'pt-pl-w4-hollow': { url: ppl_w4_hollowUrl, meta: ppl_w4_hollowMeta, focus: .43 },
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
