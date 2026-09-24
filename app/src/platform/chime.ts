/* A small struck-bell sound, made in the browser (no file, no network). Placeholder until the delve's own
   sound exists (PROTOTYPE_NOTES.md). Browsers only play sound after a tap, so the first tap unlocks it. */
import type { Sound } from './types';

let ctx: AudioContext | null = null;

export const sound: Sound = {
  unlock() {
    try {
      ctx ??= new AudioContext();
      if (ctx.state === 'suspended') void ctx.resume();
    } catch { /* no audio: the ring still shows the end */ }
  },
  chime(kind) {
    if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime, base = kind === 'delveEnd' ? 523.25 : 659.25;
    const out = ctx.createGain(); out.gain.value = kind === 'delveEnd' ? .22 : .12; out.connect(ctx.destination);
    for (const [ratio, level, decay] of [[1, 1, 2.6], [2.01, .45, 1.6], [3.02, .2, 1.1], [4.17, .1, .7]] as const) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = base * ratio;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(level, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + decay);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + decay + .05);
    }
  },
};
